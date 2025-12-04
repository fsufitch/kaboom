package kaboom

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

const (
	ChessPieceKind_Knight  ChessPieceKind = "piecekind.knight"
	MoveKind_KnightMove    MoveKind       = "movekind.knight.move"
	MoveKind_KnightCapture MoveKind       = "movekind.knight.capture"
	MoveKind_KKnightBump   MoveKind       = "movekind.knight.bump"
	MoveKind_KKnightStomp  MoveKind       = "movekind.knight.stomp"
)

func init() {
	chessPieceTypeToKindMap[kaboomproto.PieceType_KNIGHT] = ChessPieceKind_Knight
	moveKindEvaluators[MoveKind_KnightMove] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetCKnightMove() != nil
	}
	moveKindEvaluators[MoveKind_KnightCapture] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetCKnightCapture() != nil
	}
	moveKindEvaluators[MoveKind_KKnightBump] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetKKnightBump() != nil
	}
	moveKindEvaluators[MoveKind_KKnightStomp] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetKKnightStomp() != nil
	}
}

// Knight represents a knight chess piece.
type Knight struct {
	baseChessPiece
}

// NewKnight creates a new Knight instance from the given proto piece data.
func NewKnight(piece *kaboomproto.ChessPiece) (Knight, error) {
	base := baseChessPiece{data: piece}
	if base.Kind() != ChessPieceKind_Knight {
		return Knight{}, fmt.Errorf("piece is not a knight (kind=%s)", base.Kind())
	}
	return Knight{baseChessPiece: base}, nil
}

// KnightMove represents a classical knight move.
type KnightMove struct {
	baseMove
}

func NewKnightMove(move *kaboomproto.KaboomMove) (KnightMove, error) {
	km := KnightMove{}
	km.data = move
	if km.moveData() == nil {
		return KnightMove{}, fmt.Errorf("move is not a knight move")
	}
	return km, nil
}

func (km KnightMove) moveData() *kaboomproto.C_KnightMove {
	return km.data.GetCKnightMove()
}

func (km KnightMove) PiecePosition() Position {
	return Position{data: km.moveData().From}
}

func (km KnightMove) Destination() Position {
	return Position{data: km.moveData().To}
}

// KnightCapture represents a classical knight capture move.
type KnightCapture struct {
	baseMove
}

func NewKnightCapture(move *kaboomproto.KaboomMove) (KnightCapture, error) {
	kc := KnightCapture{}
	kc.data = move
	if kc.moveData() == nil {
		return KnightCapture{}, fmt.Errorf("move is not a knight capture")
	}
	return kc, nil
}

func (kc KnightCapture) moveData() *kaboomproto.C_KnightCapture {
	return kc.data.GetCKnightCapture()
}

func (kc KnightCapture) PiecePosition() Position {
	return Position{data: kc.moveData().From}
}

func (kc KnightCapture) Destination() Position {
	return Position{data: kc.moveData().To}
}

// KnightBump represents the Kaboom-specific knight bump move.
type KnightBump struct {
	baseMove
}

func NewKnightBump(move *kaboomproto.KaboomMove) (KnightBump, error) {
	kb := KnightBump{}
	kb.data = move
	if kb.moveData() == nil {
		return KnightBump{}, fmt.Errorf("move is not a knight bump")
	}
	return kb, nil
}

func (kb KnightBump) moveData() *kaboomproto.K_KnightBump {
	return kb.data.GetKKnightBump()
}

func (kb KnightBump) PiecePosition() Position {
	return Position{data: kb.moveData().From}
}

func (kb KnightBump) Destination() Position {
	return Position{data: kb.moveData().To}
}

func (kb KnightBump) BumpDirection() kaboomproto.K_KnightBump_BumpDirection {
	return kb.moveData().GetBumpDirection()
}

// KnightStomp represents the Kaboom-specific knight stomp move.
type KnightStomp struct {
	baseMove
}

func NewKnightStomp(move *kaboomproto.KaboomMove) (KnightStomp, error) {
	ks := KnightStomp{}
	ks.data = move
	if ks.moveData() == nil {
		return KnightStomp{}, fmt.Errorf("move is not a knight stomp")
	}
	return ks, nil
}

func (ks KnightStomp) moveData() *kaboomproto.K_KnightStomp {
	return ks.data.GetKKnightStomp()
}

func (ks KnightStomp) PiecePosition() Position {
	return Position{data: ks.moveData().From}
}

func (ks KnightStomp) Destination() Position {
	return Position{data: ks.moveData().To}
}
