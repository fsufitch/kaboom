package kaboom

import (
	"errors"
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

var ErrGameStateInvalid = errors.New("invalid game state")

func (tpg TwoPlayerGame) Validate() error {
	if tpg.data == nil {
		return fmt.Errorf("invalid two player game (data is nil): %w", ErrGameStateInvalid)
	}
	if len(tpg.data.GetBoards()) != 1 {
		return fmt.Errorf("invalid two player game (multiple boards): %w", ErrGameStateInvalid)
	}

	boardData := tpg.data.GetBoards()[0]
	if boardData == nil {
		return fmt.Errorf("invalid two player game (board missing data): %w", ErrGameStateInvalid)
	}
	board := BoardState{data: boardData}

	if err := board.Validate(); err != nil {
		return fmt.Errorf("invalid two player game (invalid board): %w", err)
	}

	players, err := tpg.Players()
	if err != nil {
		return fmt.Errorf("invalid players: %w", err)
	}
	if len(players) == 0 {
		return fmt.Errorf("invalid two player game (no players): %w", ErrGameStateInvalid)
	}

	playerIndex := map[string]struct{}{}
	for i, player := range players {
		if err := player.Validate(); err != nil {
			return fmt.Errorf("invalid player %d: %w", i, err)
		}
		playerIndex[player.UUID()] = struct{}{}
	}

	required := []struct {
		label string
		uuid  string
	}{
		{"white", board.WhitePlayerUUID()},
		{"black", board.BlackPlayerUUID()},
	}
	for _, entry := range required {
		if entry.uuid == "" {
			return fmt.Errorf("invalid board state (%s player uuid missing): %w", entry.label, ErrGameStateInvalid)
		}
		if _, ok := playerIndex[entry.uuid]; !ok {
			return fmt.Errorf("invalid board state (%s player uuid %s unknown): %w", entry.label, entry.uuid, ErrGameStateInvalid)
		}
	}

	return nil
}

func (bs BoardState) Validate() error {
	if bs.data == nil {
		return ErrGameStateInvalid
	}

	if err := bs.ChessBoard().Validate(); err != nil {
		return fmt.Errorf("invalid board state (board invalid): %w", err)
	}

	moves, err := bs.MoveHistory()
	if err != nil {
		return fmt.Errorf("invalid move history: %w", err)
	}

	for i, move := range moves {
		if err := validateMove(move); err != nil {
			return fmt.Errorf("invalid move %d: %w", i, err)
		}
	}

	return nil
}

func (p Player) Validate() error {
	if p.data == nil {
		return fmt.Errorf("invalid player (data is nil): %w", ErrGameStateInvalid)
	}
	if p.Name() == "" {
		return fmt.Errorf("invalid player (missing name): %w", ErrGameStateInvalid)
	}
	if p.UUID() == "" {
		return fmt.Errorf("invalid player (missing UUID): %w", ErrGameStateInvalid)
	}
	return nil
}

func (cb ChessBoard) Validate() error {
	if cb.data == nil {
		return fmt.Errorf("invalid chess board (data is nil): %w", ErrGameStateInvalid)
	}

	pieces, err := cb.Pieces()
	if err != nil {
		return fmt.Errorf("invalid chess board (pieces): %w", err)
	}
	seen := map[string]struct{}{}
	for i, piece := range pieces {
		if err := piece.Validate(); err != nil {
			return fmt.Errorf("invalid chess board (piece %d): %w", i, err)
		}
		pos := piece.Position()
		key := fmt.Sprintf("%d,%d", pos.Row(), pos.Col())
		if _, exists := seen[key]; exists {
			return fmt.Errorf("multiple pieces occupy %s: %w", pos, ErrGameStateInvalid)
		}
		seen[key] = struct{}{}
	}
	return nil
}

func validateMove(move Move) error {
	if move == nil {
		return fmt.Errorf("move is nil: %w", ErrGameStateInvalid)
	}
	if validator, ok := move.(interface{ Validate() error }); ok {
		if err := validator.Validate(); err != nil {
			return err
		}
	}
	pos := move.PiecePosition()
	if pos.data == nil {
		return fmt.Errorf("move missing position: %w", ErrGameStateInvalid)
	}
	if !pos.OnTheBoard() {
		return fmt.Errorf("move position off board: %w", ErrGameStateInvalid)
	}
	if move.Kind() == MoveKind_Unknown {
		return fmt.Errorf("move kind unknown: %w", ErrGameStateInvalid)
	}
	return nil
}

func validatePromotionPiece(pt kaboomproto.PieceType, label string) error {
	if pt == kaboomproto.PieceType_INVALID_PIECE {
		return nil
	}
	if pt == kaboomproto.PieceType_PAWN {
		return fmt.Errorf("%s invalid promotion piece: %w", label, ErrGameStateInvalid)
	}
	if _, ok := chessPieceTypeToKindMap[pt]; !ok {
		return fmt.Errorf("%s unknown promotion piece: %w", label, ErrGameStateInvalid)
	}
	return nil
}
