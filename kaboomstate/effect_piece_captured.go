package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type EffectPieceCaptured struct {
	proto *kaboomproto.Effect__PieceCaptured
}

func EffectPieceCapturedFromProto(epc *kaboomproto.Effect__PieceCaptured) EffectPieceCaptured {
	return EffectPieceCaptured{proto: epc}
}

func (epc EffectPieceCaptured) ToProto() *kaboomproto.Effect__PieceCaptured {
	return proto.CloneOf(epc.proto)
}

func (epc EffectPieceCaptured) Clone() EffectPieceCaptured {
	return EffectPieceCapturedFromProto(epc.ToProto())
}

func (epc EffectPieceCaptured) Validate() error {
	if epc.proto == nil {
		return fmt.Errorf("%w: piece captured data is null", ErrInvalidProto)
	}
	if epc.PieceUUID() == "" {
		return fmt.Errorf("%w: piece captured missing piece uuid", ErrInvalidProto)
	}
	return nil
}

func (epc EffectPieceCaptured) PieceUUID() string {
	return epc.proto.GetPieceUuid()
}

func (epc EffectPieceCaptured) Apply(game Game) (*Game, error) {
	if err := epc.Validate(); err != nil {
		return nil, err
	}

	next := game.Clone()
	_, pieceProto, found := findPieceProto(next.proto, epc.proto.GetPieceUuid())
	if !found {
		return nil, fmt.Errorf("effect piece_captured: piece %s not found", epc.proto.GetPieceUuid())
	}

	if pieceProto.GetZone() != kaboomproto.ZoneKind_ZONE_BOARD {
		return nil, fmt.Errorf("effect piece_captured: piece %s is not on the board (zone=%s)", epc.proto.GetPieceUuid(), pieceProto.GetZone().String())
	}

	pieceProto.Zone = kaboomproto.ZoneKind_ZONE_GRAVEYARD
	return &next, nil
}
