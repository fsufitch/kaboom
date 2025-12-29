package classic

import (
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func evaluatePieceMoves_Rook(game kaboomstate.Game, board kaboomstate.Board, rook kaboomstate.ChessPiece) ([]kaboomstate.Move, error) {
	directions := []kaboomstate.Vector{
		kaboomstate.NewVector(1, 0), kaboomstate.NewVector(-1, 0),
		kaboomstate.NewVector(0, 1), kaboomstate.NewVector(0, -1),
	}
	return evaluateSlidingMoves(game, board, rook, directions,
		func(from, to kaboomstate.Position) kaboomstate.Move {
			return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
				Move: &kaboomproto.KaboomMove_CRookMove{
					CRookMove: &kaboomproto.C_RookMove{From: from.ToProto(), To: to.ToProto()},
				},
			})
		},
		func(from, to kaboomstate.Position) kaboomstate.Move {
			return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
				Move: &kaboomproto.KaboomMove_CRookCapture{
					CRookCapture: &kaboomproto.C_RookCapture{From: from.ToProto(), To: to.ToProto()},
				},
			})
		})
}
