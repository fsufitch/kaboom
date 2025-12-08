package classic

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func TestKingCapture(t *testing.T) {
	target := newTestPiece("black-queen", kaboomproto.PieceKind_QUEEN, kaboomproto.Color_COLOR_BLACK, 1, 5)
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPiece("white-king", kaboomproto.PieceKind_KING, kaboomproto.Color_COLOR_WHITE, 0, 4),
		target,
	}, nil)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CKingCapture{
			CKingCapture: &kaboomproto.C_KingCapture{
				From: posProto(0, 4),
				To:   posProto(1, 5),
			},
		},
	})

	intent, err := MoveToIntent_KingCapture.Convert(game, move)
	if err != nil {
		t.Fatalf("convert king capture: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected king capture intent")
	}

	effects, err := IntentToEffect_KingCapture.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert king capture intent->effects: %v", err)
	}

	final := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPiece("white-king", kaboomproto.PieceKind_KING, kaboomproto.Color_COLOR_WHITE, 1, 5),
		withZone(target, kaboomproto.ZoneKind_ZONE_GRAVEYARD),
	}, nil)

	assertGameEqualsProto(t, final, expected)
}
