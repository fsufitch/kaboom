package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

var IntentToEffect_QueenMove = kaboom.IntentToEffectRule{
	ID:          "queen-move-effect",
	Description: "Apply queen move intents as piece movement effects",
	Convert:     convertQueenMoveIntent,
}

func convertQueenMoveIntent(game kaboomstate.Game, intent kaboomstate.Intent) ([]*kaboomstate.Effect, error) {
	intentProto := intent.ToProto()
	pmProto := intentProto.GetPieceMove()
	if pmProto == nil {
		return nil, nil
	}

	intentPieceMove := kaboomstate.IntentPieceMoveFromProto(pmProto)
	move := intentPieceMove.Move()
	if move.Kind() != kaboomstate.MoveKind_QueenMove {
		return nil, nil
	}

	movement, err := intentPieceMove.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid queen movement: %v", kaboom.ErrInvalidMove, err)
	}

	board, ok := game.FindBoard(pmProto.GetBoardUuid())
	if !ok {
		return nil, fmt.Errorf("%w: board %s not found for queen move intent", kaboom.ErrInvalidMove, pmProto.GetBoardUuid())
	}

	from := movement.From
	to := movement.To

	if err := ensureQueenMoveIsClear(game, board.UUID(), from, to); err != nil {
		return nil, err
	}

	queenPiece, err := findUniqueBoardPieceAtPosition(game, board.UUID(), from)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if queenPiece.Kind() != kaboomproto.PieceKind_QUEEN {
		return nil, fmt.Errorf("%w: intent references non-queen piece at %s", kaboom.ErrInvalidMove, describePosition(from))
	}

	if _, occupied := pieceAtBoardPosition(game, board.UUID(), to); occupied {
		return nil, fmt.Errorf("%w: destination %s is occupied", kaboom.ErrInvalidMove, describePosition(to))
	}

	moveEffectProto := &kaboomproto.Effect{
		Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
		BoardUuid: board.UUID(),
		Why:       fmt.Sprintf("queen %s moves from %s to %s", queenPiece.UUID(), describePosition(from), describePosition(to)),
		EffectOneof: &kaboomproto.Effect_PieceMoved{
			PieceMoved: &kaboomproto.Effect__PieceMoved{
				PieceUuid: queenPiece.UUID(),
				Vector:    movement.Vector.ToProto(),
			},
		},
	}

	moveEffect := kaboomstate.EffectFromProto(moveEffectProto)

	return []*kaboomstate.Effect{&moveEffect}, nil
}
