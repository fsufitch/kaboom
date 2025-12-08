package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

var IntentToEffect_KingMove = kaboom.IntentToEffectRule{
	ID:          "king-move-effect",
	Description: "Apply king move intents as piece movement effects",
	Convert:     convertKingMoveIntent,
}

func convertKingMoveIntent(game kaboomstate.Game, intent kaboomstate.Intent) ([]*kaboomstate.Effect, error) {
	intentProto := intent.ToProto()
	pmProto := intentProto.GetPieceMove()
	if pmProto == nil {
		return nil, nil
	}

	intentPieceMove := kaboomstate.IntentPieceMoveFromProto(pmProto)
	move := intentPieceMove.Move()
	if move.Kind() != kaboomstate.MoveKind_KingMove {
		return nil, nil
	}

	movement, err := intentPieceMove.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid king movement: %v", kaboom.ErrInvalidMove, err)
	}

	if err := ensureKingMoveIsValid(movement); err != nil {
		return nil, err
	}

	board, ok := game.FindBoard(pmProto.GetBoardUuid())
	if !ok {
		return nil, fmt.Errorf("%w: board %s not found for king move intent", kaboom.ErrInvalidMove, pmProto.GetBoardUuid())
	}

	from := movement.From
	to := movement.To

	kingPiece, err := findUniqueBoardPieceAtPosition(game, board.UUID(), from)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if kingPiece.Kind() != kaboomproto.PieceKind_KING {
		return nil, fmt.Errorf("%w: intent references non-king piece at %s", kaboom.ErrInvalidMove, describePosition(from))
	}

	if _, occupied := pieceAtBoardPosition(game, board.UUID(), to); occupied {
		return nil, fmt.Errorf("%w: destination %s is occupied", kaboom.ErrInvalidMove, describePosition(to))
	}

	moveEffectProto := &kaboomproto.Effect{
		Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
		BoardUuid: board.UUID(),
		Why:       fmt.Sprintf("king %s moves from %s to %s", kingPiece.UUID(), describePosition(from), describePosition(to)),
		EffectOneof: &kaboomproto.Effect_PieceMoved{
			PieceMoved: &kaboomproto.Effect__PieceMoved{
				PieceUuid: kingPiece.UUID(),
				Vector:    movement.Vector.ToProto(),
			},
		},
	}

	moveEffect := kaboomstate.EffectFromProto(moveEffectProto)

	return []*kaboomstate.Effect{&moveEffect}, nil
}
