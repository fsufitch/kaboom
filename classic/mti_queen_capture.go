package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
)

var MoveToIntent_QueenCapture = kaboom.MoveToIntentRule{
	ID:          "queen-capture",
	Description: "A queen can capture along rook or bishop lines",
	Convert:     convertQueenCapture,
}

func convertQueenCapture(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
	if move.Kind() != kaboomstate.MoveKind_QueenCapture {
		return nil, nil
	}

	movement, err := move.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid queen trajectory: %v", kaboom.ErrInvalidMove, err)
	}

	return convertQueenAction(game, move, movement, true)
}
