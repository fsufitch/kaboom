package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

type kingCastlePlan struct {
	board    kaboomstate.Board
	king     kaboomstate.ChessPiece
	rook     kaboomstate.ChessPiece
	side     kaboomproto.C_KingCastle_CastleSide
	kingFrom kaboomstate.Position
	kingTo   kaboomstate.Position
	rookFrom kaboomstate.Position
	rookTo   kaboomstate.Position
}

func analyzeKingCastle(game kaboomstate.Game, move kaboomstate.Move) (kingCastlePlan, error) {
	castleProto := move.AsKingCastle()
	if castleProto == nil {
		return kingCastlePlan{}, fmt.Errorf("%w: castle move missing data", kaboom.ErrInvalidMove)
	}

	kingPosProto := castleProto.GetPosition()
	if kingPosProto == nil {
		return kingCastlePlan{}, fmt.Errorf("%w: castle move missing king position", kaboom.ErrInvalidMove)
	}

	kingFrom := kaboomstate.PositionFromProto(kingPosProto)
	if err := kingFrom.Validate(); err != nil {
		return kingCastlePlan{}, fmt.Errorf("%w: invalid castle king position: %v", kaboom.ErrInvalidMove, err)
	}

	side := castleProto.GetSide()
	if side != kaboomproto.C_KingCastle_CASTLE_SIDE_SHORT && side != kaboomproto.C_KingCastle_CASTLE_SIDE_LONG {
		return kingCastlePlan{}, fmt.Errorf("%w: unknown castle side", kaboom.ErrInvalidMove)
	}

	kingPiece, err := findUniqueBoardPieceAtPosition(game, "", kingFrom)
	if err != nil {
		return kingCastlePlan{}, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}
	if kingPiece.Kind() != kaboomproto.PieceKind_KING {
		return kingCastlePlan{}, fmt.Errorf("%w: no king at %s", kaboom.ErrInvalidMove, describePosition(kingFrom))
	}

	board, ok := game.FindBoard(kingPiece.BoardUUID())
	if !ok {
		return kingCastlePlan{}, fmt.Errorf("%w: king references missing board %q", kaboom.ErrInvalidMove, kingPiece.BoardUUID())
	}

	expectedRookCol := int32(kaboomstate.MAX_COL)
	if side == kaboomproto.C_KingCastle_CASTLE_SIDE_LONG {
		expectedRookCol = int32(kaboomstate.MIN_COL)
	}
	rookFrom := kaboomstate.NewPosition(kingFrom.Row(), expectedRookCol)
	rookPiece, occupied := pieceAtBoardPosition(game, board.UUID(), rookFrom)
	if !occupied {
		return kingCastlePlan{}, fmt.Errorf("%w: no rook available at %s for castling", kaboom.ErrInvalidMove, describePosition(rookFrom))
	}
	if rookPiece.Kind() != kaboomproto.PieceKind_ROOK {
		return kingCastlePlan{}, fmt.Errorf("%w: piece at %s is not a rook", kaboom.ErrInvalidMove, describePosition(rookFrom))
	}
	if rookPiece.Color() != kingPiece.Color() {
		return kingCastlePlan{}, fmt.Errorf("%w: rook at %s has mismatched color", kaboom.ErrInvalidMove, describePosition(rookFrom))
	}

	if rookPiece.Position().Row() != kingFrom.Row() {
		return kingCastlePlan{}, fmt.Errorf("%w: rook for castling must share rank", kaboom.ErrInvalidMove)
	}

	step := signInt32(rookFrom.Col() - kingFrom.Col())
	if step == 0 {
		return kingCastlePlan{}, fmt.Errorf("%w: invalid castle configuration", kaboom.ErrInvalidMove)
	}

	for current := kingFrom.AddVector(kaboomstate.NewVector(0, step)); !current.Equals(rookFrom); current = current.AddVector(kaboomstate.NewVector(0, step)) {
		if _, blocked := pieceAtBoardPosition(game, board.UUID(), current); blocked {
			return kingCastlePlan{}, fmt.Errorf("%w: castle path blocked at %s", kaboom.ErrInvalidMove, describePosition(current))
		}
	}

	kingTo, rookTo, err := castleDestinations(kingFrom, side)
	if err != nil {
		return kingCastlePlan{}, err
	}

	if _, occupied := pieceAtBoardPosition(game, board.UUID(), kingTo); occupied {
		return kingCastlePlan{}, fmt.Errorf("%w: king destination %s is occupied", kaboom.ErrInvalidMove, describePosition(kingTo))
	}
	if _, occupied := pieceAtBoardPosition(game, board.UUID(), rookTo); occupied {
		return kingCastlePlan{}, fmt.Errorf("%w: rook destination %s is occupied", kaboom.ErrInvalidMove, describePosition(rookTo))
	}

	if pieceHasMoved(game, kingPiece) {
		return kingCastlePlan{}, fmt.Errorf("%w: king has already moved", kaboom.ErrInvalidMove)
	}
	if pieceHasMoved(game, rookPiece) {
		return kingCastlePlan{}, fmt.Errorf("%w: rook has already moved", kaboom.ErrInvalidMove)
	}

	return kingCastlePlan{
		board:    board,
		king:     kingPiece,
		rook:     rookPiece,
		side:     side,
		kingFrom: kingFrom,
		kingTo:   kingTo,
		rookFrom: rookFrom,
		rookTo:   rookTo,
	}, nil
}

func castleDestinations(from kaboomstate.Position, side kaboomproto.C_KingCastle_CastleSide) (kaboomstate.Position, kaboomstate.Position, error) {
	row := from.Row()
	switch side {
	case kaboomproto.C_KingCastle_CASTLE_SIDE_SHORT:
		if from.Col()+2 > kaboomstate.MAX_COL {
			return kaboomstate.Position{}, kaboomstate.Position{}, fmt.Errorf("%w: king cannot castle short from %s", kaboom.ErrInvalidMove, describePosition(from))
		}
		return kaboomstate.NewPosition(row, from.Col()+2), kaboomstate.NewPosition(row, from.Col()+1), nil
	case kaboomproto.C_KingCastle_CASTLE_SIDE_LONG:
		if from.Col()-2 < kaboomstate.MIN_COL {
			return kaboomstate.Position{}, kaboomstate.Position{}, fmt.Errorf("%w: king cannot castle long from %s", kaboom.ErrInvalidMove, describePosition(from))
		}
		return kaboomstate.NewPosition(row, from.Col()-2), kaboomstate.NewPosition(row, from.Col()-1), nil
	default:
		return kaboomstate.Position{}, kaboomstate.Position{}, fmt.Errorf("%w: unknown castle side", kaboom.ErrInvalidMove)
	}
}

func pieceHasMoved(game kaboomstate.Game, piece kaboomstate.ChessPiece) bool {
	for _, turn := range game.Turns() {
		for _, effect := range turn.Effects() {
			if effect.Kind() != kaboomstate.EffectKindPieceMoved {
				continue
			}
			if effect.PieceMoved().PieceUUID() == piece.UUID() {
				return true
			}
		}
	}
	return false
}
