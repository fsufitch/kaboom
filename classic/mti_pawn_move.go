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

	movement, err := move.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid pawn move trajectory: %v", kaboom.ErrInvalidMove, err)
	}

	ctx, err := newPawnContext(game, movement.From)
	if err != nil {
		return nil, err
	}

	if err := ensurePawnSingleAdvance(game, ctx, movement.From, movement.To); err != nil {
		return nil, err
	}

	intent := newPawnIntent(ctx, move)
	return &intent, nil
}
