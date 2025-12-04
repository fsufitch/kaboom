package kaboom

import kaboomproto "github.com/fsufitch/kaboom/proto/go"

type TwoPlayerGame struct {
	data *kaboomproto.GameState
}

func (g TwoPlayerGame) Board() BoardState {
	return BoardState{data: g.data.GetBoards()[0]}
}
