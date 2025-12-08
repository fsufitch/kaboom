package classic

import (
	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

const ClassicRulesVariant = "rules.classic"

func NewClassicChessGame(whitePlayerName string, blackPlayerName string) kaboomstate.Game {
	uuidSource := kaboom.DefaultUUIDSource

	whitePlayerID := uuidSource.NewUUID().String()
	blackPlayerID := uuidSource.NewUUID().String()
	gameUUID := uuidSource.NewUUID().String()
	boardUUID := uuidSource.NewUUID().String()

	gameProto := &kaboomproto.Game{
		Uuid:         gameUUID,
		RulesVariant: ClassicRulesVariant,
		Players: []*kaboomproto.Player{
			{Uuid: whitePlayerID, Name: whitePlayerName},
			{Uuid: blackPlayerID, Name: blackPlayerName},
		},
		Boards: []*kaboomproto.Board{{
			Uuid: boardUUID,
			PlayerColors: []*kaboomproto.PlayerColor{
				{PlayerUuid: whitePlayerID, Color: kaboomproto.Color_COLOR_WHITE},
				{PlayerUuid: blackPlayerID, Color: kaboomproto.Color_COLOR_BLACK},
			},
		}},
		Pieces: setupClassicPieces(boardUUID, uuidSource),
		Turns:  []*kaboomproto.Turn{},
	}

	return kaboomstate.GameFromProto(gameProto)
}

func setupClassicPieces(boardUUID string, uuidSource kaboom.UUIDSource) []*kaboomproto.ChessPiece {
	var pieces []*kaboomproto.ChessPiece

	appendPiece := func(kind kaboomproto.PieceKind, color kaboomproto.Color, row, col int32) {
		pieces = append(pieces, &kaboomproto.ChessPiece{
			Uuid:      uuidSource.NewUUID().String(),
			Kind:      kind,
			Color:     color,
			BoardUuid: boardUUID,
			Position:  &kaboomproto.Position{Row: row, Col: col},
			Zone:      kaboomproto.ZoneKind_ZONE_BOARD,
		})
	}

	// Place pawns
	for col := int32(0); col < 8; col++ {
		appendPiece(kaboomproto.PieceKind_PAWN, kaboomproto.Color_COLOR_WHITE, 1, col)
		appendPiece(kaboomproto.PieceKind_PAWN, kaboomproto.Color_COLOR_BLACK, 6, col)
	}

	backRank := []kaboomproto.PieceKind{
		kaboomproto.PieceKind_ROOK,
		kaboomproto.PieceKind_KNIGHT,
		kaboomproto.PieceKind_BISHOP,
		kaboomproto.PieceKind_QUEEN,
		kaboomproto.PieceKind_KING,
		kaboomproto.PieceKind_BISHOP,
		kaboomproto.PieceKind_KNIGHT,
		kaboomproto.PieceKind_ROOK,
	}

	for col, kind := range backRank {
		appendPiece(kind, kaboomproto.Color_COLOR_WHITE, 0, int32(col))
		appendPiece(kind, kaboomproto.Color_COLOR_BLACK, 7, int32(col))
	}

	return pieces
}
