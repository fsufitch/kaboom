package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
)

var MoveToIntent_RookMove = kaboom.MoveToIntentRule{
	ID:          "rook-move",
	Description: "A rook can move along ranks or files",
	Convert:     convertRookMove,
}

func convertRookMove(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
	if move.Kind() != kaboomstate.MoveKind_RookMove {
		return nil, nil
	}

	movement, err := move.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid rook trajectory: %v", kaboom.ErrInvalidMove, err)
	}

	return convertRookAction(game, move, movement, false)
}
