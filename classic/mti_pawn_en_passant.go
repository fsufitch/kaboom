package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
)

var MoveToIntent_PawnEnPassant = kaboom.MoveToIntentRule{
	ID:          "pawn-en-passant",
	Description: "A pawn captures en passant",
	Convert:     convertPawnEnPassant,
}

func convertPawnEnPassant(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
	if move.Kind() != kaboomstate.MoveKind_PawnCapture {
		return nil, nil
	}

	pawnCapture := move.AsPawnCapture()
	if pawnCapture == nil {
		return nil, fmt.Errorf("%w: pawn capture data missing", kaboom.ErrInvalidMove)
	}

	movement, err := move.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid pawn capture trajectory: %v", kaboom.ErrInvalidMove, err)
	}

	ctx, err := newPawnContext(game, movement.From)
	if err != nil {
		return nil, err
	}

	if _, occupied := pieceAtBoardPosition(game, ctx.board.UUID(), movement.To); occupied {
		// This is a normal capture, not en passant; let other rules handle it.
		return nil, nil
	}

	if _, err := ensurePawnEnPassantCapture(game, ctx, movement.From, movement.To); err != nil {
		return nil, err
	}

	intent := newPawnIntent(ctx, move)
	return &intent, nil
}
