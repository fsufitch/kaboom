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

func (r Rook) Validate() error {
	return r.validateBasePiece("rook", ChessPieceKind_Rook)
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

func (rm RookMove) Validate() error {
	data := rm.moveData()
	if err := rm.validateBaseMove("rook move", data == nil, rm.PiecePosition); err != nil {
		return err
	}
	if err := rm.Destination().Validate(); err != nil {
		return fmt.Errorf("rook move (to): %w", err)
	}
	return nil
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

func (rc RookCapture) Validate() error {
	data := rc.moveData()
	if err := rc.validateBaseMove("rook capture", data == nil, rc.PiecePosition); err != nil {
		return err
	}
	if err := rc.Destination().Validate(); err != nil {
		return fmt.Errorf("rook capture (to): %w", err)
	}
	return nil
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

func (rb RookBump) Validate() error {
	data := rb.moveData()
	if err := rb.validateBaseMove("rook bump", data == nil, rb.PiecePosition); err != nil {
		return err
	}
	if err := rb.Destination().Validate(); err != nil {
		return fmt.Errorf("rook bump (to): %w", err)
	}
	return nil
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

func (rt RookTackle) Validate() error {
	data := rt.moveData()
	if err := rt.validateBaseMove("rook tackle", data == nil, rt.PiecePosition); err != nil {
		return err
	}
	if err := rt.Destination().Validate(); err != nil {
		return fmt.Errorf("rook tackle (to): %w", err)
	}
	return nil
}
