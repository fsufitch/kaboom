package classic

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func TestQueenCapture(t *testing.T) {
	target := newTestPiece("black-rook", kaboomproto.PieceKind_ROOK, kaboomproto.Color_COLOR_BLACK, 3, 4)
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPiece("white-queen", kaboomproto.PieceKind_QUEEN, kaboomproto.Color_COLOR_WHITE, 0, 4),
		target,
	}, nil)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CQueenCapture{
			CQueenCapture: &kaboomproto.C_QueenCapture{
				From: posProto(0, 4),
				To:   posProto(3, 4),
			},
		},
	})

	intent, err := MoveToIntent_QueenCapture.Convert(game, move)
	if err != nil {
		t.Fatalf("convert queen capture: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected queen capture intent")
	}

	effects, err := IntentToEffect_QueenCapture.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert queen capture intent->effects: %v", err)
	}

	final := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPiece("white-queen", kaboomproto.PieceKind_QUEEN, kaboomproto.Color_COLOR_WHITE, 3, 4),
		withZone(target, kaboomproto.ZoneKind_ZONE_GRAVEYARD),
	}, nil)

	assertGameEqualsProto(t, final, expected)
}
