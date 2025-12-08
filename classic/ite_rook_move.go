package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

var IntentToEffect_RookMove = kaboom.IntentToEffectRule{
	ID:          "rook-move-effect",
	Description: "Apply rook move intents as piece movement effects",
	Convert:     convertRookMoveIntent,
}

func convertRookMoveIntent(game kaboomstate.Game, intent kaboomstate.Intent) ([]*kaboomstate.Effect, error) {
	intentProto := intent.ToProto()
	pmProto := intentProto.GetPieceMove()
	if pmProto == nil {
		return nil, nil
	}

	intentPieceMove := kaboomstate.IntentPieceMoveFromProto(pmProto)
	move := intentPieceMove.Move()
	if move.Kind() != kaboomstate.MoveKind_RookMove {
		return nil, nil
	}

	movement, err := intentPieceMove.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid rook movement: %v", kaboom.ErrInvalidMove, err)
	}

	board, ok := game.FindBoard(pmProto.GetBoardUuid())
	if !ok {
		return nil, fmt.Errorf("%w: board %s not found for rook move intent", kaboom.ErrInvalidMove, pmProto.GetBoardUuid())
	}

	from := movement.From
	to := movement.To

	if err := ensureRookMoveIsClear(game, board.UUID(), from, to); err != nil {
		return nil, err
	}

	rookPiece, err := findUniqueBoardPieceAtPosition(game, board.UUID(), from)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if rookPiece.Kind() != kaboomproto.PieceKind_ROOK {
		return nil, fmt.Errorf("%w: intent references non-rook piece at %s", kaboom.ErrInvalidMove, describePosition(from))
	}

	moveEffectProto := &kaboomproto.Effect{
		Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
		BoardUuid: board.UUID(),
		Why:       fmt.Sprintf("rook %s moves from %s to %s", rookPiece.UUID(), describePosition(from), describePosition(to)),
		EffectOneof: &kaboomproto.Effect_PieceMoved{
			PieceMoved: &kaboomproto.Effect__PieceMoved{
				PieceUuid: rookPiece.UUID(),
				Vector:    movement.Vector.ToProto(),
			},
		},
	}

	moveEffect := kaboomstate.EffectFromProto(moveEffectProto)

	return []*kaboomstate.Effect{&moveEffect}, nil
}
