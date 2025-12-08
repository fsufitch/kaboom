package classic

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func TestBishopMove(t *testing.T) {
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPiece("white-bishop", kaboomproto.PieceKind_BISHOP, kaboomproto.Color_COLOR_WHITE, 0, 2),
	}, nil)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CBishopMove{
			CBishopMove: &kaboomproto.C_BishopMove{
				From: posProto(0, 2),
				To:   posProto(3, 5),
			},
		},
	})

	intent, err := MoveToIntent_BishopMove.Convert(game, move)
	if err != nil {
		t.Fatalf("convert bishop move: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected bishop move intent")
	}

	effects, err := IntentToEffect_BishopMove.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert bishop move intent->effects: %v", err)
	}

	final := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPiece("white-bishop", kaboomproto.PieceKind_BISHOP, kaboomproto.Color_COLOR_WHITE, 3, 5),
	}, nil)

	assertGameEqualsProto(t, final, expected)
}
