package kaboom

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

// Color represents a player's color in chess.
type Color string

const (
	ColorUnknown Color = "unknown"
	ColorWhite   Color = "white"
	ColorBlack   Color = "black"
)

// BoardState represents the state of a chess board in the game (including its players, previous moves, etc).
type BoardState struct {
	data *kaboomproto.BoardState
}

func (b BoardState) WhitePlayerUUID() string {
	return b.data.GetWhitePlayerUuid()
}

func (b BoardState) BlackPlayerUUID() string {
	return b.data.GetBlackPlayerUuid()
}

func (b BoardState) ChessBoard() ChessBoard {
	return ChessBoard{data: b.data.GetChessBoard()}
}

func (b BoardState) MoveHistory() ([]Move, error) {
	if b.data == nil {
		return nil, fmt.Errorf("board state missing data: %w", ErrGameStateInvalid)
	}
	moves := []Move{}

	for i, moveData := range b.data.GetMoveHistory() {
		if moveData == nil {
			return nil, fmt.Errorf("move %d missing data: %w", i, ErrGameStateInvalid)
		}
		moveKind := kindOfMove(moveData)
		move, err := moveKindConstructors[moveKind](moveData)
		if err != nil {
			return nil, fmt.Errorf("invalid move data (kind=%s): %w", moveKind, err)
		}
		moves = append(moves, move)
	}

	return moves, nil
}

// Player represents a player in the chess game.
type Player struct {
	data  *kaboomproto.Player
	Color Color
}

func (p Player) Name() string {
	return p.data.GetName()
}

func (p Player) UUID() string {
	return p.data.GetUuid()
}

// ChessBoard is a representation of the chess board itself. This is a *snapshot* of a board state (it has no history).
type ChessBoard struct {
	data *kaboomproto.ChessBoard
}

func (cb ChessBoard) UUID() string {
	return cb.data.GetUuid()
}

func (cb ChessBoard) Name() string {
	return cb.data.GetName()
}

func (cb ChessBoard) Pieces() (pieces PieceSet, err error) {
	if cb.data == nil {
		return nil, fmt.Errorf("chess board missing data: %w", ErrGameStateInvalid)
	}
	pieces = PieceSet{}

	for _, pieceData := range cb.data.GetPieces() {
		pieceKind := protoChessPieceTypeToChessPieceKind(pieceData.GetType())
		var piece ChessPiece

		switch pieceKind {
		case ChessPieceKind_Pawn:
			if piece, err = NewPawn(pieceData); err != nil {
				return nil, err
			}
		case ChessPieceKind_Knight:
			if piece, err = NewKnight(pieceData); err != nil {
				return nil, err
			}
		case ChessPieceKind_Bishop:
			if piece, err = NewBishop(pieceData); err != nil {
				return nil, err
			}
		case ChessPieceKind_Rook:
			if piece, err = NewRook(pieceData); err != nil {
				return nil, err
			}
		case ChessPieceKind_Queen:
			if piece, err = NewQueen(pieceData); err != nil {
				return nil, err
			}
		case ChessPieceKind_King:
			if piece, err = NewKing(pieceData); err != nil {
				return nil, err
			}
		default:
			return nil, fmt.Errorf("unsupported piece kind: %s", pieceKind)
		}

		pieces = append(pieces, piece)
	}

	return pieces, nil
}

// PieceSet is a collection of chess pieces, with utilities.
type PieceSet []ChessPiece

func (ps PieceSet) ByPosition(pos Position) (ChessPiece, bool) {
	for _, piece := range ps {
		if piece.Position().Row() == pos.Row() && piece.Position().Col() == pos.Col() {
			return piece, true
		}
	}
	return nil, false
}

func (ps PieceSet) ByColor(color Color) PieceSet {
	filtered := PieceSet{}
	for _, piece := range ps {
		if piece.Color() == color {
			filtered = append(filtered, piece)
		}
	}
	return filtered
}
