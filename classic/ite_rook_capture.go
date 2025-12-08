package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

var IntentToEffect_RookCapture = kaboom.IntentToEffectRule{
	ID:          "rook-capture-effect",
	Description: "Apply rook capture intents as move + capture effects",
	Convert:     convertRookCaptureIntent,
}

func convertRookCaptureIntent(game kaboomstate.Game, intent kaboomstate.Intent) ([]*kaboomstate.Effect, error) {
	intentProto := intent.ToProto()
	pmProto := intentProto.GetPieceMove()
	if pmProto == nil {
		return nil, nil
	}

	intentPieceMove := kaboomstate.IntentPieceMoveFromProto(pmProto)
	move := intentPieceMove.Move()
	if move.Kind() != kaboomstate.MoveKind_RookCapture {
		return nil, nil
	}

	movement, err := intentPieceMove.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid rook movement: %v", kaboom.ErrInvalidMove, err)
	}

	board, ok := game.FindBoard(pmProto.GetBoardUuid())
	if !ok {
		return nil, fmt.Errorf("%w: board %s not found for rook capture intent", kaboom.ErrInvalidMove, pmProto.GetBoardUuid())
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

	targetPiece, occupied := pieceAtBoardPosition(game, board.UUID(), to)
	if !occupied {
		return nil, fmt.Errorf("%w: capture square %s is empty", kaboom.ErrInvalidMove, describePosition(to))
	}

	if targetPiece.Color() == rookPiece.Color() {
		return nil, fmt.Errorf("%w: capture target at %s has same color", kaboom.ErrInvalidMove, describePosition(to))
	}

	captureEffectProto := &kaboomproto.Effect{
		Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
		BoardUuid: board.UUID(),
		Why:       fmt.Sprintf("rook %s captures %s at %s", rookPiece.UUID(), targetPiece.UUID(), describePosition(to)),
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
		Why:       fmt.Sprintf("rook %s moves to %s after capture", rookPiece.UUID(), describePosition(to)),
		EffectOneof: &kaboomproto.Effect_PieceMoved{
			PieceMoved: &kaboomproto.Effect__PieceMoved{
				PieceUuid: rookPiece.UUID(),
				Vector:    movement.Vector.ToProto(),
			},
		},
	}

	captureEffect := kaboomstate.EffectFromProto(captureEffectProto)
	moveEffect := kaboomstate.EffectFromProto(moveEffectProto)

	return []*kaboomstate.Effect{&captureEffect, &moveEffect}, nil
}
