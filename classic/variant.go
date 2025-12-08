package classic

import "github.com/fsufitch/kaboom"

var ClassicChessVariantAdjudicator = kaboom.VariantAdjudicator{
	ID:          "variant.classic",
	Description: "Classic chess rules variant",

	MoveToIntentRules: []kaboom.MoveToIntentRule{
		MoveToIntent_PawnMove,
		MoveToIntent_PawnDoubleMove,
		MoveToIntent_PawnCapture,
		MoveToIntent_PawnEnPassant,
		MoveToIntent_BishopMove,
		MoveToIntent_BishopCapture,
		MoveToIntent_RookMove,
		MoveToIntent_RookCapture,
		MoveToIntent_KnightMove,
		MoveToIntent_KnightCapture,
		MoveToIntent_QueenMove,
		MoveToIntent_QueenCapture,
	},

	IntentToEffectRules: []kaboom.IntentToEffectRule{
		IntentToEffect_PawnMove,
		IntentToEffect_PawnDoubleMove,
		IntentToEffect_PawnCapture,
		IntentToEffect_PawnEnPassant,
		IntentToEffect_BishopMove,
		IntentToEffect_BishopCapture,
		IntentToEffect_RookMove,
		IntentToEffect_RookCapture,
		IntentToEffect_KnightMove,
		IntentToEffect_KnightCapture,
		IntentToEffect_QueenMove,
		IntentToEffect_QueenCapture,
	},

	GameValidatorRules: []kaboom.GameValidatorRule{
		// TODO
	},
}
