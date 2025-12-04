package kaboom

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

// ChessPiece represents a chess piece on the board (position, color, type). It is an interface implemented by each piece type.
type ChessPiece interface {
	Position() Position
	Color() Color
	Kind() ChessPieceKind
	Validate() error
}

// chessPieceTypeToKindMap maps kaboomproto.PieceType to ChessPieceKind. It is populated in the individual piece files.
var chessPieceTypeToKindMap = map[kaboomproto.PieceType]ChessPieceKind{}

type baseChessPiece struct {
	data *kaboomproto.ChessPiece
}

func (b baseChessPiece) Position() Position {
	return Position{data: b.data.GetPosition()}
}

func (b baseChessPiece) Color() Color {
	return Color(b.data.GetColor())
}

func protoChessPieceTypeToChessPieceKind(pt kaboomproto.PieceType) ChessPieceKind {
	kind, ok := chessPieceTypeToKindMap[pt]
	if !ok {
		return ChessPieceKindUnknown
	}
	return kind
}

func (b baseChessPiece) Kind() ChessPieceKind {
	return protoChessPieceTypeToChessPieceKind(b.data.GetType())
}

func (b baseChessPiece) validateBasePiece(label string, expected ChessPieceKind) error {
	if b.data == nil {
		return fmt.Errorf("invalid %s (data is nil): %w", label, ErrGameStateInvalid)
	}
	if expected != ChessPieceKindUnknown && b.Kind() != expected {
		return fmt.Errorf("invalid %s (wrong type): %w", label, ErrGameStateInvalid)
	}
	switch b.Color() {
	case ColorWhite, ColorBlack:
	default:
		return fmt.Errorf("invalid %s (color invalid): %w", label, ErrGameStateInvalid)
	}
	pos := b.Position()
	if err := pos.Validate(); err != nil {
		return fmt.Errorf("invalid %s (position): %w", label, err)
	}
	return nil
}

// ChessPieceKind represents the kind of chess piece (pawn, rook, knight, bishop, queen, king). The values are defined in each piece's specific file.
type ChessPieceKind string

const (
	ChessPieceKindUnknown ChessPieceKind = "piecekind.unknown"
)
