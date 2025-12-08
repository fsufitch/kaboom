package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

var IntentToEffect_KingCastle = kaboom.IntentToEffectRule{
	ID:          "king-castle-effect",
	Description: "Apply king castle intents as paired king and rook moves",
	Convert:     convertKingCastleIntent,
}

func convertKingCastleIntent(game kaboomstate.Game, intent kaboomstate.Intent) ([]*kaboomstate.Effect, error) {
	intentProto := intent.ToProto()
	pmProto := intentProto.GetPieceMove()
	if pmProto == nil {
		return nil, nil
	}

	intentPieceMove := kaboomstate.IntentPieceMoveFromProto(pmProto)
	move := intentPieceMove.Move()
	if move.Kind() != kaboomstate.MoveKind_KingCastle {
		return nil, nil
	}

	plan, err := analyzeKingCastle(game, move)
	if err != nil {
		return nil, err
	}

	if plan.board.UUID() != pmProto.GetBoardUuid() {
		return nil, fmt.Errorf("%w: castle intent references incorrect board", kaboom.ErrInvalidMove)
	}

	kingVector := kaboomstate.NewVector(plan.kingTo.Row()-plan.kingFrom.Row(), plan.kingTo.Col()-plan.kingFrom.Col())
	rookVector := kaboomstate.NewVector(plan.rookTo.Row()-plan.rookFrom.Row(), plan.rookTo.Col()-plan.rookFrom.Col())

	kingEffectProto := &kaboomproto.Effect{
		Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
		BoardUuid: plan.board.UUID(),
		Why:       fmt.Sprintf("king %s castles to %s", plan.king.UUID(), describePosition(plan.kingTo)),
		EffectOneof: &kaboomproto.Effect_PieceMoved{
			PieceMoved: &kaboomproto.Effect__PieceMoved{
				PieceUuid: plan.king.UUID(),
				Vector:    kingVector.ToProto(),
			},
		},
	}

	rookEffectProto := &kaboomproto.Effect{
		Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
		BoardUuid: plan.board.UUID(),
		Why:       fmt.Sprintf("rook %s moves during castling", plan.rook.UUID()),
		EffectOneof: &kaboomproto.Effect_PieceMoved{
			PieceMoved: &kaboomproto.Effect__PieceMoved{
				PieceUuid: plan.rook.UUID(),
				Vector:    rookVector.ToProto(),
			},
		},
	}

	kingEffect := kaboomstate.EffectFromProto(kingEffectProto)
	rookEffect := kaboomstate.EffectFromProto(rookEffectProto)

	return []*kaboomstate.Effect{&kingEffect, &rookEffect}, nil
}
