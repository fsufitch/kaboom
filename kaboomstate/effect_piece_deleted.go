package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type EffectPieceDeleted struct {
	proto *kaboomproto.Effect__PieceDeleted
}

func EffectPieceDeletedFromProto(epd *kaboomproto.Effect__PieceDeleted) EffectPieceDeleted {
	return EffectPieceDeleted{proto: epd}
}

func (epd EffectPieceDeleted) ToProto() *kaboomproto.Effect__PieceDeleted {
	return proto.CloneOf(epd.proto)
}

func (epd EffectPieceDeleted) Clone() EffectPieceDeleted {
	return EffectPieceDeletedFromProto(epd.ToProto())
}

func (epd EffectPieceDeleted) Validate() error {
	if epd.proto == nil {
		return fmt.Errorf("%w: piece deleted data is null", ErrInvalidProto)
	}
	if epd.PieceUUID() == "" {
		return fmt.Errorf("%w: piece deleted missing piece uuid", ErrInvalidProto)
	}
	return nil
}

func (epd EffectPieceDeleted) PieceUUID() string {
	return epd.proto.GetPieceUuid()
}

func (epd EffectPieceDeleted) Apply(game Game) (*Game, error) {
	if err := epd.Validate(); err != nil {
		return nil, err
	}

	next := game.Clone()
	idx, _, found := findPieceProto(next.proto, epd.proto.GetPieceUuid())
	if !found {
		return nil, fmt.Errorf("effect piece_deleted: piece %s not found", epd.proto.GetPieceUuid())
	}

	pieces := next.proto.GetPieces()
	next.proto.Pieces = append(pieces[:idx], pieces[idx+1:]...)
	return &next, nil
}
