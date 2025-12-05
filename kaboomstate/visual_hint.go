package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type VisualHint struct {
	proto *kaboomproto.VisualHint
}

func VisualHintFromProto(vh *kaboomproto.VisualHint) VisualHint {
	return VisualHint{proto: vh}
}

func (vh VisualHint) ToProto() *kaboomproto.VisualHint {
	return proto.CloneOf(vh.proto)
}

func (vh VisualHint) Clone() VisualHint {
	return VisualHintFromProto(vh.ToProto())
}

func (vh VisualHint) Validate() error {
	if vh.proto == nil {
		return fmt.Errorf("%w: visual hint data is null", ErrInvalidProto)
	}

	if vh.UUID() == "" {
		return fmt.Errorf("%w: visual hint uuid is empty", ErrInvalidProto)
	}

	if vh.BoardUUID() == "" {
		return fmt.Errorf("%w: visual hint missing board uuid", ErrInvalidProto)
	}

	switch vh.Kind() {
	case VisualHintKindCollision:
		return vh.Collision().Validate()
	case VisualHintKindExplosion:
		return vh.Explosion().Validate()
	case VisualHintKindStomp:
		return vh.Stomp().Validate()
	case VisualHintKindSnipe:
		return vh.Snipe().Validate()
	case VisualHintKindNova:
		return vh.Nova().Validate()
	case VisualHintKindMindControl:
		return vh.MindControl().Validate()
	case VisualHintKindDisintegration:
		return vh.Disintegration().Validate()
	case VisualHintKindYeet:
		return vh.Yeet().Validate()
	default:
		return fmt.Errorf("%w: visual hint %q missing content", ErrInvalidProto, vh.UUID())
	}
}

func (vh VisualHint) UUID() string {
	return vh.proto.GetUuid()
}

func (vh VisualHint) BoardUUID() string {
	return vh.proto.GetBoardUuid()
}

func (vh VisualHint) Timing() int32 {
	return vh.proto.GetTiming()
}

type VisualHintKind string

const (
	VisualHintKindUnknown        VisualHintKind = "visual_hint.unknown"
	VisualHintKindCollision      VisualHintKind = "visual_hint.collision"
	VisualHintKindExplosion      VisualHintKind = "visual_hint.explosion"
	VisualHintKindStomp          VisualHintKind = "visual_hint.stomp"
	VisualHintKindSnipe          VisualHintKind = "visual_hint.snipe"
	VisualHintKindNova           VisualHintKind = "visual_hint.nova"
	VisualHintKindMindControl    VisualHintKind = "visual_hint.mind_control"
	VisualHintKindDisintegration VisualHintKind = "visual_hint.disintegration"
	VisualHintKindYeet           VisualHintKind = "visual_hint.yeet"
)

func (vh VisualHint) Kind() VisualHintKind {
	switch vh.proto.GetHint().(type) {
	case *kaboomproto.VisualHint_Collision:
		return VisualHintKindCollision
	case *kaboomproto.VisualHint_Explosion:
		return VisualHintKindExplosion
	case *kaboomproto.VisualHint_Stomp:
		return VisualHintKindStomp
	case *kaboomproto.VisualHint_Snipe:
		return VisualHintKindSnipe
	case *kaboomproto.VisualHint_Nova:
		return VisualHintKindNova
	case *kaboomproto.VisualHint_MindControl:
		return VisualHintKindMindControl
	case *kaboomproto.VisualHint_Disintegration:
		return VisualHintKindDisintegration
	case *kaboomproto.VisualHint_Yeet:
		return VisualHintKindYeet
	default:
		return VisualHintKindUnknown
	}
}

func (vh VisualHint) Collision() VisualHintCollision {
	return VisualHintCollisionFromProto(vh.proto.GetCollision())
}

func (vh VisualHint) Explosion() VisualHintExplosion {
	return VisualHintExplosionFromProto(vh.proto.GetExplosion())
}

func (vh VisualHint) Stomp() VisualHintStomp {
	return VisualHintStompFromProto(vh.proto.GetStomp())
}

func (vh VisualHint) Snipe() VisualHintSnipe {
	return VisualHintSnipeFromProto(vh.proto.GetSnipe())
}

func (vh VisualHint) Nova() VisualHintNova {
	return VisualHintNovaFromProto(vh.proto.GetNova())
}

func (vh VisualHint) MindControl() VisualHintMindControl {
	return VisualHintMindControlFromProto(vh.proto.GetMindControl())
}

func (vh VisualHint) Disintegration() VisualHintDisintegration {
	return VisualHintDisintegrationFromProto(vh.proto.GetDisintegration())
}

func (vh VisualHint) Yeet() VisualHintYeet {
	return VisualHintYeetFromProto(vh.proto.GetYeet())
}
