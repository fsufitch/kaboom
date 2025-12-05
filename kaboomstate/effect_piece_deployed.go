package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type EffectPieceDeployed struct {
	proto *kaboomproto.Effect__PieceDeployed
}

func EffectPieceDeployedFromProto(epd *kaboomproto.Effect__PieceDeployed) EffectPieceDeployed {
	return EffectPieceDeployed{proto: epd}
}

func (epd EffectPieceDeployed) ToProto() *kaboomproto.Effect__PieceDeployed {
	return proto.CloneOf(epd.proto)
}

func (epd EffectPieceDeployed) Clone() EffectPieceDeployed {
	return EffectPieceDeployedFromProto(epd.ToProto())
}

func (epd EffectPieceDeployed) Validate() error {
	if epd.proto == nil {
		return fmt.Errorf("%w: piece deployed data is null", ErrInvalidProto)
	}
	if epd.PieceUUID() == "" {
		return fmt.Errorf("%w: piece deployed missing piece uuid", ErrInvalidProto)
	}
	if epd.proto.GetToPosition() == nil {
		return fmt.Errorf("%w: piece deployed missing target position", ErrInvalidProto)
	}
	return PositionFromProto(epd.proto.GetToPosition()).Validate()
}

func (epd EffectPieceDeployed) PieceUUID() string {
	return epd.proto.GetPieceUuid()
}

func (epd EffectPieceDeployed) ToPosition() Position {
	return PositionFromProto(epd.proto.GetToPosition())
}

func (epd EffectPieceDeployed) Apply(game Game) (*Game, error) {
	if err := epd.Validate(); err != nil {
		return nil, err
	}

	next := game.Clone()
	_, pieceProto, found := findPieceProto(next.proto, epd.proto.GetPieceUuid())
	if !found {
		return nil, fmt.Errorf("effect piece_deployed: piece %s not found", epd.proto.GetPieceUuid())
	}

	if pieceProto.GetZone() != kaboomproto.ZoneKind_ZONE_BENCH {
		return nil, fmt.Errorf("effect piece_deployed: piece %s is not in bench zone (zone=%s)", epd.proto.GetPieceUuid(), pieceProto.GetZone().String())
	}

	target := PositionFromProto(epd.proto.GetToPosition())
	if err := target.Validate(); err != nil {
		return nil, fmt.Errorf("effect piece_deployed: %w", err)
	}

	pieceProto.Zone = kaboomproto.ZoneKind_ZONE_BOARD
	pieceProto.Position = target.ToProto()
	return &next, nil
}
