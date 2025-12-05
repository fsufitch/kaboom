package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type VisualHintDisintegration struct {
	proto *kaboomproto.VisualHint__Disintegration
}

func VisualHintDisintegrationFromProto(vd *kaboomproto.VisualHint__Disintegration) VisualHintDisintegration {
	return VisualHintDisintegration{proto: vd}
}

func (vd VisualHintDisintegration) ToProto() *kaboomproto.VisualHint__Disintegration {
	return proto.CloneOf(vd.proto)
}

func (vd VisualHintDisintegration) Clone() VisualHintDisintegration {
	return VisualHintDisintegrationFromProto(vd.ToProto())
}

func (vd VisualHintDisintegration) Validate() error {
	if vd.proto == nil {
		return fmt.Errorf("%w: disintegration hint data is null", ErrInvalidProto)
	}
	if vd.PieceUUID() == "" {
		return fmt.Errorf("%w: disintegration hint missing piece uuid", ErrInvalidProto)
	}
	return nil
}

func (vd VisualHintDisintegration) PieceUUID() string {
	return vd.proto.GetPieceUuid()
}
