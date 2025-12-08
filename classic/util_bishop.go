package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func convertBishopAction(game kaboomstate.Game, move kaboomstate.Move, movement kaboomstate.PieceMovement, requireCapture bool) (*kaboomstate.Intent, error) {
	from := movement.From
	to := movement.To

	bishopPiece, err := findUniqueBoardPieceAtPosition(game, "", from)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if bishopPiece.Kind() != kaboomproto.PieceKind_BISHOP {
		return nil, fmt.Errorf("%w: no bishop at %s", kaboom.ErrInvalidMove, describePosition(from))
	}

	board, ok := game.FindBoard(bishopPiece.BoardUUID())
	if !ok {
		return nil, fmt.Errorf("%w: bishop references missing board %q", kaboom.ErrInvalidMove, bishopPiece.BoardUUID())
	}

	if err := ensureBishopMoveIsClear(game, board.UUID(), from, to); err != nil {
		return nil, err
	}

	targetPiece, occupied := pieceAtBoardPosition(game, board.UUID(), to)
	if requireCapture {
		if !occupied {
			return nil, fmt.Errorf("%w: capture square %s is empty", kaboom.ErrInvalidMove, describePosition(to))
		}
		if targetPiece.Color() == bishopPiece.Color() {
			return nil, fmt.Errorf("%w: cannot capture friendly piece at %s", kaboom.ErrInvalidMove, describePosition(to))
		}
	} else if occupied {
		return nil, fmt.Errorf("%w: destination %s is occupied", kaboom.ErrInvalidMove, describePosition(to))
	}

	actingPlayerUUID, ok := board.PlayerUUIDForColor(bishopPiece.Color())
	if !ok {
		return nil, fmt.Errorf("%w: no player assigned color %s on board %s", kaboom.ErrInvalidMove, bishopPiece.Color().String(), board.UUID())
	}

	if err := ensurePlayerTurn(game, board, actingPlayerUUID); err != nil {
		return nil, err
	}

	intent := kaboomstate.NewIntentPieceMove(
		kaboom.DefaultUUIDSource.NewUUID().String(),
		actingPlayerUUID,
		board.UUID(),
		move,
	)

	return &intent, nil
}

func ensureBishopMoveIsClear(game kaboomstate.Game, boardUUID string, from, to kaboomstate.Position) error {
	dRow := to.Row() - from.Row()
	dCol := to.Col() - from.Col()

	if dRow == 0 && dCol == 0 {
		return fmt.Errorf("%w: bishop must move to a different square", kaboom.ErrInvalidMove)
	}

	if absInt32(dRow) != absInt32(dCol) {
		return fmt.Errorf("%w: bishops move diagonally", kaboom.ErrInvalidMove)
	}

	step := kaboomstate.NewVector(signInt32(dRow), signInt32(dCol))

	for current := from.AddVector(step); !current.Equals(to); current = current.AddVector(step) {
		if _, blocked := pieceAtBoardPosition(game, boardUUID, current); blocked {
			return fmt.Errorf("%w: bishop path blocked at %s", kaboom.ErrInvalidMove, describePosition(current))
		}
	}

	return nil
}

func findUniqueBoardPieceAtPosition(game kaboomstate.Game, boardUUID string, position kaboomstate.Position) (kaboomstate.ChessPiece, error) {
	var foundPiece kaboomstate.ChessPiece
	found := false

	for _, piece := range game.Pieces() {
		if boardUUID != "" && piece.BoardUUID() != boardUUID {
			continue
		}

		if piece.Zone().Value() != kaboomproto.ZoneKind_ZONE_BOARD {
			continue
		}

		if piece.Position().Equals(position) {
			if found {
				return kaboomstate.ChessPiece{}, fmt.Errorf("multiple pieces found at %s", describePosition(position))
			}

			foundPiece = piece
			found = true
		}
	}

	if !found {
		return kaboomstate.ChessPiece{}, fmt.Errorf("no piece at %s", describePosition(position))
	}

	return foundPiece, nil
}

func pieceAtBoardPosition(game kaboomstate.Game, boardUUID string, position kaboomstate.Position) (kaboomstate.ChessPiece, bool) {
	for _, piece := range game.Pieces() {
		if piece.BoardUUID() != boardUUID {
			continue
		}

		if piece.Zone().Value() != kaboomproto.ZoneKind_ZONE_BOARD {
			continue
		}

		if piece.Position().Equals(position) {
			return piece, true
		}
	}

	return kaboomstate.ChessPiece{}, false
}

func describePosition(pos kaboomstate.Position) string {
	return fmt.Sprintf("row=%d col=%d", pos.Row(), pos.Col())
}

func absInt32(v int32) int32 {
	if v < 0 {
		return -v
	}
	return v
}

func signInt32(v int32) int32 {
	switch {
	case v > 0:
		return 1
	case v < 0:
		return -1
	default:
		return 0
	}
}
