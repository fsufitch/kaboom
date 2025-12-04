package kaboom

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

const (
	ChessPieceKind_Queen  ChessPieceKind = "piecekind.queen"
	MoveKind_QueenMove    MoveKind       = "movekind.queen.move"
	MoveKind_QueenCapture MoveKind       = "movekind.queen.capture"
	MoveKind_KQueenBump   MoveKind       = "movekind.queen.bump"
	MoveKind_KQueenNova   MoveKind       = "movekind.queen.nova"
)

func init() {
	chessPieceTypeToKindMap[kaboomproto.PieceType_QUEEN] = ChessPieceKind_Queen

	registerMoveConstructor(MoveKind_QueenMove, NewQueenMove)
	registerMoveConstructor(MoveKind_QueenCapture, NewQueenCapture)
	registerMoveConstructor(MoveKind_KQueenBump, NewQueenBump)
	registerMoveConstructor(MoveKind_KQueenNova, NewQueenNova)
}

// Queen represents a queen chess piece.
type Queen struct {
	baseChessPiece
}

func (q Queen) Validate() error {
	return q.validateBasePiece("queen", ChessPieceKind_Queen)
}

// NewQueen creates a new Queen from proto data.
func NewQueen(piece *kaboomproto.ChessPiece) (Queen, error) {
	base := baseChessPiece{data: piece}
	if base.Kind() != ChessPieceKind_Queen {
		return Queen{}, fmt.Errorf("piece is not a queen (kind=%s)", base.Kind())
	}
	return Queen{baseChessPiece: base}, nil
}

// QueenMove represents a classical queen move.
type QueenMove struct {
	baseMove
}

func NewQueenMove(move *kaboomproto.KaboomMove) (QueenMove, error) {
	qm := QueenMove{}
	qm.data = move
	if qm.moveData() == nil {
		return QueenMove{}, fmt.Errorf("move is not a queen move")
	}
	return qm, nil
}

func (qm QueenMove) moveData() *kaboomproto.C_QueenMove {
	return qm.data.GetCQueenMove()
}

func (qm QueenMove) PiecePosition() Position {
	return Position{data: qm.moveData().From}
}

func (qm QueenMove) Destination() Position {
	return Position{data: qm.moveData().To}
}

func (qm QueenMove) Validate() error {
	data := qm.moveData()
	if err := qm.validateBaseMove("queen move", data == nil, qm.PiecePosition); err != nil {
		return err
	}
	if err := qm.Destination().Validate(); err != nil {
		return fmt.Errorf("queen move (to): %w", err)
	}
	return nil
}

// QueenCapture represents a queen capture move.
type QueenCapture struct {
	baseMove
}

func NewQueenCapture(move *kaboomproto.KaboomMove) (QueenCapture, error) {
	qc := QueenCapture{}
	qc.data = move
	if qc.moveData() == nil {
		return QueenCapture{}, fmt.Errorf("move is not a queen capture")
	}
	return qc, nil
}

func (qc QueenCapture) moveData() *kaboomproto.C_QueenCapture {
	return qc.data.GetCQueenCapture()
}

func (qc QueenCapture) PiecePosition() Position {
	return Position{data: qc.moveData().From}
}

func (qc QueenCapture) Destination() Position {
	return Position{data: qc.moveData().To}
}

func (qc QueenCapture) Validate() error {
	data := qc.moveData()
	if err := qc.validateBaseMove("queen capture", data == nil, qc.PiecePosition); err != nil {
		return err
	}
	if err := qc.Destination().Validate(); err != nil {
		return fmt.Errorf("queen capture (to): %w", err)
	}
	return nil
}

// QueenBump represents the Kaboom queen bump move.
type QueenBump struct {
	baseMove
}

func NewQueenBump(move *kaboomproto.KaboomMove) (QueenBump, error) {
	qb := QueenBump{}
	qb.data = move
	if qb.moveData() == nil {
		return QueenBump{}, fmt.Errorf("move is not a queen bump")
	}
	return qb, nil
}

func (qb QueenBump) moveData() *kaboomproto.K_QueenBump {
	return qb.data.GetKQueenBump()
}

func (qb QueenBump) PiecePosition() Position {
	return Position{data: qb.moveData().From}
}

func (qb QueenBump) Destination() Position {
	return Position{data: qb.moveData().To}
}

func (qb QueenBump) Validate() error {
	data := qb.moveData()
	if err := qb.validateBaseMove("queen bump", data == nil, qb.PiecePosition); err != nil {
		return err
	}
	if err := qb.Destination().Validate(); err != nil {
		return fmt.Errorf("queen bump (to): %w", err)
	}
	return nil
}

// BumpVector returns the direction the target piece is pushed.
func (qb QueenBump) BumpVector() Vector {
	return normalizedVectorBetween(qb.PiecePosition(), qb.Destination())
}

// QueenNova represents the Kaboom queen nova move.
type QueenNova struct {
	baseMove
}

func NewQueenNova(move *kaboomproto.KaboomMove) (QueenNova, error) {
	qn := QueenNova{}
	qn.data = move
	if qn.moveData() == nil {
		return QueenNova{}, fmt.Errorf("move is not a queen nova")
	}
	return qn, nil
}

func (qn QueenNova) moveData() *kaboomproto.K_QueenNova {
	return qn.data.GetKQueenNova()
}

func (qn QueenNova) PiecePosition() Position {
	return Position{data: qn.moveData().GetPosition()}
}

func (qn QueenNova) Validate() error {
	return qn.validateBaseMove("queen nova", qn.moveData() == nil, qn.PiecePosition)
}
