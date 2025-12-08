package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
)

var MoveToIntent_KingCastle = kaboom.MoveToIntentRule{
	ID:          "king-castle",
	Description: "A king can castle using the rook on the same rank",
	Convert:     convertKingCastleMove,
}

func convertKingCastleMove(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
	if move.Kind() != kaboomstate.MoveKind_KingCastle {
		return nil, nil
	}

	plan, err := analyzeKingCastle(game, move)
	if err != nil {
		return nil, err
	}

	actingPlayerUUID, ok := plan.board.PlayerUUIDForColor(plan.king.Color())
	if !ok {
		return nil, fmt.Errorf("%w: no player assigned color %s on board %s", kaboom.ErrInvalidMove, plan.king.Color().String(), plan.board.UUID())
	}

	if err := ensurePlayerTurn(game, plan.board, actingPlayerUUID); err != nil {
		return nil, err
	}

	intent := kaboomstate.NewIntentPieceMove(
		kaboom.DefaultUUIDSource.NewUUID().String(),
		actingPlayerUUID,
		plan.board.UUID(),
		move,
	)

	return &intent, nil
}
