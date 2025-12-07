package kaboom

import (
	"fmt"
	"strings"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

var pieceRunes = map[kaboomproto.Color]map[kaboomproto.PieceKind]rune{
	kaboomproto.Color_COLOR_WHITE: {
		kaboomproto.PieceKind_KING:   '♔',
		kaboomproto.PieceKind_QUEEN:  '♕',
		kaboomproto.PieceKind_ROOK:   '♖',
		kaboomproto.PieceKind_BISHOP: '♗',
		kaboomproto.PieceKind_KNIGHT: '♘',
		kaboomproto.PieceKind_PAWN:   '♙',
	},
	kaboomproto.Color_COLOR_BLACK: {
		kaboomproto.PieceKind_KING:   '♚',
		kaboomproto.PieceKind_QUEEN:  '♛',
		kaboomproto.PieceKind_ROOK:   '♜',
		kaboomproto.PieceKind_BISHOP: '♝',
		kaboomproto.PieceKind_KNIGHT: '♞',
		kaboomproto.PieceKind_PAWN:   '♟',
	},
}

// SerializeChessBoard renders a board and its pieces as an ASCII grid with coordinates.
func SerializeChessBoard(board kaboomstate.Board, pieces []kaboomstate.ChessPiece) ([]byte, error) {
	if err := board.Validate(); err != nil {
		return nil, fmt.Errorf("invalid board: %w", err)
	}

	boardUUID := board.UUID()
	var grid [8][8]rune

	for _, piece := range pieces {
		if piece.BoardUUID() != boardUUID {
			continue
		}

		if piece.Zone().Value() != kaboomproto.ZoneKind_ZONE_BOARD {
			continue
		}

		if err := piece.Validate(); err != nil {
			return nil, fmt.Errorf("invalid piece %s: %w", piece.UUID(), err)
		}

		pos := piece.Position()
		if err := pos.Validate(); err != nil {
			return nil, fmt.Errorf("piece %s has invalid position: %w", piece.UUID(), err)
		}

		row := int(pos.Row())
		col := int(pos.Col())
		if grid[row][col] != 0 {
			return nil, fmt.Errorf("multiple pieces occupy row=%d col=%d", row, col)
		}

		r, err := runeForPiece(piece)
		if err != nil {
			return nil, fmt.Errorf("cannot render piece %s: %w", piece.UUID(), err)
		}

		grid[row][col] = r
	}

	var builder strings.Builder
	fileLabels := []rune("abcdefgh")
	builder.Grow((8 + 4) * 12)

	writeFileLabels := func() {
		builder.WriteString("  ")
		for i, label := range fileLabels {
			if i > 0 {
				builder.WriteRune(' ')
			}
			builder.WriteRune(label)
		}
		builder.WriteRune('\n')
	}

	writeFileLabels()

	for row := 7; row >= 0; row-- {
		rank := 8 - row
		builder.WriteString(fmt.Sprintf("%d ", rank))
		for col := 0; col < 8; col++ {
			if col > 0 {
				builder.WriteRune(' ')
			}
			if pieceRune := grid[row][col]; pieceRune != 0 {
				builder.WriteRune(pieceRune)
				continue
			}
			if (row+col)%2 == 0 {
				builder.WriteRune('■')
			} else {
				builder.WriteRune('□')
			}
		}
		builder.WriteString(fmt.Sprintf(" %d\n", rank))
	}

	writeFileLabels()

	return []byte(builder.String()), nil
}

func runeForPiece(piece kaboomstate.ChessPiece) (rune, error) {
	colorMap, ok := pieceRunes[piece.Color()]
	if !ok {
		return 0, fmt.Errorf("unknown color %s", piece.Color().String())
	}

	r, ok := colorMap[piece.Kind()]
	if !ok {
		return 0, fmt.Errorf("unknown piece kind %s", piece.Kind().String())
	}

	return r, nil
}
