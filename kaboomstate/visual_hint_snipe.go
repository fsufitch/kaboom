package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type VisualHintSnipe struct {
	proto *kaboomproto.VisualHint__Snipe
}

func VisualHintSnipeFromProto(vs *kaboomproto.VisualHint__Snipe) VisualHintSnipe {
	return VisualHintSnipe{proto: vs}
}

func (vs VisualHintSnipe) ToProto() *kaboomproto.VisualHint__Snipe {
	return proto.CloneOf(vs.proto)
}

func (vs VisualHintSnipe) Clone() VisualHintSnipe {
	return VisualHintSnipeFromProto(vs.ToProto())
}

func (vs VisualHintSnipe) Validate() error {
	if vs.proto == nil {
		return fmt.Errorf("%w: snipe hint data is null", ErrInvalidProto)
	}
	if vs.proto.GetFrom() == nil || vs.proto.GetTo() == nil {
		return fmt.Errorf("%w: snipe hint missing endpoints", ErrInvalidProto)
	}
	if err := PositionFromProto(vs.proto.GetFrom()).Validate(); err != nil {
		return err
	}
	return PositionFromProto(vs.proto.GetTo()).Validate()
}

func (vs VisualHintSnipe) From() Position {
	return PositionFromProto(vs.proto.GetFrom())
}

func (vs VisualHintSnipe) To() Position {
	return PositionFromProto(vs.proto.GetTo())
}
