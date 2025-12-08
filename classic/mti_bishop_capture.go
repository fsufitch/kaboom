package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
)

var MoveToIntent_BishopCapture = kaboom.MoveToIntentRule{
	ID:          "bishop-capture",
	Description: "A bishop can capture an opposing piece along its diagonal",
	Convert:     convertBishopCapture,
}

func convertBishopCapture(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
	if move.Kind() != kaboomstate.MoveKind_BishopCapture {
		return nil, nil
	}

	movement, err := move.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid bishop trajectory: %v", kaboom.ErrInvalidMove, err)
	}

	return convertBishopAction(game, move, movement, true)
}
