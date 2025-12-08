package classic

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

const (
	testGameUUID        = "game-pawn-test"
	testBoardUUID       = "board-main"
	testWhitePlayerUUID = "player-white"
	testBlackPlayerUUID = "player-black"
)

func newTestGame(pieces []*kaboomproto.ChessPiece, turns []*kaboomproto.Turn) kaboomstate.Game {
	return kaboomstate.GameFromProto(newTestGameProto(pieces, turns))
}

func newTestGameProto(pieces []*kaboomproto.ChessPiece, turns []*kaboomproto.Turn) *kaboomproto.Game {
	return &kaboomproto.Game{
		Uuid:         testGameUUID,
		RulesVariant: ClassicChessVariantAdjudicator.ID,
		Boards: []*kaboomproto.Board{
			{
				Uuid: testBoardUUID,
				PlayerColors: []*kaboomproto.PlayerColor{
					{
						PlayerUuid: testWhitePlayerUUID,
						Color:      kaboomproto.Color_COLOR_WHITE,
					},
					{
						PlayerUuid: testBlackPlayerUUID,
						Color:      kaboomproto.Color_COLOR_BLACK,
					},
				},
			},
		},
		Players: []*kaboomproto.Player{
			{
				Uuid: testWhitePlayerUUID,
				Name: "White",
			},
			{
				Uuid: testBlackPlayerUUID,
				Name: "Black",
			},
		},
		Pieces: pieces,
		Turns:  turns,
	}
}

func newTestPawn(uuid string, color kaboomproto.Color, row, col int32) *kaboomproto.ChessPiece {
	return newTestPiece(uuid, kaboomproto.PieceKind_PAWN, color, row, col)
}

func newTestPiece(uuid string, kind kaboomproto.PieceKind, color kaboomproto.Color, row, col int32) *kaboomproto.ChessPiece {
	return &kaboomproto.ChessPiece{
		Uuid:      uuid,
		Kind:      kind,
		Color:     color,
		BoardUuid: testBoardUUID,
		Position:  posProto(row, col),
		Zone:      kaboomproto.ZoneKind_ZONE_BOARD,
	}
}

func posProto(row, col int32) *kaboomproto.Position {
	return &kaboomproto.Position{Row: row, Col: col}
}

func withZone(piece *kaboomproto.ChessPiece, zone kaboomproto.ZoneKind) *kaboomproto.ChessPiece {
	clone := proto.Clone(piece).(*kaboomproto.ChessPiece)
	clone.Zone = zone
	return clone
}

func withKind(piece *kaboomproto.ChessPiece, kind kaboomproto.PieceKind) *kaboomproto.ChessPiece {
	clone := proto.Clone(piece).(*kaboomproto.ChessPiece)
	clone.Kind = kind
	return clone
}

func applyEffectsToGame(t *testing.T, game kaboomstate.Game, effects []*kaboomstate.Effect) kaboomstate.Game {
	t.Helper()
	result, err := kaboomstate.ApplyEffects(game, effects)
	if err != nil {
		t.Fatalf("failed to apply effects: %v", err)
	}
	return result
}

func assertGameEqualsProto(t *testing.T, game kaboomstate.Game, expected *kaboomproto.Game) {
	t.Helper()
	actual := game.ToProto()
	if !proto.Equal(expected, actual) {
		t.Fatalf("game mismatch\nexpected: %v\nactual:   %v", expected, actual)
	}
}
