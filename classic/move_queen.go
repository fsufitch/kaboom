package classic

import (
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func evaluatePieceMoves_Queen(game kaboomstate.Game, board kaboomstate.Board, queen kaboomstate.ChessPiece) ([]kaboomstate.Move, error) {
	directions := []kaboomstate.Vector{
		kaboomstate.NewVector(1, 0), kaboomstate.NewVector(-1, 0),
		kaboomstate.NewVector(0, 1), kaboomstate.NewVector(0, -1),
		kaboomstate.NewVector(1, 1), kaboomstate.NewVector(1, -1),
		kaboomstate.NewVector(-1, 1), kaboomstate.NewVector(-1, -1),
	}
	return evaluateSlidingMoves(game, board, queen, directions,
		func(from, to kaboomstate.Position) kaboomstate.Move {
			return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
				Move: &kaboomproto.KaboomMove_CQueenMove{
					CQueenMove: &kaboomproto.C_QueenMove{From: from.ToProto(), To: to.ToProto()},
				},
			})
		},
		func(from, to kaboomstate.Position) kaboomstate.Move {
			return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
				Move: &kaboomproto.KaboomMove_CQueenCapture{
					CQueenCapture: &kaboomproto.C_QueenCapture{From: from.ToProto(), To: to.ToProto()},
				},
			})
		})
}
