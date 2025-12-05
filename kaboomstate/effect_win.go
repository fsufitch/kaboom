package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type EffectWin struct {
	proto     *kaboomproto.Effect__Win
	boardUUID string
}

func EffectWinFromProto(ew *kaboomproto.Effect__Win, boardUUID string) EffectWin {
	return EffectWin{proto: ew, boardUUID: boardUUID}
}

func (ew EffectWin) ToProto() *kaboomproto.Effect__Win {
	return proto.CloneOf(ew.proto)
}

func (ew EffectWin) Clone() EffectWin {
	return EffectWinFromProto(ew.ToProto(), ew.boardUUID)
}

func (ew EffectWin) Validate() error {
	if ew.proto == nil {
		return fmt.Errorf("%w: win effect data is null", ErrInvalidProto)
	}
	if ew.WinningPlayerUUID() == "" {
		return fmt.Errorf("%w: win effect missing winning player uuid", ErrInvalidProto)
	}
	if ew.boardUUID == "" {
		return fmt.Errorf("%w: win effect missing board uuid", ErrInvalidProto)
	}
	return nil
}

func (ew EffectWin) WinningPlayerUUID() string {
	return ew.proto.GetWinningPlayerUuid()
}

func (ew EffectWin) BoardUUID() string {
	return ew.boardUUID
}

func (ew EffectWin) Apply(game Game) (*Game, error) {
	if err := ew.Validate(); err != nil {
		return nil, err
	}

	next := game.Clone()
	_, boardProto, found := findBoardProto(next.proto, ew.BoardUUID())
	if !found {
		return nil, fmt.Errorf("effect win: board %s not found", ew.BoardUUID())
	}

	for _, playerColor := range boardProto.GetPlayerColors() {
		if playerColor.GetPlayerUuid() == ew.WinningPlayerUUID() {
			boardProto.WinningPlayerUuid = ew.WinningPlayerUUID()
			return &next, nil
		}
	}

	return nil, fmt.Errorf("effect win: player %s is not seated on board %s", ew.WinningPlayerUUID(), ew.BoardUUID())
}
