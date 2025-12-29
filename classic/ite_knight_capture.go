package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

var IntentToEffect_KnightCapture = kaboom.IntentToEffectRule{
	ID:          "knight-capture-effect",
	Description: "Apply knight capture intents as move + capture effects",
	Convert:     convertKnightCaptureIntent,
}

func convertKnightCaptureIntent(game kaboomstate.Game, intent kaboomstate.Intent) ([]*kaboomstate.Effect, error) {
	intentProto := intent.ToProto()
	pmProto := intentProto.GetPieceMove()
	if pmProto == nil {
		return nil, nil
	}

	intentPieceMove := kaboomstate.IntentPieceMoveFromProto(pmProto)
	move := intentPieceMove.Move()
	if move.Kind() != kaboomstate.MoveKind_KnightCapture {
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
		return nil, fmt.Errorf("%w: board %s not found for knight capture intent", kaboom.ErrInvalidMove, pmProto.GetBoardUuid())
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

	targetPiece, occupied, err := getPieceAt(game, board.UUID(), to)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if !occupied {
		return nil, fmt.Errorf("%w: capture square %s is empty", kaboom.ErrInvalidMove, describePosition(to))
	}

	if targetPiece.Color() == knightPiece.Color() {
		return nil, fmt.Errorf("%w: capture target at %s has same color", kaboom.ErrInvalidMove, describePosition(to))
	}

	captureEffectProto := &kaboomproto.Effect{
		Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
		BoardUuid: board.UUID(),
		Why:       fmt.Sprintf("knight %s captures %s at %s", knightPiece.UUID(), targetPiece.UUID(), describePosition(to)),
		EffectOneof: &kaboomproto.Effect_PieceCaptured{
			PieceCaptured: &kaboomproto.Effect__PieceCaptured{
				PieceUuid: targetPiece.UUID(),
			},
		},
		VisualHints: []*kaboomproto.VisualHint{
			{
				Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
				BoardUuid: board.UUID(),
				Hint: &kaboomproto.VisualHint_Disintegration{
					Disintegration: &kaboomproto.VisualHint__Disintegration{
						PieceUuid: targetPiece.UUID(),
					},
				},
			},
		},
	}

	moveEffectProto := &kaboomproto.Effect{
		Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
		BoardUuid: board.UUID(),
		Why:       fmt.Sprintf("knight %s moves to %s after capture", knightPiece.UUID(), describePosition(to)),
		EffectOneof: &kaboomproto.Effect_PieceMoved{
			PieceMoved: &kaboomproto.Effect__PieceMoved{
				PieceUuid: knightPiece.UUID(),
				Vector:    movement.Vector.ToProto(),
			},
		},
	}

	captureEffect := kaboomstate.EffectFromProto(captureEffectProto)
	moveEffect := kaboomstate.EffectFromProto(moveEffectProto)

	return []*kaboomstate.Effect{&captureEffect, &moveEffect}, nil
}
