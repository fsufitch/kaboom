package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
)

var MoveToIntent_RookCapture = kaboom.MoveToIntentRule{
	ID:          "rook-capture",
	Description: "A rook can capture an opposing piece along ranks or files",
	Convert:     convertRookCapture,
}

func convertRookCapture(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
	if move.Kind() != kaboomstate.MoveKind_RookCapture {
		return nil, nil
	}

	movement, err := move.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid rook trajectory: %v", kaboom.ErrInvalidMove, err)
	}

	return convertRookAction(game, move, movement, true)
}
