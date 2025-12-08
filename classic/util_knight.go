package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func convertKnightAction(game kaboomstate.Game, move kaboomstate.Move, movement kaboomstate.PieceMovement, requireCapture bool) (*kaboomstate.Intent, error) {
	from := movement.From
	to := movement.To

	knightPiece, err := findUniqueBoardPieceAtPosition(game, "", from)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if knightPiece.Kind() != kaboomproto.PieceKind_KNIGHT {
		return nil, fmt.Errorf("%w: no knight at %s", kaboom.ErrInvalidMove, describePosition(from))
	}

	board, ok := game.FindBoard(knightPiece.BoardUUID())
	if !ok {
		return nil, fmt.Errorf("%w: knight references missing board %q", kaboom.ErrInvalidMove, knightPiece.BoardUUID())
	}

	if err := ensureKnightMoveIsValid(movement); err != nil {
		return nil, err
	}

	targetPiece, occupied := pieceAtBoardPosition(game, board.UUID(), to)
	if requireCapture {
		if !occupied {
			return nil, fmt.Errorf("%w: capture square %s is empty", kaboom.ErrInvalidMove, describePosition(to))
		}
		if targetPiece.Color() == knightPiece.Color() {
			return nil, fmt.Errorf("%w: cannot capture friendly piece at %s", kaboom.ErrInvalidMove, describePosition(to))
		}
	} else if occupied {
		return nil, fmt.Errorf("%w: destination %s is occupied", kaboom.ErrInvalidMove, describePosition(to))
	}

	actingPlayerUUID, ok := board.PlayerUUIDForColor(knightPiece.Color())
	if !ok {
		return nil, fmt.Errorf("%w: no player assigned color %s on board %s", kaboom.ErrInvalidMove, knightPiece.Color().String(), board.UUID())
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

func ensureKnightMoveIsValid(movement kaboomstate.PieceMovement) error {
	dRow := absInt32(movement.Vector.DRow())
	dCol := absInt32(movement.Vector.DCol())

	if dRow == 0 && dCol == 0 {
		return fmt.Errorf("%w: knight must move to a different square", kaboom.ErrInvalidMove)
	}

	if (dRow == 2 && dCol == 1) || (dRow == 1 && dCol == 2) {
		return nil
	}

	return fmt.Errorf("%w: knights move in L shapes (2x1)", kaboom.ErrInvalidMove)
}
