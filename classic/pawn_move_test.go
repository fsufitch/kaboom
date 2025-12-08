package classic

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func TestPawnSingleAdvance(t *testing.T) {
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPawn("white-pawn", kaboomproto.Color_COLOR_WHITE, 6, 3),
		newTestPiece("black-knight", kaboomproto.PieceKind_KNIGHT, kaboomproto.Color_COLOR_BLACK, 0, 1),
	}, nil)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CPawnMove{
			CPawnMove: &kaboomproto.C_PawnMove{
				From:      posProto(6, 3),
				To:        posProto(5, 3),
				Promotion: kaboomproto.PieceKind_INVALID_PIECE,
			},
		},
	})

	intent, err := MoveToIntent_PawnMove.Convert(game, move)
	if err != nil {
		t.Fatalf("convert pawn move: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected pawn move intent")
	}

	effects, err := IntentToEffect_PawnMove.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert pawn move intent->effects: %v", err)
	}

	finalGame := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPawn("white-pawn", kaboomproto.Color_COLOR_WHITE, 5, 3),
		newTestPiece("black-knight", kaboomproto.PieceKind_KNIGHT, kaboomproto.Color_COLOR_BLACK, 0, 1),
	}, nil)

	assertGameEqualsProto(t, finalGame, expected)
}

func TestPawnDoubleAdvance(t *testing.T) {
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPawn("white-pawn", kaboomproto.Color_COLOR_WHITE, 6, 4),
		newTestPiece("black-bishop", kaboomproto.PieceKind_BISHOP, kaboomproto.Color_COLOR_BLACK, 0, 5),
	}, nil)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CPawnMove{
			CPawnMove: &kaboomproto.C_PawnMove{
				From:      posProto(6, 4),
				To:        posProto(4, 4),
				Promotion: kaboomproto.PieceKind_INVALID_PIECE,
			},
		},
	})

	intent, err := MoveToIntent_PawnDoubleMove.Convert(game, move)
	if err != nil {
		t.Fatalf("convert pawn double move: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected pawn double move intent")
	}

	effects, err := IntentToEffect_PawnDoubleMove.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert pawn double move intent->effects: %v", err)
	}

	finalGame := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPawn("white-pawn", kaboomproto.Color_COLOR_WHITE, 4, 4),
		newTestPiece("black-bishop", kaboomproto.PieceKind_BISHOP, kaboomproto.Color_COLOR_BLACK, 0, 5),
	}, nil)

	assertGameEqualsProto(t, finalGame, expected)
}

func TestPawnPromotion(t *testing.T) {
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPawn("white-pawn", kaboomproto.Color_COLOR_WHITE, 1, 0),
	}, nil)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CPawnMove{
			CPawnMove: &kaboomproto.C_PawnMove{
				From:      posProto(1, 0),
				To:        posProto(0, 0),
				Promotion: kaboomproto.PieceKind_QUEEN,
			},
		},
	})

	intent, err := MoveToIntent_PawnMove.Convert(game, move)
	if err != nil {
		t.Fatalf("convert pawn promotion move: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected pawn promotion move intent")
	}

	effects, err := IntentToEffect_PawnMove.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert pawn promotion intent->effects: %v", err)
	}

	finalGame := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		withKind(newTestPawn("white-pawn", kaboomproto.Color_COLOR_WHITE, 0, 0), kaboomproto.PieceKind_QUEEN),
	}, nil)

	assertGameEqualsProto(t, finalGame, expected)
}
