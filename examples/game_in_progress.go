package examples

import (
	"fmt"

	"github.com/fsufitch/kaboom/classic"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

// GameInProgress returns a sample kaboomstate.Game configured with an arbitrary mid-game position.
func GameInProgress() kaboomstate.Game {
	return kaboomstate.GameFromProto(GameInProgressProto())
}

// GameInProgressProto exposes the underlying proto for tooling.
func GameInProgressProto() *kaboomproto.Game {
	boardUUID := "board-demo"
	gameUUID := "game-demo"
	whitePlayerID := "player-white"
	blackPlayerID := "player-black"

	pieceSpecs := []struct {
		uuid  string
		kind  kaboomproto.PieceKind
		color kaboomproto.Color
		row   int32
		col   int32
	}{
		{"white-king", kaboomproto.PieceKind_KING, kaboomproto.Color_COLOR_WHITE, 0, 4},
		{"white-queen", kaboomproto.PieceKind_QUEEN, kaboomproto.Color_COLOR_WHITE, 0, 3},
		{"white-rook-a", kaboomproto.PieceKind_ROOK, kaboomproto.Color_COLOR_WHITE, 0, 0},
		{"white-bishop", kaboomproto.PieceKind_BISHOP, kaboomproto.Color_COLOR_WHITE, 0, 2},
		{"white-knight", kaboomproto.PieceKind_KNIGHT, kaboomproto.Color_COLOR_WHITE, 0, 1},
		{"white-pawn-e", kaboomproto.PieceKind_PAWN, kaboomproto.Color_COLOR_WHITE, 1, 4},
		{"black-king", kaboomproto.PieceKind_KING, kaboomproto.Color_COLOR_BLACK, 7, 4},
		{"black-queen", kaboomproto.PieceKind_QUEEN, kaboomproto.Color_COLOR_BLACK, 7, 3},
		{"black-rook-a", kaboomproto.PieceKind_ROOK, kaboomproto.Color_COLOR_BLACK, 7, 0},
		{"black-bishop", kaboomproto.PieceKind_BISHOP, kaboomproto.Color_COLOR_BLACK, 7, 2},
		{"black-knight", kaboomproto.PieceKind_KNIGHT, kaboomproto.Color_COLOR_BLACK, 7, 1},
		{"black-pawn-d", kaboomproto.PieceKind_PAWN, kaboomproto.Color_COLOR_BLACK, 6, 3},
	}

	pieces := make([]*kaboomproto.ChessPiece, 0, len(pieceSpecs))
	for i, spec := range pieceSpecs {
		if spec.uuid == "" {
			spec.uuid = fmt.Sprintf("piece-%d", i)
		}
		pieces = append(pieces, &kaboomproto.ChessPiece{
			Uuid:      spec.uuid,
			Kind:      spec.kind,
			Color:     spec.color,
			BoardUuid: boardUUID,
			Position:  &kaboomproto.Position{Row: spec.row, Col: spec.col},
			Zone:      kaboomproto.ZoneKind_ZONE_BOARD,
		})
	}

	return &kaboomproto.Game{
		Uuid:         gameUUID,
		RulesVariant: classic.ClassicRulesVariant,
		Players: []*kaboomproto.Player{
			{Uuid: whitePlayerID, Name: "Alice"},
			{Uuid: blackPlayerID, Name: "Bob"},
		},
		Boards: []*kaboomproto.Board{
			{
				Uuid: boardUUID,
				PlayerColors: []*kaboomproto.PlayerColor{
					{PlayerUuid: whitePlayerID, Color: kaboomproto.Color_COLOR_WHITE},
					{PlayerUuid: blackPlayerID, Color: kaboomproto.Color_COLOR_BLACK},
				},
			},
		},
		Pieces: pieces,
		Turns:  []*kaboomproto.Turn{},
	}
}
