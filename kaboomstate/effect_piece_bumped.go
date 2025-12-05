package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type EffectPieceBumped struct {
	proto *kaboomproto.Effect__PieceBumped
}

func EffectPieceBumpedFromProto(epb *kaboomproto.Effect__PieceBumped) EffectPieceBumped {
	return EffectPieceBumped{proto: epb}
}

func (epb EffectPieceBumped) ToProto() *kaboomproto.Effect__PieceBumped {
	return proto.CloneOf(epb.proto)
}

func (epb EffectPieceBumped) Clone() EffectPieceBumped {
	return EffectPieceBumpedFromProto(epb.ToProto())
}

func (epb EffectPieceBumped) Validate() error {
	if epb.proto == nil {
		return fmt.Errorf("%w: piece bumped data is null", ErrInvalidProto)
	}
	if epb.PieceUUID() == "" {
		return fmt.Errorf("%w: piece bumped missing piece uuid", ErrInvalidProto)
	}
	if epb.proto.GetVector() == nil {
		return fmt.Errorf("%w: piece bumped missing vector", ErrInvalidProto)
	}
	return VectorFromProto(epb.proto.GetVector()).Validate()
}

func (epb EffectPieceBumped) PieceUUID() string {
	return epb.proto.GetPieceUuid()
}

func (epb EffectPieceBumped) Vector() Vector {
	return VectorFromProto(epb.proto.GetVector())
}

func (epb EffectPieceBumped) Apply(game Game) (*Game, error) {
	if err := epb.Validate(); err != nil {
		return nil, err
	}

	next := game.Clone()
	_, pieceProto, found := findPieceProto(next.proto, epb.proto.GetPieceUuid())
	if !found {
		return nil, fmt.Errorf("effect piece_bumped: piece %s not found", epb.proto.GetPieceUuid())
	}

	vector := VectorFromProto(epb.proto.GetVector())
	if err := movePieceOnBoard(pieceProto, vector); err != nil {
		return nil, fmt.Errorf("effect piece_bumped: %w", err)
	}

	return &next, nil
}
