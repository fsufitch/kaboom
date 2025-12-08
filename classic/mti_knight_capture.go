package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
)

var MoveToIntent_KnightCapture = kaboom.MoveToIntentRule{
	ID:          "knight-capture",
	Description: "A knight can capture an opposing piece via an L-shaped leap",
	Convert:     convertKnightCapture,
}

func convertKnightCapture(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
	if move.Kind() != kaboomstate.MoveKind_KnightCapture {
		return nil, nil
	}

	movement, err := move.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid knight trajectory: %v", kaboom.ErrInvalidMove, err)
	}

	return convertKnightAction(game, move, movement, true)
}
