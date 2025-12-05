package classic

import (
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

const ClassicRulesVariant = "rules.classic"

func NewClassicChessGame(gameUUID string, playerWhiteUUID string, playerBlackUUID string) kaboomstate.Game {
	gameProto := &kaboomproto.Game{
		Uuid:         gameUUID,
		RulesVariant: ClassicRulesVariant,
		Players: []*kaboomproto.Player{
			{Uuid: playerWhiteUUID},
			{Uuid: playerBlackUUID},
		},
		Boards: []*kaboomproto.Board{{
			Uuid: "generate-me",
			PlayerColors: []*kaboomproto.PlayerColor{
				{PlayerUuid: playerWhiteUUID, Color: kaboomproto.Color_COLOR_WHITE},
				{PlayerUuid: playerBlackUUID, Color: kaboomproto.Color_COLOR_BLACK},
			},
		}},
		Pieces: []*kaboomproto.ChessPiece{
			// TODO
		},
		Turns: []*kaboomproto.Turn{},
	}

	return kaboomstate.GameFromProto(gameProto)
}
