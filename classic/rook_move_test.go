package classic

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func TestRookMove(t *testing.T) {
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPiece("white-rook", kaboomproto.PieceKind_ROOK, kaboomproto.Color_COLOR_WHITE, 7, 0),
	}, nil)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CRookMove{
			CRookMove: &kaboomproto.C_RookMove{
				From: posProto(7, 0),
				To:   posProto(4, 0),
			},
		},
	})

	intent, err := MoveToIntent_RookMove.Convert(game, move)
	if err != nil {
		t.Fatalf("convert rook move: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected rook move intent")
	}

	effects, err := IntentToEffect_RookMove.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert rook move intent->effects: %v", err)
	}

	final := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPiece("white-rook", kaboomproto.PieceKind_ROOK, kaboomproto.Color_COLOR_WHITE, 4, 0),
	}, nil)

	assertGameEqualsProto(t, final, expected)
}
