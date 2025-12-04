package kaboom

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

const (
	ChessPieceKind_Rook  ChessPieceKind = "piecekind.rook"
	MoveKind_RookMove    MoveKind       = "movekind.rook.move"
	MoveKind_RookCapture MoveKind       = "movekind.rook.capture"
	MoveKind_KRookBump   MoveKind       = "movekind.rook.bump"
	MoveKind_KRookTackle MoveKind       = "movekind.rook.tackle"
)

func init() {
	chessPieceTypeToKindMap[kaboomproto.PieceType_ROOK] = ChessPieceKind_Rook
	registerMoveConstructor(MoveKind_RookMove, NewRookMove)
	registerMoveConstructor(MoveKind_RookCapture, NewRookCapture)
	registerMoveConstructor(MoveKind_KRookBump, NewRookBump)
	registerMoveConstructor(MoveKind_KRookTackle, NewRookTackle)
}

// Rook represents a rook chess piece.
type Rook struct {
	baseChessPiece
}

// NewRook creates a new Rook from proto data.
func NewRook(piece *kaboomproto.ChessPiece) (Rook, error) {
	base := baseChessPiece{data: piece}
	if base.Kind() != ChessPieceKind_Rook {
		return Rook{}, fmt.Errorf("piece is not a rook (kind=%s)", base.Kind())
	}
	return Rook{baseChessPiece: base}, nil
}

// RookMove represents a rook move.
type RookMove struct {
	baseMove
}

func NewRookMove(move *kaboomproto.KaboomMove) (RookMove, error) {
	rm := RookMove{}
	rm.data = move
	if rm.moveData() == nil {
		return RookMove{}, fmt.Errorf("move is not a rook move")
	}
	return rm, nil
}

func (rm RookMove) moveData() *kaboomproto.C_RookMove {
	return rm.data.GetCRookMove()
}

func (rm RookMove) PiecePosition() Position {
	return Position{data: rm.moveData().From}
}

func (rm RookMove) Destination() Position {
	return Position{data: rm.moveData().To}
}

// RookCapture represents a rook capture move.
type RookCapture struct {
	baseMove
}

func NewRookCapture(move *kaboomproto.KaboomMove) (RookCapture, error) {
	rc := RookCapture{}
	rc.data = move
	if rc.moveData() == nil {
		return RookCapture{}, fmt.Errorf("move is not a rook capture")
	}
	return rc, nil
}

func (rc RookCapture) moveData() *kaboomproto.C_RookCapture {
	return rc.data.GetCRookCapture()
}

func (rc RookCapture) PiecePosition() Position {
	return Position{data: rc.moveData().From}
}

func (rc RookCapture) Destination() Position {
	return Position{data: rc.moveData().To}
}

// RookBump represents the Kaboom rook bump move.
type RookBump struct {
	baseMove
}

func NewRookBump(move *kaboomproto.KaboomMove) (RookBump, error) {
	rb := RookBump{}
	rb.data = move
	if rb.moveData() == nil {
		return RookBump{}, fmt.Errorf("move is not a rook bump")
	}
	return rb, nil
}

func (rb RookBump) moveData() *kaboomproto.K_RookBump {
	return rb.data.GetKRookBump()
}

func (rb RookBump) PiecePosition() Position {
	return Position{data: rb.moveData().From}
}

func (rb RookBump) Destination() Position {
	return Position{data: rb.moveData().To}
}

// BumpVector returns the horizontal or vertical direction the opponent is moved.
func (rb RookBump) BumpVector() Vector {
	return normalizedVectorBetween(rb.PiecePosition(), rb.Destination())
}

// RookTackle represents the Kaboom rook tackle move.
type RookTackle struct {
	baseMove
}

func NewRookTackle(move *kaboomproto.KaboomMove) (RookTackle, error) {
	rt := RookTackle{}
	rt.data = move
	if rt.moveData() == nil {
		return RookTackle{}, fmt.Errorf("move is not a rook tackle")
	}
	return rt, nil
}

func (rt RookTackle) moveData() *kaboomproto.K_RookTackle {
	return rt.data.GetKRookTackle()
}

func (rt RookTackle) PiecePosition() Position {
	return Position{data: rt.moveData().From}
}

func (rt RookTackle) Destination() Position {
	return Position{data: rt.moveData().To}
}

// BumpVector returns the two-square displacement applied to the opponent.
func (rt RookTackle) BumpVector() Vector {
	dir := normalizedVectorBetween(rt.PiecePosition(), rt.Destination())
	return Vector{
		RowDelta: dir.RowDelta * 2,
		ColDelta: dir.ColDelta * 2,
	}
}
