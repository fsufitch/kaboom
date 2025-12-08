package classic

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func TestKingCastleShort(t *testing.T) {
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPiece("white-king", kaboomproto.PieceKind_KING, kaboomproto.Color_COLOR_WHITE, 7, 4),
		newTestPiece("white-rook-h", kaboomproto.PieceKind_ROOK, kaboomproto.Color_COLOR_WHITE, 7, 7),
	}, nil)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CKingCastle{
			CKingCastle: &kaboomproto.C_KingCastle{
				Position: posProto(7, 4),
				Side:     kaboomproto.C_KingCastle_CASTLE_SIDE_SHORT,
			},
		},
	})

	intent, err := MoveToIntent_KingCastle.Convert(game, move)
	if err != nil {
		t.Fatalf("convert king castle: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected castle intent")
	}

	effects, err := IntentToEffect_KingCastle.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert king castle intent->effects: %v", err)
	}

	final := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPiece("white-king", kaboomproto.PieceKind_KING, kaboomproto.Color_COLOR_WHITE, 7, 6),
		newTestPiece("white-rook-h", kaboomproto.PieceKind_ROOK, kaboomproto.Color_COLOR_WHITE, 7, 5),
	}, nil)

	assertGameEqualsProto(t, final, expected)
}

func TestKingCastleLong(t *testing.T) {
	turns := []*kaboomproto.Turn{
		{Uuid: "turn-white", PlayerUuid: testWhitePlayerUUID},
	}
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPiece("black-king", kaboomproto.PieceKind_KING, kaboomproto.Color_COLOR_BLACK, 0, 4),
		newTestPiece("black-rook-a", kaboomproto.PieceKind_ROOK, kaboomproto.Color_COLOR_BLACK, 0, 0),
	}, turns)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CKingCastle{
			CKingCastle: &kaboomproto.C_KingCastle{
				Position: posProto(0, 4),
				Side:     kaboomproto.C_KingCastle_CASTLE_SIDE_LONG,
			},
		},
	})

	intent, err := MoveToIntent_KingCastle.Convert(game, move)
	if err != nil {
		t.Fatalf("convert king castle: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected castle intent")
	}

	effects, err := IntentToEffect_KingCastle.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert king castle intent->effects: %v", err)
	}

	final := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPiece("black-king", kaboomproto.PieceKind_KING, kaboomproto.Color_COLOR_BLACK, 0, 2),
		newTestPiece("black-rook-a", kaboomproto.PieceKind_ROOK, kaboomproto.Color_COLOR_BLACK, 0, 3),
	}, turns)

	assertGameEqualsProto(t, final, expected)
}
