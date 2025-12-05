package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func findPieceProto(gameProto *kaboomproto.Game, pieceUUID string) (int, *kaboomproto.ChessPiece, bool) {
	for idx, piece := range gameProto.GetPieces() {
		if piece.GetUuid() == pieceUUID {
			return idx, piece, true
		}
	}
	return -1, nil, false
}

func findBoardProto(gameProto *kaboomproto.Game, boardUUID string) (int, *kaboomproto.Board, bool) {
	for idx, board := range gameProto.GetBoards() {
		if board.GetUuid() == boardUUID {
			return idx, board, true
		}
	}
	return -1, nil, false
}

func movePieceOnBoard(piece *kaboomproto.ChessPiece, vector Vector) error {
	if piece.GetZone() != kaboomproto.ZoneKind_ZONE_BOARD {
		return fmt.Errorf("piece %s is not on the board (zone=%s)", piece.GetUuid(), piece.GetZone().String())
	}

	current := PositionFromProto(piece.GetPosition())
	if err := current.Validate(); err != nil {
		return err
	}

	next := current.AddVector(vector)
	if err := next.Validate(); err != nil {
		return err
	}

	piece.Position = next.ToProto()
	return nil
}
