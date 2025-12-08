package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
)

var MoveToIntent_KingCapture = kaboom.MoveToIntentRule{
	ID:          "king-capture",
	Description: "A king can capture one square away",
	Convert:     convertKingCapture,
}

func convertKingCapture(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
	if move.Kind() != kaboomstate.MoveKind_KingCapture {
		return nil, nil
	}

	movement, err := move.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid king trajectory: %v", kaboom.ErrInvalidMove, err)
	}

	return convertKingAction(game, move, movement, true)
}
