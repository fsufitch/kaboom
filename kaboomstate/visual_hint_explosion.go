package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type VisualHintExplosion struct {
	proto *kaboomproto.VisualHint__Explosion
}

func VisualHintExplosionFromProto(ve *kaboomproto.VisualHint__Explosion) VisualHintExplosion {
	return VisualHintExplosion{proto: ve}
}

func (ve VisualHintExplosion) ToProto() *kaboomproto.VisualHint__Explosion {
	return proto.CloneOf(ve.proto)
}

func (ve VisualHintExplosion) Clone() VisualHintExplosion {
	return VisualHintExplosionFromProto(ve.ToProto())
}

func (ve VisualHintExplosion) Validate() error {
	if ve.proto == nil {
		return fmt.Errorf("%w: explosion hint data is null", ErrInvalidProto)
	}
	if ve.proto.GetPosition() == nil {
		return fmt.Errorf("%w: explosion hint missing position", ErrInvalidProto)
	}
	return PositionFromProto(ve.proto.GetPosition()).Validate()
}

func (ve VisualHintExplosion) Position() Position {
	return PositionFromProto(ve.proto.GetPosition())
}
