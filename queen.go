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
	moveKindEvaluators[MoveKind_QueenMove] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetCQueenMove() != nil
	}
	moveKindEvaluators[MoveKind_QueenCapture] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetCQueenCapture() != nil
	}
	moveKindEvaluators[MoveKind_KQueenBump] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetKQueenBump() != nil
	}
	moveKindEvaluators[MoveKind_KQueenNova] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetKQueenNova() != nil
	}
}

// Queen represents a queen chess piece.
type Queen struct {
	baseChessPiece
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
