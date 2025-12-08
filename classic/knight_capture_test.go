package classic

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func TestKnightCapture(t *testing.T) {
	target := newTestPawn("black-pawn", kaboomproto.Color_COLOR_BLACK, 2, 2)
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPiece("white-knight", kaboomproto.PieceKind_KNIGHT, kaboomproto.Color_COLOR_WHITE, 0, 1),
		target,
	}, nil)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CKnightCapture{
			CKnightCapture: &kaboomproto.C_KnightCapture{
				From: posProto(0, 1),
				To:   posProto(2, 2),
			},
		},
	})

	intent, err := MoveToIntent_KnightCapture.Convert(game, move)
	if err != nil {
		t.Fatalf("convert knight capture: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected knight capture intent")
	}

	effects, err := IntentToEffect_KnightCapture.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert knight capture intent->effects: %v", err)
	}

	final := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPiece("white-knight", kaboomproto.PieceKind_KNIGHT, kaboomproto.Color_COLOR_WHITE, 2, 2),
		withZone(target, kaboomproto.ZoneKind_ZONE_GRAVEYARD),
	}, nil)

	assertGameEqualsProto(t, final, expected)
}
