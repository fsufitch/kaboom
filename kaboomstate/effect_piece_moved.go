package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type EffectPieceMoved struct {
	proto *kaboomproto.Effect__PieceMoved
}

func EffectPieceMovedFromProto(epm *kaboomproto.Effect__PieceMoved) EffectPieceMoved {
	return EffectPieceMoved{proto: epm}
}

func (epm EffectPieceMoved) ToProto() *kaboomproto.Effect__PieceMoved {
	return proto.CloneOf(epm.proto)
}

func (epm EffectPieceMoved) Clone() EffectPieceMoved {
	return EffectPieceMovedFromProto(epm.ToProto())
}

func (epm EffectPieceMoved) Validate() error {
	if epm.proto == nil {
		return fmt.Errorf("%w: piece moved data is null", ErrInvalidProto)
	}
	if epm.PieceUUID() == "" {
		return fmt.Errorf("%w: piece moved missing piece uuid", ErrInvalidProto)
	}
	if epm.proto.GetVector() == nil {
		return fmt.Errorf("%w: piece moved missing vector", ErrInvalidProto)
	}
	return VectorFromProto(epm.proto.GetVector()).Validate()
}

func (epm EffectPieceMoved) PieceUUID() string {
	return epm.proto.GetPieceUuid()
}

func (epm EffectPieceMoved) Vector() Vector {
	return VectorFromProto(epm.proto.GetVector())
}

func (epm EffectPieceMoved) Apply(game Game) (*Game, error) {
	if err := epm.Validate(); err != nil {
		return nil, err
	}

	next := game.Clone()
	_, pieceProto, found := findPieceProto(next.proto, epm.proto.GetPieceUuid())
	if !found {
		return nil, fmt.Errorf("effect piece_moved: piece %s not found", epm.proto.GetPieceUuid())
	}

	vector := VectorFromProto(epm.proto.GetVector())
	if err := movePieceOnBoard(pieceProto, vector); err != nil {
		return nil, fmt.Errorf("effect piece_moved: %w", err)
	}

	return &next, nil
}
