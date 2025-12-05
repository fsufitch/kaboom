package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type VisualHintStomp struct {
	proto *kaboomproto.VisualHint__Stomp
}

func VisualHintStompFromProto(vs *kaboomproto.VisualHint__Stomp) VisualHintStomp {
	return VisualHintStomp{proto: vs}
}

func (vs VisualHintStomp) ToProto() *kaboomproto.VisualHint__Stomp {
	return proto.CloneOf(vs.proto)
}

func (vs VisualHintStomp) Clone() VisualHintStomp {
	return VisualHintStompFromProto(vs.ToProto())
}

func (vs VisualHintStomp) Validate() error {
	if vs.proto == nil {
		return fmt.Errorf("%w: stomp hint data is null", ErrInvalidProto)
	}
	if vs.proto.GetPosition() == nil {
		return fmt.Errorf("%w: stomp hint missing position", ErrInvalidProto)
	}
	return PositionFromProto(vs.proto.GetPosition()).Validate()
}

func (vs VisualHintStomp) Position() Position {
	return PositionFromProto(vs.proto.GetPosition())
}
