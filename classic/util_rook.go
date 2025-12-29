package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func convertRookAction(game kaboomstate.Game, move kaboomstate.Move, movement kaboomstate.PieceMovement, requireCapture bool) (*kaboomstate.Intent, error) {
	from := movement.From
	to := movement.To

	rookPiece, err := game.GetPieceAt("", from)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if rookPiece.Kind() != kaboomproto.PieceKind_ROOK {
		return nil, fmt.Errorf("%w: no rook at %s", kaboom.ErrInvalidMove, describePosition(from))
	}

	board, ok := game.GetBoard(rookPiece.BoardUUID())
	if !ok {
		return nil, fmt.Errorf("%w: rook references missing board %q", kaboom.ErrInvalidMove, rookPiece.BoardUUID())
	}

	if err := ensureRookMoveIsClear(game, board.UUID(), from, to); err != nil {
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
		if targetPiece.Color() == rookPiece.Color() {
			return nil, fmt.Errorf("%w: cannot capture friendly piece at %s", kaboom.ErrInvalidMove, describePosition(to))
		}
	} else if occupied {
		return nil, fmt.Errorf("%w: destination %s is occupied", kaboom.ErrInvalidMove, describePosition(to))
	}

	actingPlayerUUID, ok := board.PlayerUUIDForColor(rookPiece.Color())
	if !ok {
		return nil, fmt.Errorf("%w: no player assigned color %s on board %s", kaboom.ErrInvalidMove, rookPiece.Color().String(), board.UUID())
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

func ensureRookMoveIsClear(game kaboomstate.Game, boardUUID string, from, to kaboomstate.Position) error {
	dRow := to.Row() - from.Row()
	dCol := to.Col() - from.Col()

	if dRow == 0 && dCol == 0 {
		return fmt.Errorf("%w: rook must move to a different square", kaboom.ErrInvalidMove)
	}

	if dRow != 0 && dCol != 0 {
		return fmt.Errorf("%w: rooks move in straight lines", kaboom.ErrInvalidMove)
	}

	step := kaboomstate.NewVector(signInt32(dRow), signInt32(dCol))

	for current := from.AddVector(step); !current.Equals(to); current = current.AddVector(step) {
		if _, blocked, err := getPieceAt(game, boardUUID, current); err != nil {
			return fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
		} else if blocked {
			return fmt.Errorf("%w: rook path blocked at %s", kaboom.ErrInvalidMove, describePosition(current))
		}
	}

	return nil
}
