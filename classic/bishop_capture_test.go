package classic

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func TestBishopCapture(t *testing.T) {
	target := newTestPiece("black-knight", kaboomproto.PieceKind_KNIGHT, kaboomproto.Color_COLOR_BLACK, 3, 6)
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPiece("white-bishop", kaboomproto.PieceKind_BISHOP, kaboomproto.Color_COLOR_WHITE, 6, 3),
		target,
	}, nil)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CBishopCapture{
			CBishopCapture: &kaboomproto.C_BishopCapture{
				From: posProto(6, 3),
				To:   posProto(3, 6),
			},
		},
	})

	intent, err := MoveToIntent_BishopCapture.Convert(game, move)
	if err != nil {
		t.Fatalf("convert bishop capture: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected bishop capture intent")
	}

	effects, err := IntentToEffect_BishopCapture.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert bishop capture intent->effects: %v", err)
	}

	final := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPiece("white-bishop", kaboomproto.PieceKind_BISHOP, kaboomproto.Color_COLOR_WHITE, 3, 6),
		withZone(target, kaboomproto.ZoneKind_ZONE_GRAVEYARD),
	}, nil)

	assertGameEqualsProto(t, final, expected)
}
