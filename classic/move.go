package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

// EvaluatePieceMoves returns the legal moves for the given piece in the current game state.
func EvaluatePieceMoves(game kaboomstate.Game, pieceUUID string) ([]kaboomstate.Move, error) {
	piece, ok := game.GetPiece(pieceUUID)
	if !ok {
		return nil, fmt.Errorf("piece %s not found", pieceUUID)
	}

	if piece.Zone().Value() != kaboomproto.ZoneKind_ZONE_BOARD {
		return nil, fmt.Errorf("piece %s is not on the board", pieceUUID)
	}

	board, ok := game.GetBoard(piece.BoardUUID())
	if !ok {
		return nil, fmt.Errorf("piece %s references missing board %s", pieceUUID, piece.BoardUUID())
	}

	actingPlayerUUID, ok := board.PlayerUUIDForColor(piece.Color())
	if !ok {
		return nil, fmt.Errorf("no player assigned color %s on board %s", piece.Color().String(), board.UUID())
	}

	if err := ensurePlayerTurn(game, board, actingPlayerUUID); err != nil {
		return nil, err
	}

	switch piece.Kind() {
	case kaboomproto.PieceKind_PAWN:
		return evaluatePieceMoves_Pawn(game, piece)
	case kaboomproto.PieceKind_KNIGHT:
		return evaluatePieceMoves_Knight(game, board, piece)
	case kaboomproto.PieceKind_BISHOP:
		return evaluatePieceMoves_Bishop(game, board, piece)
	case kaboomproto.PieceKind_ROOK:
		return evaluatePieceMoves_Rook(game, board, piece)
	case kaboomproto.PieceKind_QUEEN:
		return evaluatePieceMoves_Queen(game, board, piece)
	case kaboomproto.PieceKind_KING:
		return evaluatePieceMoves_King(game, board, piece)
	default:
		return nil, fmt.Errorf("unknown piece kind: %s", piece.Kind().String())
	}
}
