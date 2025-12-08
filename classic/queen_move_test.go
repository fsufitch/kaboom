package classic

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func TestQueenMove(t *testing.T) {
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPiece("white-queen", kaboomproto.PieceKind_QUEEN, kaboomproto.Color_COLOR_WHITE, 7, 3),
	}, nil)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CQueenMove{
			CQueenMove: &kaboomproto.C_QueenMove{
				From: posProto(7, 3),
				To:   posProto(5, 5),
			},
		},
	})

	intent, err := MoveToIntent_QueenMove.Convert(game, move)
	if err != nil {
		t.Fatalf("convert queen move: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected queen move intent")
	}

	effects, err := IntentToEffect_QueenMove.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert queen move intent->effects: %v", err)
	}

	final := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPiece("white-queen", kaboomproto.PieceKind_QUEEN, kaboomproto.Color_COLOR_WHITE, 5, 5),
	}, nil)

	assertGameEqualsProto(t, final, expected)
}
