package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

// ensurePlayerTurn verifies that the acting player matches whose turn it is on the board.
func ensurePlayerTurn(game kaboomstate.Game, board kaboomstate.Board, actingPlayerUUID string) error {
	expectedPlayerUUID, expectedColor, err := nextBoardPlayerToAct(game, board)
	if err != nil {
		return err
	}

	if actingPlayerUUID != expectedPlayerUUID {
		return fmt.Errorf("%w: expected %s player (%s) to act next on board %s",
			kaboom.ErrNotYourTurn, expectedColor.String(), expectedPlayerUUID, board.UUID())
	}
	return nil
}

// nextBoardPlayerToAct determines whose turn it is for the given board by
// inspecting the global turn history.
func nextBoardPlayerToAct(game kaboomstate.Game, board kaboomstate.Board) (string, kaboomproto.Color, error) {
	// Walk the turn history backwards to find the last turn played on this board.
	for i := len(game.Turns()) - 1; i >= 0; i-- {
		turn := game.Turns()[i]
		color, ok := board.PlayerColorForPlayer(turn.PlayerUUID())
		if !ok {
			// This turn was for a different board; skip it.
			continue
		}

		nextColor := kaboomstate.ColorInvert(color)
		nextPlayerUUID, ok := board.PlayerUUIDForColor(nextColor)
		if !ok {
			return "", kaboomproto.Color_COLOR_INVALID, fmt.Errorf("board %s missing player for color %s",
				board.UUID(), nextColor.String())
		}
		return nextPlayerUUID, nextColor, nil
	}

	// No turns have been recorded yet; White goes first by convention.
	playerUUID, ok := board.PlayerUUIDForColor(kaboomproto.Color_COLOR_WHITE)
	if !ok {
		return "", kaboomproto.Color_COLOR_INVALID, fmt.Errorf("board %s missing white player", board.UUID())
	}

	return playerUUID, kaboomproto.Color_COLOR_WHITE, nil
}

func lastTurnOnBoard(game kaboomstate.Game, board kaboomstate.Board) (kaboomstate.Turn, bool) {
	for i := len(game.Turns()) - 1; i >= 0; i-- {
		turn := game.Turns()[i]
		for _, effect := range turn.Effects() {
			if effect.BoardUUID() == board.UUID() {
				return turn, true
			}
		}
	}
	return kaboomstate.Turn{}, false
}
