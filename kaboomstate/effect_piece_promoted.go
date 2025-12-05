package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type EffectPiecePromoted struct {
	proto *kaboomproto.Effect__PiecePromoted
}

func EffectPiecePromotedFromProto(epp *kaboomproto.Effect__PiecePromoted) EffectPiecePromoted {
	return EffectPiecePromoted{proto: epp}
}

func (epp EffectPiecePromoted) ToProto() *kaboomproto.Effect__PiecePromoted {
	return proto.CloneOf(epp.proto)
}

func (epp EffectPiecePromoted) Clone() EffectPiecePromoted {
	return EffectPiecePromotedFromProto(epp.ToProto())
}

func (epp EffectPiecePromoted) Validate() error {
	if epp.proto == nil {
		return fmt.Errorf("%w: piece promoted data is null", ErrInvalidProto)
	}
	if epp.PieceUUID() == "" {
		return fmt.Errorf("%w: piece promoted missing piece uuid", ErrInvalidProto)
	}
	if epp.ToKind() == kaboomproto.PieceKind_INVALID_PIECE {
		return fmt.Errorf("%w: piece promoted has invalid target kind", ErrInvalidProto)
	}
	return nil
}

func (epp EffectPiecePromoted) PieceUUID() string {
	return epp.proto.GetPieceUuid()
}

func (epp EffectPiecePromoted) ToKind() kaboomproto.PieceKind {
	return epp.proto.GetToKind()
}

func (epp EffectPiecePromoted) Apply(game Game) (*Game, error) {
	if err := epp.Validate(); err != nil {
		return nil, err
	}

	next := game.Clone()
	_, pieceProto, found := findPieceProto(next.proto, epp.proto.GetPieceUuid())
	if !found {
		return nil, fmt.Errorf("effect piece_promoted: piece %s not found", epp.proto.GetPieceUuid())
	}

	pieceProto.Kind = epp.proto.GetToKind()
	return &next, nil
}
