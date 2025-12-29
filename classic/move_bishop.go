package classic

import (
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func evaluatePieceMoves_Bishop(game kaboomstate.Game, board kaboomstate.Board, bishop kaboomstate.ChessPiece) ([]kaboomstate.Move, error) {
	directions := []kaboomstate.Vector{
		kaboomstate.NewVector(1, 1), kaboomstate.NewVector(1, -1),
		kaboomstate.NewVector(-1, 1), kaboomstate.NewVector(-1, -1),
	}
	return evaluateSlidingMoves(game, board, bishop, directions,
		func(from, to kaboomstate.Position) kaboomstate.Move {
			return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
				Move: &kaboomproto.KaboomMove_CBishopMove{
					CBishopMove: &kaboomproto.C_BishopMove{From: from.ToProto(), To: to.ToProto()},
				},
			})
		},
		func(from, to kaboomstate.Position) kaboomstate.Move {
			return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
				Move: &kaboomproto.KaboomMove_CBishopCapture{
					CBishopCapture: &kaboomproto.C_BishopCapture{From: from.ToProto(), To: to.ToProto()},
				},
			})
		})
}
