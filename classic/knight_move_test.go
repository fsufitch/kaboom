package classic

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func TestKnightMove(t *testing.T) {
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPiece("white-knight", kaboomproto.PieceKind_KNIGHT, kaboomproto.Color_COLOR_WHITE, 7, 1),
	}, nil)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CKnightMove{
			CKnightMove: &kaboomproto.C_KnightMove{
				From: posProto(7, 1),
				To:   posProto(5, 2),
			},
		},
	})

	intent, err := MoveToIntent_KnightMove.Convert(game, move)
	if err != nil {
		t.Fatalf("convert knight move: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected knight move intent")
	}

	effects, err := IntentToEffect_KnightMove.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert knight move intent->effects: %v", err)
	}

	final := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPiece("white-knight", kaboomproto.PieceKind_KNIGHT, kaboomproto.Color_COLOR_WHITE, 5, 2),
	}, nil)

	assertGameEqualsProto(t, final, expected)
}
