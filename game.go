package kaboom

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

type TwoPlayerGame struct {
	data *kaboomproto.GameState
}

func (g TwoPlayerGame) Board() BoardState {
	boards := g.data.GetBoards()
	if len(boards) == 0 || boards[0] == nil {
		return BoardState{}
	}
	return BoardState{data: boards[0]}
}

func (g TwoPlayerGame) Players() ([]Player, error) {
	if g.data == nil {
		return nil, fmt.Errorf("game state missing data: %w", ErrGameStateInvalid)
	}
	protoPlayers := g.data.GetPlayers()
	players := make([]Player, 0, len(protoPlayers))
	for i, p := range protoPlayers {
		if p == nil {
			return nil, fmt.Errorf("player entry %d missing data: %w", i, ErrGameStateInvalid)
		}
		players = append(players, Player{data: p, Color: ColorUnknown})
	}
	return players, nil
}
