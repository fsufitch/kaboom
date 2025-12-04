package kaboom

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

const (
	ChessPieceKind_Pawn     ChessPieceKind = "piecekind.pawn"
	MoveKind_PawnMove       MoveKind       = "movekind.pawn.move"
	MoveKind_PawnCapture    MoveKind       = "movekind.pawn.capture"
	MoveKind_KPawnBump      MoveKind       = "movekind.pawn.bump"
	MoveKind_KPawnExplosion MoveKind       = "movekind.pawn.explosion"
)

func init() {
	chessPieceTypeToKindMap[kaboomproto.PieceType_PAWN] = ChessPieceKind_Pawn
	moveKindEvaluators[MoveKind_PawnMove] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetCPawnMove() != nil
	}
	moveKindEvaluators[MoveKind_PawnCapture] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetCPawnCapture() != nil
	}
	moveKindEvaluators[MoveKind_KPawnBump] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetKPawnBump() != nil
	}
	moveKindEvaluators[MoveKind_KPawnExplosion] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetKPawnExplosion() != nil
	}
}

// Pawn represents a pawn chess piece.
type Pawn struct {
	baseChessPiece
}

// NewPawn creates a new Pawn from the given kaboomproto.ChessPiece. It returns an error if the piece is not a pawn.
func NewPawn(piece *kaboomproto.ChessPiece) (Pawn, error) {
	base := baseChessPiece{data: piece}
	if base.Kind() != ChessPieceKind_Pawn {
		return Pawn{}, fmt.Errorf("piece is not a pawn (kind=%s)", base.Kind())
	}
	return Pawn{baseChessPiece: base}, nil
}

// PawnMove represents a standard chess move made by a pawn. It implements the Move interface.
type PawnMove struct {
	baseMove
}

func NewPawnMove(move *kaboomproto.KaboomMove) (PawnMove, error) {
	prm := PawnMove{}
	prm.data = move
	if prm.moveData() == nil {
		return PawnMove{}, fmt.Errorf("move is not a pawn move")
	}

	return prm, nil
}

func (prm PawnMove) moveData() *kaboomproto.C_PawnMove {
	return prm.data.GetCPawnMove()
}

func (prm PawnMove) PiecePosition() Position {
	return Position{data: prm.moveData().From}
}

func (prm PawnMove) Destination() Position {
	return Position{data: prm.moveData().To}
}

func (prm PawnMove) PromotionKind() ChessPieceKind {
	promoType := prm.moveData().Promotion
	return protoChessPieceTypeToChessPieceKind(promoType)
}

// PawnCapture represents a capturing move made by a pawn. It implements the Move interface.
type PawnCapture struct {
	baseMove
}

func NewPawnCapture(move *kaboomproto.KaboomMove) (PawnCapture, error) {
	pc := PawnCapture{}
	pc.data = move
	if pc.moveData() == nil {
		return PawnCapture{}, fmt.Errorf("move is not a pawn capture")
	}
	return pc, nil
}

func (pc PawnCapture) moveData() *kaboomproto.C_PawnCapture {
	return pc.data.GetCPawnCapture()
}

func (pc PawnCapture) PiecePosition() Position {
	return Position{data: pc.moveData().From}
}

func (pc PawnCapture) Destination() Position {
	return Position{data: pc.moveData().To}
}

func (pc PawnCapture) PromotionKind() ChessPieceKind {
	promoType := pc.moveData().Promotion
	return protoChessPieceTypeToChessPieceKind(promoType)
}

// PawnBump represents a pawn bump move. It implements the Move interface.
type PawnBump struct {
	baseMove
}

func NewPawnBump(move *kaboomproto.KaboomMove) (PawnBump, error) {
	pb := PawnBump{}
	pb.data = move
	if pb.moveData() == nil {
		return PawnBump{}, fmt.Errorf("move is not a pawn bump")
	}

	return pb, nil
}

func (pb PawnBump) moveData() *kaboomproto.K_PawnBump {
	return pb.data.GetKPawnBump()
}

func (pb PawnBump) PiecePosition() Position {
	return Position{data: pb.moveData().From}
}

func (pb PawnBump) Destination() Position {
	return Position{data: pb.moveData().To}
}

func (pb PawnBump) PromotionKind() ChessPieceKind {
	promoType := pb.moveData().Promotion
	return protoChessPieceTypeToChessPieceKind(promoType)
}

// PawnExplosion represents a pawn explosion move. It implements the Move interface.
type PawnExplosion struct {
	baseMove
}

func NewPawnExplosion(move *kaboomproto.KaboomMove) (PawnExplosion, error) {
	pe := PawnExplosion{}
	pe.data = move
	if pe.moveData() == nil {
		return PawnExplosion{}, fmt.Errorf("move is not a pawn explosion")
	}

	return pe, nil
}
func (pe PawnExplosion) moveData() *kaboomproto.K_PawnExplosion {
	return pe.data.GetKPawnExplosion()
}

func (pe PawnExplosion) PiecePosition() Position {
	return Position{data: pe.moveData().GetPosition()}
}
