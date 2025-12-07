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

	bishopCapture := move.AsBishopCapture()
	if bishopCapture == nil {
		return nil, fmt.Errorf("%w: bishop capture data missing", kaboom.ErrInvalidMove)
	}

	return convertBishopAction(game, move, bishopCapture.GetFrom(), bishopCapture.GetTo(), true)
}
