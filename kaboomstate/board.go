package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type Board struct {
	proto *kaboomproto.Board
}

func BoardFromProto(b *kaboomproto.Board) Board {
	return Board{proto: b}
}

func (b Board) ToProto() *kaboomproto.Board {
	return proto.CloneOf(b.proto)
}

func (b Board) Clone() Board {
	return BoardFromProto(b.ToProto())
}

func (b Board) Validate() error {
	if b.proto == nil {
		return fmt.Errorf("%w: board data is null", ErrInvalidProto)
	}

	if b.UUID() == "" {
		return fmt.Errorf("%w: board uuid is empty", ErrInvalidProto)
	}

	for _, pc := range b.PlayerColors() {
		if err := pc.Validate(); err != nil {
			return err
		}
	}

	winner := b.WinningPlayerUUID()
	if winner != "" {
		if _, ok := b.PlayerColorForPlayer(winner); !ok {
			return fmt.Errorf("%w: winning player %q missing from board %q", ErrInvalidProto, winner, b.UUID())
		}
	}

	return nil
}

func (b Board) UUID() string {
	return b.proto.GetUuid()
}

func (b Board) WinningPlayerUUID() string {
	return b.proto.GetWinningPlayerUuid()
}

func (b Board) PlayerColors() []PlayerColor {
	playerColors := b.proto.GetPlayerColors()
	result := make([]PlayerColor, len(playerColors))
	for i, pc := range playerColors {
		result[i] = PlayerColorFromProto(pc)
	}
	return result
}

func (b Board) PlayerColorForPlayer(playerUUID string) (kaboomproto.Color, bool) {
	for _, pc := range b.proto.GetPlayerColors() {
		if pc.GetPlayerUuid() == playerUUID {
			return pc.GetColor(), true
		}
	}
	return kaboomproto.Color_COLOR_INVALID, false
}

func (b Board) PlayerUUIDForColor(color kaboomproto.Color) (string, bool) {
	for _, pc := range b.proto.GetPlayerColors() {
		if pc.GetColor() == color {
			return pc.GetPlayerUuid(), true
		}
	}
	return "", false
}

type PlayerColor struct {
	proto *kaboomproto.PlayerColor
}

func PlayerColorFromProto(pc *kaboomproto.PlayerColor) PlayerColor {
	return PlayerColor{proto: pc}
}

func (pc PlayerColor) ToProto() *kaboomproto.PlayerColor {
	return proto.CloneOf(pc.proto)
}

func (pc PlayerColor) Clone() PlayerColor {
	return PlayerColorFromProto(pc.ToProto())
}

func (pc PlayerColor) Validate() error {
	if pc.proto == nil {
		return fmt.Errorf("%w: player color data is null", ErrInvalidProto)
	}

	if pc.PlayerUUID() == "" {
		return fmt.Errorf("%w: player color missing player uuid", ErrInvalidProto)
	}

	if err := ValidateColor(pc.Color()); err != nil {
		return err
	}

	return nil
}

func (pc PlayerColor) PlayerUUID() string {
	return pc.proto.GetPlayerUuid()
}

func (pc PlayerColor) Color() kaboomproto.Color {
	return pc.proto.GetColor()
}

func (pc PlayerColor) Equals(other PlayerColor) bool {
	return pc.PlayerUUID() == other.PlayerUUID() && pc.Color() == other.Color()
}
