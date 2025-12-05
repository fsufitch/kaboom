package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type VisualHintCollision struct {
	proto *kaboomproto.VisualHint__Collision
}

func VisualHintCollisionFromProto(vc *kaboomproto.VisualHint__Collision) VisualHintCollision {
	return VisualHintCollision{proto: vc}
}

func (vc VisualHintCollision) ToProto() *kaboomproto.VisualHint__Collision {
	return proto.CloneOf(vc.proto)
}

func (vc VisualHintCollision) Clone() VisualHintCollision {
	return VisualHintCollisionFromProto(vc.ToProto())
}

func (vc VisualHintCollision) Validate() error {
	if vc.proto == nil {
		return fmt.Errorf("%w: collision hint data is null", ErrInvalidProto)
	}
	if vc.PieceAUUID() == "" || vc.PieceBUUID() == "" {
		return fmt.Errorf("%w: collision hint missing piece uuids", ErrInvalidProto)
	}
	return nil
}

func (vc VisualHintCollision) PieceAUUID() string {
	return vc.proto.GetPieceAUuid()
}

func (vc VisualHintCollision) PieceBUUID() string {
	return vc.proto.GetPieceBUuid()
}
