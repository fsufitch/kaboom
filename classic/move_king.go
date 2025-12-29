package classic

import (
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func evaluatePieceMoves_King(game kaboomstate.Game, board kaboomstate.Board, king kaboomstate.ChessPiece) ([]kaboomstate.Move, error) {
	from := king.Position()
	var moves []kaboomstate.Move

	for dRow := int32(-1); dRow <= 1; dRow++ {
		for dCol := int32(-1); dCol <= 1; dCol++ {
			if dRow == 0 && dCol == 0 {
				continue
			}

			target := from.AddVector(kaboomstate.NewVector(dRow, dCol))
			if !target.InBounds() {
				continue
			}

			targetPiece, occupied, err := getPieceAt(game, board.UUID(), target)
			if err != nil {
				return nil, err
			}

			if occupied && targetPiece.Color() == king.Color() {
				continue
			}

			if occupied {
				move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
					Move: &kaboomproto.KaboomMove_CKingCapture{
						CKingCapture: &kaboomproto.C_KingCapture{From: from.ToProto(), To: target.ToProto()},
					},
				})
				moves = append(moves, move)
			} else {
				move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
					Move: &kaboomproto.KaboomMove_CKingMove{
						CKingMove: &kaboomproto.C_KingMove{From: from.ToProto(), To: target.ToProto()},
					},
				})
				moves = append(moves, move)
			}
		}
	}

	// Castling options
	castleSides := []kaboomproto.C_KingCastle_CastleSide{
		kaboomproto.C_KingCastle_CASTLE_SIDE_SHORT,
		kaboomproto.C_KingCastle_CASTLE_SIDE_LONG,
	}
	for _, side := range castleSides {
		move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
			Move: &kaboomproto.KaboomMove_CKingCastle{
				CKingCastle: &kaboomproto.C_KingCastle{Position: from.ToProto(), Side: side},
			},
		})
		if _, err := analyzeKingCastle(game, move); err == nil {
			moves = append(moves, move)
		}
	}

	return moves, nil
}
