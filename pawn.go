package kaboom

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

const (
	ChessPieceKind_Pawn ChessPieceKind = "piecekind.pawn"
	MoveKind_CPawnMove  MoveKind       = "movekind.pawn.regular_move"
)

func init() {
	chessPieceTypeToKindMap[kaboomproto.PieceType_PAWN] = ChessPieceKind_Pawn
	moveKindEvaluators[MoveKind_CPawnMove] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetCPawnMove() != nil
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

// PawnRegularMove represents a regular move made by a pawn. It implements the Move interface.
type PawnRegularMove struct {
	baseMove
}

func NewPawnRegularMove(move *kaboomproto.KaboomMove) (PawnRegularMove, error) {
	prm := PawnRegularMove{}
	prm.data = move
	if prm.moveData() == nil {
		return PawnRegularMove{}, fmt.Errorf("move is not a pawn regular move")
	}

	return prm, nil
}

func (prm PawnRegularMove) moveData() *kaboomproto.C_PawnMove {
	return prm.data.GetCPawnMove()
}

func (prm PawnRegularMove) PiecePosition() Position {
	return Position{data: prm.moveData().From}
}

func (prm PawnRegularMove) Destination() Position {
	return Position{data: prm.moveData().To}
}

func (prm PawnRegularMove) PromotionKind() ChessPieceKind {
	promoType := prm.moveData().Promotion
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
	pk := PawnExplosion{}
	pk.data = move
	if pk.moveData() == nil {
		return PawnExplosion{}, fmt.Errorf("move is not a pawn explosion")
	}

	return pk, nil
}
func (pk PawnExplosion) moveData() *kaboomproto.K_PawnExplosion {
	return pk.data.GetKPawnExplosion()
}

func (pk PawnExplosion) PiecePosition() Position {
	return Position{data: pk.moveData().GetPosition()}
}
