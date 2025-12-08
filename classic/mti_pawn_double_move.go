package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
)

var MoveToIntent_PawnDoubleMove = kaboom.MoveToIntentRule{
	ID:          "pawn-double-move",
	Description: "A pawn advances two squares from its starting rank",
	Convert:     convertPawnDoubleMove,
}

func convertPawnDoubleMove(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
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

	dRow := movement.Vector.DRow()
	if absInt32(dRow) != 2 {
		return nil, nil
	}

	ctx, err := newPawnContext(game, movement.From)
	if err != nil {
		return nil, err
	}

	if err := ensurePawnDoubleAdvance(game, ctx, movement.From, movement.To); err != nil {
		return nil, err
	}

	intent := newPawnIntent(ctx, move)
	return &intent, nil
}
