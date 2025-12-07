package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
)

var MoveToIntent_PawnMove = kaboom.MoveToIntentRule{
	ID:          "pawn-move",
	Description: "A pawn advances a single square forward",
	Convert:     convertPawnMove,
}

func convertPawnMove(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
	if move.Kind() != kaboomstate.MoveKind_PawnMove {
		return nil, nil
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

	ctx, err := newPawnContext(game, from)
	if err != nil {
		return nil, err
	}

	if err := ensurePawnSingleAdvance(game, ctx, from, to); err != nil {
		return nil, err
	}

	intent := newPawnIntent(ctx, move)
	return &intent, nil
}
