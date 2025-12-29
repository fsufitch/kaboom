package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func convertQueenAction(game kaboomstate.Game, move kaboomstate.Move, movement kaboomstate.PieceMovement, requireCapture bool) (*kaboomstate.Intent, error) {
	from := movement.From
	to := movement.To

	queenPiece, err := game.GetPieceAt("", from)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if queenPiece.Kind() != kaboomproto.PieceKind_QUEEN {
		return nil, fmt.Errorf("%w: no queen at %s", kaboom.ErrInvalidMove, describePosition(from))
	}

	board, ok := game.GetBoard(queenPiece.BoardUUID())
	if !ok {
		return nil, fmt.Errorf("%w: queen references missing board %q", kaboom.ErrInvalidMove, queenPiece.BoardUUID())
	}

	if err := ensureQueenMoveIsClear(game, board.UUID(), from, to); err != nil {
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
		if targetPiece.Color() == queenPiece.Color() {
			return nil, fmt.Errorf("%w: cannot capture friendly piece at %s", kaboom.ErrInvalidMove, describePosition(to))
		}
	} else if occupied {
		return nil, fmt.Errorf("%w: destination %s is occupied", kaboom.ErrInvalidMove, describePosition(to))
	}

	actingPlayerUUID, ok := board.PlayerUUIDForColor(queenPiece.Color())
	if !ok {
		return nil, fmt.Errorf("%w: no player assigned color %s on board %s", kaboom.ErrInvalidMove, queenPiece.Color().String(), board.UUID())
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

func ensureQueenMoveIsClear(game kaboomstate.Game, boardUUID string, from, to kaboomstate.Position) error {
	dRow := to.Row() - from.Row()
	dCol := to.Col() - from.Col()

	if dRow == 0 && dCol == 0 {
		return fmt.Errorf("%w: queen must move to a different square", kaboom.ErrInvalidMove)
	}

	if dRow == 0 || dCol == 0 {
		return ensureRookMoveIsClear(game, boardUUID, from, to)
	}

	if absInt32(dRow) == absInt32(dCol) {
		return ensureBishopMoveIsClear(game, boardUUID, from, to)
	}

	return fmt.Errorf("%w: queens move along ranks, files, or diagonals", kaboom.ErrInvalidMove)
}
