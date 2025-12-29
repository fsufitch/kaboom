package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func convertKingAction(game kaboomstate.Game, move kaboomstate.Move, movement kaboomstate.PieceMovement, requireCapture bool) (*kaboomstate.Intent, error) {
	from := movement.From
	to := movement.To

	kingPiece, err := game.GetPieceAt("", from)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if kingPiece.Kind() != kaboomproto.PieceKind_KING {
		return nil, fmt.Errorf("%w: no king at %s", kaboom.ErrInvalidMove, describePosition(from))
	}

	board, ok := game.GetBoard(kingPiece.BoardUUID())
	if !ok {
		return nil, fmt.Errorf("%w: king references missing board %q", kaboom.ErrInvalidMove, kingPiece.BoardUUID())
	}

	if err := ensureKingMoveIsValid(movement); err != nil {
		return nil, err
	}

	targetPiece, occupied, err := getPieceAt(game, board.UUID(), to)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if requireCapture {
		if !occupied {
			return nil, fmt.Errorf("%w: capture square %s is empty", kaboom.ErrInvalidMove, describePosition(to))
		}
		if targetPiece.Color() == kingPiece.Color() {
			return nil, fmt.Errorf("%w: cannot capture friendly piece at %s", kaboom.ErrInvalidMove, describePosition(to))
		}
	} else if occupied {
		return nil, fmt.Errorf("%w: destination %s is occupied", kaboom.ErrInvalidMove, describePosition(to))
	}

	actingPlayerUUID, ok := board.PlayerUUIDForColor(kingPiece.Color())
	{
		if !ok {
			return nil, fmt.Errorf("%w: no player assigned color %s on board %s", kaboom.ErrInvalidMove, kingPiece.Color().String(), board.UUID())
		}
	}

	if err := ensurePlayerTurn(game, board, actingPlayerUUID); err != nil {
		return nil, err
	}

	intent := kaboomstate.NewIntentPieceMove(
		kaboom.DefaultUUIDSource.NewUUID().String(),
		actingPlayerUUID,
		board.UUID(),
		move,
	)

	return &intent, nil
}

func ensureKingMoveIsValid(movement kaboomstate.PieceMovement) error {
	dRow := absInt32(movement.Vector.DRow())
	dCol := absInt32(movement.Vector.DCol())

	if dRow == 0 && dCol == 0 {
		return fmt.Errorf("%w: king must move to a different square", kaboom.ErrInvalidMove)
	}

	if dRow <= 1 && dCol <= 1 {
		return nil
	}

	return fmt.Errorf("%w: king can only move one square", kaboom.ErrInvalidMove)
}
