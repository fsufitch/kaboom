package classic

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func TestRookCapture(t *testing.T) {
	target := newTestPiece("black-bishop", kaboomproto.PieceKind_BISHOP, kaboomproto.Color_COLOR_BLACK, 3, 5)
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPiece("white-rook", kaboomproto.PieceKind_ROOK, kaboomproto.Color_COLOR_WHITE, 3, 1),
		target,
	}, nil)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CRookCapture{
			CRookCapture: &kaboomproto.C_RookCapture{
				From: posProto(3, 1),
				To:   posProto(3, 5),
			},
		},
	})

	intent, err := MoveToIntent_RookCapture.Convert(game, move)
	if err != nil {
		t.Fatalf("convert rook capture: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected rook capture intent")
	}

	effects, err := IntentToEffect_RookCapture.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert rook capture intent->effects: %v", err)
	}

	final := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPiece("white-rook", kaboomproto.PieceKind_ROOK, kaboomproto.Color_COLOR_WHITE, 3, 5),
		withZone(target, kaboomproto.ZoneKind_ZONE_GRAVEYARD),
	}, nil)

	assertGameEqualsProto(t, final, expected)
}
