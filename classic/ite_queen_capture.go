package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

var IntentToEffect_QueenCapture = kaboom.IntentToEffectRule{
	ID:          "queen-capture-effect",
	Description: "Apply queen capture intents as move + capture effects",
	Convert:     convertQueenCaptureIntent,
}

func convertQueenCaptureIntent(game kaboomstate.Game, intent kaboomstate.Intent) ([]*kaboomstate.Effect, error) {
	intentProto := intent.ToProto()
	pmProto := intentProto.GetPieceMove()
	if pmProto == nil {
		return nil, nil
	}

	intentPieceMove := kaboomstate.IntentPieceMoveFromProto(pmProto)
	move := intentPieceMove.Move()
	if move.Kind() != kaboomstate.MoveKind_QueenCapture {
		return nil, nil
	}

	movement, err := intentPieceMove.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid queen movement: %v", kaboom.ErrInvalidMove, err)
	}

	board, ok := game.FindBoard(pmProto.GetBoardUuid())
	if !ok {
		return nil, fmt.Errorf("%w: board %s not found for queen capture intent", kaboom.ErrInvalidMove, pmProto.GetBoardUuid())
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

	targetPiece, occupied := pieceAtBoardPosition(game, board.UUID(), to)
	if !occupied {
		return nil, fmt.Errorf("%w: capture square %s is empty", kaboom.ErrInvalidMove, describePosition(to))
	}

	if targetPiece.Color() == queenPiece.Color() {
		return nil, fmt.Errorf("%w: capture target at %s has same color", kaboom.ErrInvalidMove, describePosition(to))
	}

	captureEffectProto := &kaboomproto.Effect{
		Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
		BoardUuid: board.UUID(),
		Why:       fmt.Sprintf("queen %s captures %s at %s", queenPiece.UUID(), targetPiece.UUID(), describePosition(to)),
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
		Why:       fmt.Sprintf("queen %s moves to %s after capture", queenPiece.UUID(), describePosition(to)),
		EffectOneof: &kaboomproto.Effect_PieceMoved{
			PieceMoved: &kaboomproto.Effect__PieceMoved{
				PieceUuid: queenPiece.UUID(),
				Vector:    movement.Vector.ToProto(),
			},
		},
	}

	captureEffect := kaboomstate.EffectFromProto(captureEffectProto)
	moveEffect := kaboomstate.EffectFromProto(moveEffectProto)

	return []*kaboomstate.Effect{&captureEffect, &moveEffect}, nil
}
