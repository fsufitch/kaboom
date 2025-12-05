package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type Move struct {
	proto *kaboomproto.KaboomMove
}

func MoveFromProto(m *kaboomproto.KaboomMove) Move {
	return Move{proto: m}
}

func (m Move) ToProto() *kaboomproto.KaboomMove {
	return proto.CloneOf(m.proto)
}

func (m Move) Clone() Move {
	return MoveFromProto(m.ToProto())
}

func (m Move) Validate() error {
	if m.proto == nil {
		return fmt.Errorf("%w: move data is null", ErrInvalidProto)
	}
	return nil
}

type MoveKind string

const MoveKind_Unknown MoveKind = "move.unknown"

const (
	MoveKind_PawnMove      MoveKind = "move.pawn.c_move"
	MoveKind_PawnCapture   MoveKind = "move.pawn.c_capture"
	MoveKind_PawnBump      MoveKind = "move.pawn.k_bump"
	MoveKind_PawnExplosion MoveKind = "move.pawn.k_explosion"
)

func (m Move) AsPawnMove() *kaboomproto.C_PawnMove {
	return proto.CloneOf(m.proto.GetCPawnMove())
}
func (m Move) AsPawnCapture() *kaboomproto.C_PawnCapture {
	return proto.CloneOf(m.proto.GetCPawnCapture())
}
func (m Move) AsPawnBump() *kaboomproto.K_PawnBump {
	return proto.CloneOf(m.proto.GetKPawnBump())
}
func (m Move) AsPawnExplosion() *kaboomproto.K_PawnExplosion {
	return proto.CloneOf(m.proto.GetKPawnExplosion())
}

const (
	MoveKind_KnightMove    MoveKind = "move.knight.c_move"
	MoveKind_KnightCapture MoveKind = "move.knight.c_capture"
	MoveKind_KnightBump    MoveKind = "move.knight.k_bump"
	MoveKind_KnightStomp   MoveKind = "move.knight.k_stomp"
)

func (m Move) AsKnightMove() *kaboomproto.C_KnightMove {
	return proto.CloneOf(m.proto.GetCKnightMove())
}
func (m Move) AsKnightCapture() *kaboomproto.C_KnightCapture {
	return proto.CloneOf(m.proto.GetCKnightCapture())
}
func (m Move) AsKnightBump() *kaboomproto.K_KnightBump {
	return proto.CloneOf(m.proto.GetKKnightBump())
}
func (m Move) AsKnightStomp() *kaboomproto.K_KnightStomp {
	return proto.CloneOf(m.proto.GetKKnightStomp())
}

const (
	MoveKind_BishopMove    MoveKind = "move.bishop.c_move"
	MoveKind_BishopCapture MoveKind = "move.bishop.c_capture"
	MoveKind_BishopBump    MoveKind = "move.bishop.k_bump"
	MoveKind_BishopSnipe   MoveKind = "move.bishop.k_snipe"
)

func (m Move) AsBishopMove() *kaboomproto.C_BishopMove {
	return proto.CloneOf(m.proto.GetCBishopMove())
}
func (m Move) AsBishopCapture() *kaboomproto.C_BishopCapture {
	return proto.CloneOf(m.proto.GetCBishopCapture())
}
func (m Move) AsBishopBump() *kaboomproto.K_BishopBump {
	return proto.CloneOf(m.proto.GetKBishopBump())
}
func (m Move) AsBishopSnipe() *kaboomproto.K_BishopSnipe {
	return proto.CloneOf(m.proto.GetKBishopSnipe())
}

const (
	MoveKind_RookMove    MoveKind = "move.rook.c_move"
	MoveKind_RookCapture MoveKind = "move.rook.c_capture"
	MoveKind_RookBump    MoveKind = "move.rook.k_bump"
	MoveKind_RookTackle  MoveKind = "move.rook.k_tackle"
)

func (m Move) AsRookMove() *kaboomproto.C_RookMove {
	return proto.CloneOf(m.proto.GetCRookMove())
}
func (m Move) AsRookCapture() *kaboomproto.C_RookCapture {
	return proto.CloneOf(m.proto.GetCRookCapture())
}
func (m Move) AsRookBump() *kaboomproto.K_RookBump {
	return proto.CloneOf(m.proto.GetKRookBump())
}
func (m Move) AsRookTackle() *kaboomproto.K_RookTackle {
	return proto.CloneOf(m.proto.GetKRookTackle())
}

const (
	MoveKind_QueenMove    MoveKind = "move.queen.c_move"
	MoveKind_QueenCapture MoveKind = "move.queen.c_capture"
	MoveKind_QueenBump    MoveKind = "move.queen.k_bump"
	MoveKind_QueenNova    MoveKind = "move.queen.k_nova"
)

func (m Move) AsQueenMove() *kaboomproto.C_QueenMove {
	return proto.CloneOf(m.proto.GetCQueenMove())
}
func (m Move) AsQueenCapture() *kaboomproto.C_QueenCapture {
	return proto.CloneOf(m.proto.GetCQueenCapture())
}
func (m Move) AsQueenBump() *kaboomproto.K_QueenBump {
	return proto.CloneOf(m.proto.GetKQueenBump())
}
func (m Move) AsQueenNova() *kaboomproto.K_QueenNova {
	return proto.CloneOf(m.proto.GetKQueenNova())
}

const (
	MoveKind_KingMove    MoveKind = "move.king.c_move"
	MoveKind_KingCapture MoveKind = "move.king.c_capture"
	MoveKind_KingBump    MoveKind = "move.king.k_bump"
	MoveKind_KingControl MoveKind = "move.king.k_control"
)

func (m Move) AsKingMove() *kaboomproto.C_KingMove {
	return proto.CloneOf(m.proto.GetCKingMove())
}
func (m Move) AsKingCapture() *kaboomproto.C_KingCapture {
	return proto.CloneOf(m.proto.GetCKingCapture())
}
func (m Move) AsKingBump() *kaboomproto.K_KingBump {
	return proto.CloneOf(m.proto.GetKKingBump())
}
func (m Move) AsKingControl() *kaboomproto.K_KingControl {
	return proto.CloneOf(m.proto.GetKKingControl())
}

func (m Move) Kind() MoveKind {
	switch m.proto.GetMove().(type) {
	case *kaboomproto.KaboomMove_CPawnMove:
		return MoveKind_PawnMove
	case *kaboomproto.KaboomMove_CPawnCapture:
		return MoveKind_PawnCapture
	case *kaboomproto.KaboomMove_KPawnBump:
		return MoveKind_PawnBump
	case *kaboomproto.KaboomMove_KPawnExplosion:
		return MoveKind_PawnExplosion
	case *kaboomproto.KaboomMove_CKnightMove:
		return MoveKind_KnightMove
	case *kaboomproto.KaboomMove_CKnightCapture:
		return MoveKind_KnightCapture
	case *kaboomproto.KaboomMove_KKnightBump:
		return MoveKind_KnightBump
	case *kaboomproto.KaboomMove_KKnightStomp:
		return MoveKind_KnightStomp
	case *kaboomproto.KaboomMove_CBishopMove:
		return MoveKind_BishopMove
	case *kaboomproto.KaboomMove_CBishopCapture:
		return MoveKind_BishopCapture
	case *kaboomproto.KaboomMove_KBishopBump:
		return MoveKind_BishopBump
	case *kaboomproto.KaboomMove_KBishopSnipe:
		return MoveKind_BishopSnipe
	case *kaboomproto.KaboomMove_CRookMove:
		return MoveKind_RookMove
	case *kaboomproto.KaboomMove_CRookCapture:
		return MoveKind_RookCapture
	case *kaboomproto.KaboomMove_KRookBump:
		return MoveKind_RookBump
	case *kaboomproto.KaboomMove_KRookTackle:
		return MoveKind_RookTackle
	case *kaboomproto.KaboomMove_CQueenMove:
		return MoveKind_QueenMove
	case *kaboomproto.KaboomMove_CQueenCapture:
		return MoveKind_QueenCapture
	case *kaboomproto.KaboomMove_KQueenBump:
		return MoveKind_QueenBump
	case *kaboomproto.KaboomMove_KQueenNova:
		return MoveKind_QueenNova
	case *kaboomproto.KaboomMove_CKingMove:
		return MoveKind_KingMove
	case *kaboomproto.KaboomMove_CKingCapture:
		return MoveKind_KingCapture
	case *kaboomproto.KaboomMove_KKingBump:
		return MoveKind_KingBump
	case *kaboomproto.KaboomMove_KKingControl:
		return MoveKind_KingControl
	default:
		return MoveKind_Unknown
	}
}
