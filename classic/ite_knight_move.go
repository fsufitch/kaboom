package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

var IntentToEffect_KnightMove = kaboom.IntentToEffectRule{
	ID:          "knight-move-effect",
	Description: "Apply knight move intents as piece movement effects",
	Convert:     convertKnightMoveIntent,
}

func convertKnightMoveIntent(game kaboomstate.Game, intent kaboomstate.Intent) ([]*kaboomstate.Effect, error) {
	intentProto := intent.ToProto()
	pmProto := intentProto.GetPieceMove()
	if pmProto == nil {
		return nil, nil
	}

	intentPieceMove := kaboomstate.IntentPieceMoveFromProto(pmProto)
	move := intentPieceMove.Move()
	if move.Kind() != kaboomstate.MoveKind_KnightMove {
		return nil, nil
	}

	movement, err := intentPieceMove.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid knight movement: %v", kaboom.ErrInvalidMove, err)
	}

	if err := ensureKnightMoveIsValid(movement); err != nil {
		return nil, err
	}

	board, ok := game.GetBoard(pmProto.GetBoardUuid())
	if !ok {
		return nil, fmt.Errorf("%w: board %s not found for knight move intent", kaboom.ErrInvalidMove, pmProto.GetBoardUuid())
	}

	from := movement.From
	to := movement.To

	knightPiece, err := game.GetPieceAt(board.UUID(), from)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if knightPiece.Kind() != kaboomproto.PieceKind_KNIGHT {
		return nil, fmt.Errorf("%w: intent references non-knight piece at %s", kaboom.ErrInvalidMove, describePosition(from))
	}

	if _, occupied, err := getPieceAt(game, board.UUID(), to); err != nil {
		return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	} else if occupied {
		return nil, fmt.Errorf("%w: destination %s is occupied", kaboom.ErrInvalidMove, describePosition(to))
	}

	moveEffectProto := &kaboomproto.Effect{
		Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
		BoardUuid: board.UUID(),
		Why:       fmt.Sprintf("knight %s moves from %s to %s", knightPiece.UUID(), describePosition(from), describePosition(to)),
		EffectOneof: &kaboomproto.Effect_PieceMoved{
			PieceMoved: &kaboomproto.Effect__PieceMoved{
				PieceUuid: knightPiece.UUID(),
				Vector:    movement.Vector.ToProto(),
			},
		},
	}

	moveEffect := kaboomstate.EffectFromProto(moveEffectProto)

	return []*kaboomstate.Effect{&moveEffect}, nil
}
