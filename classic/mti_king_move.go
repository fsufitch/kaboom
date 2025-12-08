package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
)

var MoveToIntent_KingMove = kaboom.MoveToIntentRule{
	ID:          "king-move",
	Description: "A king can move one square in any direction",
	Convert:     convertKingMove,
}

func convertKingMove(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
	if move.Kind() != kaboomstate.MoveKind_KingMove {
		return nil, nil
	}

	movement, err := move.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid king trajectory: %v", kaboom.ErrInvalidMove, err)
	}

	return convertKingAction(game, move, movement, false)
}
