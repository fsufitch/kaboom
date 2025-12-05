package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type EffectPieceTransfer struct {
	proto *kaboomproto.Effect__PieceTransfer
}

func EffectPieceTransferFromProto(ept *kaboomproto.Effect__PieceTransfer) EffectPieceTransfer {
	return EffectPieceTransfer{proto: ept}
}

func (ept EffectPieceTransfer) ToProto() *kaboomproto.Effect__PieceTransfer {
	return proto.CloneOf(ept.proto)
}

func (ept EffectPieceTransfer) Clone() EffectPieceTransfer {
	return EffectPieceTransferFromProto(ept.ToProto())
}

func (ept EffectPieceTransfer) Validate() error {
	if ept.proto == nil {
		return fmt.Errorf("%w: piece transfer data is null", ErrInvalidProto)
	}
	if ept.PieceUUID() == "" {
		return fmt.Errorf("%w: piece transfer missing piece uuid", ErrInvalidProto)
	}
	if ept.ToBoardUUID() == "" {
		return fmt.Errorf("%w: piece transfer missing target board uuid", ErrInvalidProto)
	}
	if err := ZoneFromProto(ept.proto.GetToZone()).Validate(); err != nil {
		return err
	}
	if pos := ept.proto.GetToPosition(); pos != nil {
		if err := PositionFromProto(pos).Validate(); err != nil {
			return err
		}
	}
	return nil
}

func (ept EffectPieceTransfer) PieceUUID() string {
	return ept.proto.GetPieceUuid()
}

func (ept EffectPieceTransfer) ToBoardUUID() string {
	return ept.proto.GetToBoardUuid()
}

func (ept EffectPieceTransfer) ToZone() Zone {
	return ZoneFromProto(ept.proto.GetToZone())
}

func (ept EffectPieceTransfer) ToPosition() Position {
	return PositionFromProto(ept.proto.GetToPosition())
}

func (ept EffectPieceTransfer) Apply(game Game) (*Game, error) {
	if err := ept.Validate(); err != nil {
		return nil, err
	}

	next := game.Clone()
	_, pieceProto, found := findPieceProto(next.proto, ept.proto.GetPieceUuid())
	if !found {
		return nil, fmt.Errorf("effect piece_transfer: piece %s not found", ept.proto.GetPieceUuid())
	}

	if _, _, ok := findBoardProto(next.proto, ept.proto.GetToBoardUuid()); !ok {
		return nil, fmt.Errorf("effect piece_transfer: destination board %s not found", ept.proto.GetToBoardUuid())
	}

	pieceProto.BoardUuid = ept.proto.GetToBoardUuid()
	pieceProto.Zone = ept.proto.GetToZone()

	if ept.proto.GetToPosition() != nil {
		target := PositionFromProto(ept.proto.GetToPosition())
		if err := target.Validate(); err != nil {
			return nil, fmt.Errorf("effect piece_transfer: %w", err)
		}
		pieceProto.Position = target.ToProto()
	} else {
		if ept.proto.GetToZone() == kaboomproto.ZoneKind_ZONE_BOARD {
			return nil, fmt.Errorf("effect piece_transfer: board zone requires a position")
		}
		pieceProto.Position = nil
	}

	return &next, nil
}
