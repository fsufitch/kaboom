package classic

import (
	"errors"

	"github.com/fsufitch/kaboom/kaboomstate"
)

func getPieceAt(game kaboomstate.Game, boardUUID string, position kaboomstate.Position) (kaboomstate.ChessPiece, bool, error) {
	piece, err := game.GetPieceAt(boardUUID, position)
	if err != nil {
		var notFound kaboomstate.ErrPieceNotFound
		if errors.As(err, &notFound) {
			return kaboomstate.ChessPiece{}, false, nil
		}

		return kaboomstate.ChessPiece{}, false, err
	}

	return piece, true, nil
}
