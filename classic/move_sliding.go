package classic

import "github.com/fsufitch/kaboom/kaboomstate"

func evaluateSlidingMoves(
	game kaboomstate.Game,
	board kaboomstate.Board,
	piece kaboomstate.ChessPiece,
	directions []kaboomstate.Vector,
	moveFactory func(from, to kaboomstate.Position) kaboomstate.Move,
	captureFactory func(from, to kaboomstate.Position) kaboomstate.Move,
) ([]kaboomstate.Move, error) {
	from := piece.Position()
	var moves []kaboomstate.Move

	for _, direction := range directions {
		for current := from.AddVector(direction); current.InBounds(); current = current.AddVector(direction) {
			targetPiece, occupied, err := getPieceAt(game, board.UUID(), current)
			if err != nil {
				return nil, err
			}

			if occupied {
				if targetPiece.Color() != piece.Color() {
					moves = append(moves, captureFactory(from, current))
				}
				break
			}
			moves = append(moves, moveFactory(from, current))
		}
	}

	return moves, nil
}
