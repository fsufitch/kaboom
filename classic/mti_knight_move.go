package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
)

var MoveToIntent_KnightMove = kaboom.MoveToIntentRule{
	ID:          "knight-move",
	Description: "A knight can move in an L shape",
	Convert:     convertKnightMove,
}

func convertKnightMove(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
	if move.Kind() != kaboomstate.MoveKind_KnightMove {
		return nil, nil
	}

	movement, err := move.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid knight trajectory: %v", kaboom.ErrInvalidMove, err)
	}

	return convertKnightAction(game, move, movement, false)
}
