package classic

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func TestPawnStandardCapture(t *testing.T) {
	captured := newTestPiece("black-rook", kaboomproto.PieceKind_ROOK, kaboomproto.Color_COLOR_BLACK, 4, 4)
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPawn("white-pawn", kaboomproto.Color_COLOR_WHITE, 3, 3),
		captured,
	}, nil)

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CPawnCapture{
			CPawnCapture: &kaboomproto.C_PawnCapture{
				From:      posProto(3, 3),
				To:        posProto(4, 4),
				Promotion: kaboomproto.PieceKind_INVALID_PIECE,
			},
		},
	})

	intent, err := MoveToIntent_PawnCapture.Convert(game, move)
	if err != nil {
		t.Fatalf("convert pawn capture: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected pawn capture intent")
	}

	effects, err := IntentToEffect_PawnCapture.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert pawn capture intent->effects: %v", err)
	}

	finalGame := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPawn("white-pawn", kaboomproto.Color_COLOR_WHITE, 4, 4),
		withZone(captured, kaboomproto.ZoneKind_ZONE_GRAVEYARD),
	}, nil)

	assertGameEqualsProto(t, finalGame, expected)
}

func TestPawnEnPassantCapture(t *testing.T) {
	blackPawn := newTestPawn("black-pawn", kaboomproto.Color_COLOR_BLACK, 4, 5)
	game := newTestGame([]*kaboomproto.ChessPiece{
		newTestPawn("white-pawn", kaboomproto.Color_COLOR_WHITE, 4, 4),
		blackPawn,
	}, []*kaboomproto.Turn{
		{
			Uuid:       "turn-1",
			PlayerUuid: testBlackPlayerUUID,
			Effects: []*kaboomproto.Effect{
				{
					Uuid:      "effect-double",
					BoardUuid: testBoardUUID,
					EffectOneof: &kaboomproto.Effect_PieceMoved{
						PieceMoved: &kaboomproto.Effect__PieceMoved{
							PieceUuid: blackPawn.GetUuid(),
							Vector: &kaboomproto.Vector{
								DRow: -2,
								DCol: 0,
							},
						},
					},
				},
			},
		},
	})

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CPawnCapture{
			CPawnCapture: &kaboomproto.C_PawnCapture{
				From:      posProto(4, 4),
				To:        posProto(5, 5),
				Promotion: kaboomproto.PieceKind_INVALID_PIECE,
			},
		},
	})

	intent, err := MoveToIntent_PawnEnPassant.Convert(game, move)
	if err != nil {
		t.Fatalf("convert pawn en passant: %v", err)
	}
	if intent == nil {
		t.Fatalf("expected pawn en passant intent")
	}

	effects, err := IntentToEffect_PawnEnPassant.Convert(game, *intent)
	if err != nil {
		t.Fatalf("convert pawn en passant intent->effects: %v", err)
	}

	finalGame := applyEffectsToGame(t, game, effects)

	expected := newTestGameProto([]*kaboomproto.ChessPiece{
		newTestPawn("white-pawn", kaboomproto.Color_COLOR_WHITE, 5, 5),
		withZone(blackPawn, kaboomproto.ZoneKind_ZONE_GRAVEYARD),
	}, []*kaboomproto.Turn{
		{
			Uuid:       "turn-1",
			PlayerUuid: testBlackPlayerUUID,
			Effects: []*kaboomproto.Effect{
				{
					Uuid:      "effect-double",
					BoardUuid: testBoardUUID,
					EffectOneof: &kaboomproto.Effect_PieceMoved{
						PieceMoved: &kaboomproto.Effect__PieceMoved{
							PieceUuid: blackPawn.GetUuid(),
							Vector: &kaboomproto.Vector{
								DRow: -2,
								DCol: 0,
							},
						},
					},
				},
			},
		},
	})

	assertGameEqualsProto(t, finalGame, expected)
}
