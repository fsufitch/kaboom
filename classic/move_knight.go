package classic

import (
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func evaluatePieceMoves_Knight(game kaboomstate.Game, board kaboomstate.Board, knight kaboomstate.ChessPiece) ([]kaboomstate.Move, error) {
	from := knight.Position()
	offsets := []kaboomstate.Vector{
		kaboomstate.NewVector(2, 1), kaboomstate.NewVector(2, -1),
		kaboomstate.NewVector(-2, 1), kaboomstate.NewVector(-2, -1),
		kaboomstate.NewVector(1, 2), kaboomstate.NewVector(1, -2),
		kaboomstate.NewVector(-1, 2), kaboomstate.NewVector(-1, -2),
	}

	var moves []kaboomstate.Move
	for _, offset := range offsets {
		target := from.AddVector(offset)
		if !target.InBounds() {
			continue
		}

		targetPiece, occupied, err := getPieceAt(game, board.UUID(), target)
		if err != nil {
			return nil, err
		}

		if occupied {
			if targetPiece.Color() == knight.Color() {
				continue
			}
			move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
				Move: &kaboomproto.KaboomMove_CKnightCapture{
					CKnightCapture: &kaboomproto.C_KnightCapture{From: from.ToProto(), To: target.ToProto()},
				},
			})
			moves = append(moves, move)
			continue
		}

		move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
			Move: &kaboomproto.KaboomMove_CKnightMove{
				CKnightMove: &kaboomproto.C_KnightMove{From: from.ToProto(), To: target.ToProto()},
			},
		})
		moves = append(moves, move)
	}

	return moves, nil
}
