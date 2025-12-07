package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
)

var MoveToIntent_PawnCapture = kaboom.MoveToIntentRule{
	ID:          "pawn-capture",
	Description: "A pawn captures diagonally forward",
	Convert:     convertPawnCapture,
}

func convertPawnCapture(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
	if move.Kind() != kaboomstate.MoveKind_PawnCapture {
		return nil, nil
	}

	pawnCapture := move.AsPawnCapture()
	if pawnCapture == nil {
		return nil, fmt.Errorf("%w: pawn capture data missing", kaboom.ErrInvalidMove)
	}

	from := kaboomstate.PositionFromProto(pawnCapture.GetFrom())
	if err := from.Validate(); err != nil {
		return nil, fmt.Errorf("%w: invalid pawn origin: %v", kaboom.ErrInvalidMove, err)
	}

	to := kaboomstate.PositionFromProto(pawnCapture.GetTo())
	if err := to.Validate(); err != nil {
		return nil, fmt.Errorf("%w: invalid pawn destination: %v", kaboom.ErrInvalidMove, err)
	}

	ctx, err := newPawnContext(game, from)
	if err != nil {
		return nil, err
	}

	if _, err := ensurePawnStandardCapture(game, ctx, from, to); err != nil {
		return nil, err
	}

	intent := newPawnIntent(ctx, move)
	return &intent, nil
}
