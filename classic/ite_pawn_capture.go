package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

var IntentToEffect_PawnCapture = kaboom.IntentToEffectRule{
	ID:          "pawn-capture-effect",
	Description: "Apply pawn capture intents as move + capture effects",
	Convert:     convertPawnCaptureIntent,
}

var IntentToEffect_PawnEnPassant = kaboom.IntentToEffectRule{
	ID:          "pawn-en-passant-effect",
	Description: "Apply pawn en passant intents as special capture effects",
	Convert:     convertPawnEnPassantIntent,
}

func convertPawnCaptureIntent(game kaboomstate.Game, intent kaboomstate.Intent) ([]*kaboomstate.Effect, error) {
	return convertPawnCaptureIntentInternal(game, intent, false)
}

func convertPawnEnPassantIntent(game kaboomstate.Game, intent kaboomstate.Intent) ([]*kaboomstate.Effect, error) {
	return convertPawnCaptureIntentInternal(game, intent, true)
}

func convertPawnCaptureIntentInternal(game kaboomstate.Game, intent kaboomstate.Intent, expectEnPassant bool) ([]*kaboomstate.Effect, error) {
	intentProto := intent.ToProto()
	pmProto := intentProto.GetPieceMove()
	if pmProto == nil {
		return nil, nil
	}

	intentPieceMove := kaboomstate.IntentPieceMoveFromProto(pmProto)
	move := intentPieceMove.Move()
	if move.Kind() != kaboomstate.MoveKind_PawnCapture {
		return nil, nil
	}

	movement, err := intentPieceMove.PieceMovement()
	if err != nil {
		return nil, fmt.Errorf("%w: invalid pawn movement: %v", kaboom.ErrInvalidMove, err)
	}

	board, ok := game.GetBoard(pmProto.GetBoardUuid())
	if !ok {
		return nil, fmt.Errorf("%w: board %s not found for pawn capture intent", kaboom.ErrInvalidMove, pmProto.GetBoardUuid())
	}

	from := movement.From
	to := movement.To

	pawn, err := game.GetPieceAt(board.UUID(), from)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if pawn.Kind() != kaboomproto.PieceKind_PAWN {
		return nil, fmt.Errorf("%w: intent references non-pawn piece at %s", kaboom.ErrInvalidMove, describePosition(from))
	}

	vector := movement.Vector
	if absInt32(vector.DRow()) != 1 || absInt32(vector.DCol()) != 1 {
		return nil, nil
	}

	var capturedPiece kaboomstate.ChessPiece
	if expectEnPassant {
		if _, occupied, err := getPieceAt(game, board.UUID(), to); err != nil {
			return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
		} else if occupied {
			return nil, nil
		}
		dir, err := pawnForwardDirection(pawn.Color())
		if err != nil {
			return nil, err
		}
		ctx := pawnContext{pawn: pawn, board: board, direction: dir}
		capturedPiece, err = ensurePawnEnPassantCapture(game, ctx, from, to)
		if err != nil {
			return nil, err
		}
	} else {
		target, occupied, err := getPieceAt(game, board.UUID(), to)
		if err != nil {
			return nil, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
		}

		if !occupied {
			return nil, nil
		}
		if target.Color() == pawn.Color() {
			return nil, fmt.Errorf("%w: capture target at %s has same color", kaboom.ErrInvalidMove, describePosition(to))
		}
		capturedPiece = target
	}

	moveEffectProto := &kaboomproto.Effect{
		Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
		BoardUuid: board.UUID(),
		Why:       fmt.Sprintf("pawn %s moves to %s", pawn.UUID(), describePosition(to)),
		EffectOneof: &kaboomproto.Effect_PieceMoved{
			PieceMoved: &kaboomproto.Effect__PieceMoved{
				PieceUuid: pawn.UUID(),
				Vector:    vector.ToProto(),
			},
		},
	}

	capturedEffectProto := &kaboomproto.Effect{
		Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
		BoardUuid: board.UUID(),
		Why:       fmt.Sprintf("pawn %s captures %s", pawn.UUID(), capturedPiece.UUID()),
		EffectOneof: &kaboomproto.Effect_PieceCaptured{
			PieceCaptured: &kaboomproto.Effect__PieceCaptured{
				PieceUuid: capturedPiece.UUID(),
			},
		},
		VisualHints: []*kaboomproto.VisualHint{
			{
				Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
				BoardUuid: board.UUID(),
				Hint: &kaboomproto.VisualHint_Disintegration{
					Disintegration: &kaboomproto.VisualHint__Disintegration{
						PieceUuid: capturedPiece.UUID(),
					},
				},
			},
		},
	}

	effects := []*kaboomstate.Effect{
		effectFromProto(capturedEffectProto),
		effectFromProto(moveEffectProto),
	}

	promotionEffects, err := pawnPromotionEffects(pawn, to, move)
	if err != nil {
		return nil, err
	}
	effects = append(effects, promotionEffects...)

	return effects, nil
}
