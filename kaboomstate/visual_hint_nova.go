package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type VisualHintNova struct {
	proto *kaboomproto.VisualHint__Nova
}

func VisualHintNovaFromProto(vn *kaboomproto.VisualHint__Nova) VisualHintNova {
	return VisualHintNova{proto: vn}
}

func (vn VisualHintNova) ToProto() *kaboomproto.VisualHint__Nova {
	return proto.CloneOf(vn.proto)
}

func (vn VisualHintNova) Clone() VisualHintNova {
	return VisualHintNovaFromProto(vn.ToProto())
}

func (vn VisualHintNova) Validate() error {
	if vn.proto == nil {
		return fmt.Errorf("%w: nova hint data is null", ErrInvalidProto)
	}
	if vn.proto.GetPosition() == nil {
		return fmt.Errorf("%w: nova hint missing position", ErrInvalidProto)
	}
	return PositionFromProto(vn.proto.GetPosition()).Validate()
}

func (vn VisualHintNova) Position() Position {
	return PositionFromProto(vn.proto.GetPosition())
}
