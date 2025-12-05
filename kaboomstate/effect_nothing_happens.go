package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type EffectNothingHappens struct {
	proto *kaboomproto.Effect__NothingHappens
}

func EffectNothingHappensFromProto(enh *kaboomproto.Effect__NothingHappens) EffectNothingHappens {
	return EffectNothingHappens{proto: enh}
}

func (enh EffectNothingHappens) ToProto() *kaboomproto.Effect__NothingHappens {
	return proto.CloneOf(enh.proto)
}

func (enh EffectNothingHappens) Clone() EffectNothingHappens {
	return EffectNothingHappensFromProto(enh.ToProto())
}

func (enh EffectNothingHappens) Validate() error {
	if enh.proto == nil {
		return fmt.Errorf("%w: nothing happens data is null", ErrInvalidProto)
	}
	return nil
}

func (enh EffectNothingHappens) Apply(game Game) (*Game, error) {
	if err := enh.Validate(); err != nil {
		return nil, err
	}
	next := game.Clone()
	return &next, nil
}
