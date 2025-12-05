package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type VisualHintYeet struct {
	proto *kaboomproto.VisualHint__Yeet
}

func VisualHintYeetFromProto(vy *kaboomproto.VisualHint__Yeet) VisualHintYeet {
	return VisualHintYeet{proto: vy}
}

func (vy VisualHintYeet) ToProto() *kaboomproto.VisualHint__Yeet {
	return proto.CloneOf(vy.proto)
}

func (vy VisualHintYeet) Clone() VisualHintYeet {
	return VisualHintYeetFromProto(vy.ToProto())
}

func (vy VisualHintYeet) Validate() error {
	if vy.proto == nil {
		return fmt.Errorf("%w: yeet hint data is null", ErrInvalidProto)
	}
	if vy.PieceUUID() == "" {
		return fmt.Errorf("%w: yeet hint missing piece uuid", ErrInvalidProto)
	}
	if vy.proto.GetYeetVector() == nil {
		return fmt.Errorf("%w: yeet hint missing vector", ErrInvalidProto)
	}
	return VectorFromProto(vy.proto.GetYeetVector()).Validate()
}

func (vy VisualHintYeet) PieceUUID() string {
	return vy.proto.GetPieceUuid()
}

func (vy VisualHintYeet) YeetVector() Vector {
	return VectorFromProto(vy.proto.GetYeetVector())
}
