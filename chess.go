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

func (b BoardState) WhitePlayer() Player {
	return Player{data: b.data.GetWhitePlayer(), Color: ColorWhite}
}

func (b BoardState) BlackPlayer() Player {
	return Player{data: b.data.GetBlackPlayer(), Color: ColorBlack}
}

func (b BoardState) ChessBoard() ChessBoard {
	return ChessBoard{data: b.data.GetChessBoard()}
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

// Position represents a position on the chess board.
type Position struct {
	data *kaboomproto.Position
}

func (p Position) Row() int32 {
	return p.data.GetRow()
}

func (p Position) Col() int32 {
	return p.data.GetCol()
}

func (p Position) OnTheBoard() bool {
	row := p.Row()
	col := p.Col()
	return row >= 0 && row < 8 && col >= 0 && col < 8
}

func (p Position) String() string {
	return string(rune('a'+p.Col())) + fmt.Sprintf("%d", p.Row()+1)
}
