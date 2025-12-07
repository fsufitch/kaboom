package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

var IntentToEffect_PawnDoubleMove = kaboom.IntentToEffectRule{
	ID:          "pawn-double-move-effect",
	Description: "Apply pawn double-move intents as movement effects",
	Convert:     convertPawnDoubleMoveIntent,
}

var IntentToEffect_PawnMove = kaboom.IntentToEffectRule{
	ID:          "pawn-move-effect",
	Description: "Apply single pawn move intents as movement effects",
	Convert:     convertPawnMoveIntent,
}

func convertPawnDoubleMoveIntent(game kaboomstate.Game, intent kaboomstate.Intent) ([]*kaboomstate.Effect, error) {
	return convertPawnMoveIntentWithDelta(game, intent, 2)
}

func convertPawnMoveIntent(game kaboomstate.Game, intent kaboomstate.Intent) ([]*kaboomstate.Effect, error) {
	return convertPawnMoveIntentWithDelta(game, intent, 1)
}

func convertPawnMoveIntentWithDelta(game kaboomstate.Game, intent kaboomstate.Intent, squares int32) ([]*kaboomstate.Effect, error) {
	intentProto := intent.ToProto()
	pmProto := intentProto.GetPieceMove()
	if pmProto == nil {
		return nil, nil
	}

	move := kaboomstate.MoveFromProto(pmProto.GetMove())
	if move.Kind() != kaboomstate.MoveKind_PawnMove {
		return nil, nil
	}

	board, ok := game.FindBoard(pmProto.GetBoardUuid())
	if !ok {
		return nil, fmt.Errorf("%w: board %s not found for pawn move intent", kaboom.ErrInvalidMove, pmProto.GetBoardUuid())
	}

	pawnMove := move.AsPawnMove()
	if pawnMove == nil {
		return nil, fmt.Errorf("%w: pawn move data missing", kaboom.ErrInvalidMove)
	}

	from := kaboomstate.PositionFromProto(pawnMove.GetFrom())
	if err := from.Validate(); err != nil {
		return nil, fmt.Errorf("%w: invalid pawn origin: %v", kaboom.ErrInvalidMove, err)
	}

	to := kaboomstate.PositionFromProto(pawnMove.GetTo())
	if err := to.Validate(); err != nil {
		return nil, fmt.Errorf("%w: invalid pawn destination: %v", kaboom.ErrInvalidMove, err)
	}

	if absInt32(to.Row()-from.Row()) != squares || from.Col() != to.Col() {
		return nil, nil
	}

	pawn, err := findUniqueBoardPieceAtPosition(game, board.UUID(), from)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if pawn.Kind() != kaboomproto.PieceKind_PAWN {
		return nil, fmt.Errorf("%w: intent references non-pawn piece at %s", kaboom.ErrInvalidMove, describePosition(from))
	}

	if _, occupied := pieceAtBoardPosition(game, board.UUID(), to); occupied {
		return nil, fmt.Errorf("%w: pawn destination %s is occupied", kaboom.ErrInvalidMove, describePosition(to))
	}

	if squares == 2 {
		dir, err := pawnForwardDirection(pawn.Color())
		if err != nil {
			return nil, err
		}
		ctx := pawnContext{pawn: pawn, board: board, direction: dir}
		if err := ensurePawnDoubleAdvance(game, ctx, from, to); err != nil {
			return nil, err
		}
	}

	vector := kaboomstate.NewVector(to.Row()-from.Row(), to.Col()-from.Col())
	moveEffectProto := &kaboomproto.Effect{
		Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
		BoardUuid: board.UUID(),
		Why:       fmt.Sprintf("pawn %s moves from %s to %s", pawn.UUID(), describePosition(from), describePosition(to)),
		EffectOneof: &kaboomproto.Effect_PieceMoved{
			PieceMoved: &kaboomproto.Effect__PieceMoved{
				PieceUuid: pawn.UUID(),
				Vector:    vector.ToProto(),
			},
		},
	}

	effects := []*kaboomstate.Effect{effectFromProto(moveEffectProto)}

	promotionEffects, err := pawnPromotionEffects(pawn, to, move)
	if err != nil {
		return nil, err
	}
	effects = append(effects, promotionEffects...)

	return effects, nil
}
