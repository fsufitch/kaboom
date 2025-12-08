package classic

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func TestKingMove(t *testing.T) {
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPiece("white-king", kaboomproto.PieceKind_KING, kaboomproto.Color_COLOR_WHITE, 7, 4),
	}, nil)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CKingMove{
			CKingMove: &kaboomproto.C_KingMove{
				From: posProto(7, 4),
				To:   posProto(6, 4),
			},
		},
	})

	intent, err := MoveToIntent_KingMove.Convert(game, move)
	if err != nil {
		t.Fatalf("convert king move: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected king move intent")
	}

	effects, err := IntentToEffect_KingMove.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert king move intent->effects: %v", err)
	}

	final := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPiece("white-king", kaboomproto.PieceKind_KING, kaboomproto.Color_COLOR_WHITE, 6, 4),
	}, nil)

	assertGameEqualsProto(t, final, expected)
}
