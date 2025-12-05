package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type Effect struct {
	proto *kaboomproto.Effect
}

func EffectFromProto(e *kaboomproto.Effect) Effect {
	return Effect{proto: e}
}

func (e Effect) ToProto() *kaboomproto.Effect {
	return proto.CloneOf(e.proto)
}

func (e Effect) Clone() Effect {
	return EffectFromProto(e.ToProto())
}

func (e Effect) Validate() error {
	if e.proto == nil {
		return fmt.Errorf("%w: effect data is null", ErrInvalidProto)
	}

	if e.UUID() == "" {
		return fmt.Errorf("%w: effect uuid is empty", ErrInvalidProto)
	}

	if e.BoardUUID() == "" {
		return fmt.Errorf("%w: effect missing board uuid", ErrInvalidProto)
	}

	switch e.Kind() {
	case EffectKindNothingHappens:
		if err := e.NothingHappens().Validate(); err != nil {
			return err
		}
	case EffectKindPieceCreated:
		if err := e.PieceCreated().Validate(); err != nil {
			return err
		}
	case EffectKindPieceDeleted:
		if err := e.PieceDeleted().Validate(); err != nil {
			return err
		}
	case EffectKindPieceMoved:
		if err := e.PieceMoved().Validate(); err != nil {
			return err
		}
	case EffectKindPieceCaptured:
		if err := e.PieceCaptured().Validate(); err != nil {
			return err
		}
	case EffectKindPieceBumped:
		if err := e.PieceBumped().Validate(); err != nil {
			return err
		}
	case EffectKindPiecePromoted:
		if err := e.PiecePromoted().Validate(); err != nil {
			return err
		}
	case EffectKindPieceDeployed:
		if err := e.PieceDeployed().Validate(); err != nil {
			return err
		}
	case EffectKindPieceTransfer:
		if err := e.PieceTransfer().Validate(); err != nil {
			return err
		}
	case EffectKindWin:
		if err := e.Win().Validate(); err != nil {
			return err
		}
	default:
		return fmt.Errorf("%w: effect %q has no content", ErrInvalidProto, e.UUID())
	}

	for _, hint := range e.VisualHints() {
		if err := hint.Validate(); err != nil {
			return err
		}
	}

	return nil
}

func (e Effect) UUID() string {
	return e.proto.GetUuid()
}

func (e Effect) BoardUUID() string {
	return e.proto.GetBoardUuid()
}

func (e Effect) Why() string {
	return e.proto.GetWhy()
}

func (e Effect) VisualHints() []VisualHint {
	hints := e.proto.GetVisualHints()
	result := make([]VisualHint, len(hints))
	for i, hint := range hints {
		result[i] = VisualHintFromProto(hint)
	}
	return result
}

type EffectKind string

const (
	EffectKindUnknown        EffectKind = "effect.unknown"
	EffectKindNothingHappens EffectKind = "effect.nothing"
	EffectKindPieceCreated   EffectKind = "effect.piece_created"
	EffectKindPieceDeleted   EffectKind = "effect.piece_deleted"
	EffectKindPieceMoved     EffectKind = "effect.piece_moved"
	EffectKindPieceCaptured  EffectKind = "effect.piece_captured"
	EffectKindPieceBumped    EffectKind = "effect.piece_bumped"
	EffectKindPiecePromoted  EffectKind = "effect.piece_promoted"
	EffectKindPieceDeployed  EffectKind = "effect.piece_deployed"
	EffectKindPieceTransfer  EffectKind = "effect.piece_transfer"
	EffectKindWin            EffectKind = "effect.win"
)

func (e Effect) Kind() EffectKind {
	switch e.proto.GetEffectOneof().(type) {
	case *kaboomproto.Effect_NothingHappens:
		return EffectKindNothingHappens
	case *kaboomproto.Effect_PieceCreated:
		return EffectKindPieceCreated
	case *kaboomproto.Effect_PieceDeleted:
		return EffectKindPieceDeleted
	case *kaboomproto.Effect_PieceMoved:
		return EffectKindPieceMoved
	case *kaboomproto.Effect_PieceCaptured:
		return EffectKindPieceCaptured
	case *kaboomproto.Effect_PieceBumped:
		return EffectKindPieceBumped
	case *kaboomproto.Effect_PiecePromoted:
		return EffectKindPiecePromoted
	case *kaboomproto.Effect_PieceDeployed:
		return EffectKindPieceDeployed
	case *kaboomproto.Effect_PieceTransfer:
		return EffectKindPieceTransfer
	case *kaboomproto.Effect_Win:
		return EffectKindWin
	default:
		return EffectKindUnknown
	}
}

func (e Effect) NothingHappens() EffectNothingHappens {
	return EffectNothingHappensFromProto(e.proto.GetNothingHappens())
}

func (e Effect) PieceCreated() EffectPieceCreated {
	return EffectPieceCreatedFromProto(e.proto.GetPieceCreated())
}

func (e Effect) PieceDeleted() EffectPieceDeleted {
	return EffectPieceDeletedFromProto(e.proto.GetPieceDeleted())
}

func (e Effect) PieceMoved() EffectPieceMoved {
	return EffectPieceMovedFromProto(e.proto.GetPieceMoved())
}

func (e Effect) PieceCaptured() EffectPieceCaptured {
	return EffectPieceCapturedFromProto(e.proto.GetPieceCaptured())
}

func (e Effect) PieceBumped() EffectPieceBumped {
	return EffectPieceBumpedFromProto(e.proto.GetPieceBumped())
}

func (e Effect) PiecePromoted() EffectPiecePromoted {
	return EffectPiecePromotedFromProto(e.proto.GetPiecePromoted())
}

func (e Effect) PieceDeployed() EffectPieceDeployed {
	return EffectPieceDeployedFromProto(e.proto.GetPieceDeployed())
}

func (e Effect) PieceTransfer() EffectPieceTransfer {
	return EffectPieceTransferFromProto(e.proto.GetPieceTransfer())
}

func (e Effect) Win() EffectWin {
	return EffectWinFromProto(e.proto.GetWin(), e.BoardUUID())
}
