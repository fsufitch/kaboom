package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
)

var MoveToIntent_QueenMove = kaboom.MoveToIntentRule{
	ID:          "queen-move",
	Description: "A queen can move like a rook or bishop",
	Convert:     convertQueenMove,
}

func convertQueenMove(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
	if move.Kind() != kaboomstate.MoveKind_QueenMove {
		return nil, nil
	}

	movement, err := move.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid queen trajectory: %v", kaboom.ErrInvalidMove, err)
	}

	return convertQueenAction(game, move, movement, false)
}
