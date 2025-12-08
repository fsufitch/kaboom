package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
)

var MoveToIntent_BishopMove = kaboom.MoveToIntentRule{
	ID:          "bishop-move",
	Description: "A bishop can move along its diagonal",
	Convert:     convertBishopMove,
}

func convertBishopMove(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
	if move.Kind() != kaboomstate.MoveKind_BishopMove {
		return nil, nil
	}

	movement, err := move.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid bishop trajectory: %v", kaboom.ErrInvalidMove, err)
	}

	return convertBishopAction(game, move, movement, false)
}
