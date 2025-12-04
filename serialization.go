package kaboom

import (
	"fmt"
	"strings"
)

var pieceRunes = map[Color]map[ChessPieceKind]rune{
	ColorWhite: {
		ChessPieceKind_King:   '♔',
		ChessPieceKind_Queen:  '♕',
		ChessPieceKind_Rook:   '♖',
		ChessPieceKind_Bishop: '♗',
		ChessPieceKind_Knight: '♘',
		ChessPieceKind_Pawn:   '♙',
	},
	ColorBlack: {
		ChessPieceKind_King:   '♚',
		ChessPieceKind_Queen:  '♛',
		ChessPieceKind_Rook:   '♜',
		ChessPieceKind_Bishop: '♝',
		ChessPieceKind_Knight: '♞',
		ChessPieceKind_Pawn:   '♟',
	},
}

// SerializeChessBoard renders a ChessBoard as an ASCII grid with coordinates.
func SerializeChessBoard(board ChessBoard) ([]byte, error) {
	pieces, err := board.Pieces()
	if err != nil {
		return nil, fmt.Errorf("retrieve pieces: %w", err)
	}

	grid := [8][8]rune{}
	for _, piece := range pieces {
		pos := piece.Position()
		if !pos.OnTheBoard() {
			return nil, fmt.Errorf("piece at %s is off board", pos)
		}
		r, err := runeForPiece(piece)
		if err != nil {
			return nil, err
		}
		grid[pos.Row()][pos.Col()] = r
	}

	var builder strings.Builder
	fileLabels := []rune("abcdefgh")
	builder.Grow((8 + 4) * 12)
	builder.WriteString("  ")
	for i, label := range fileLabels {
		if i > 0 {
			builder.WriteRune(' ')
		}
		builder.WriteRune(label)
	}
	builder.WriteRune('\n')

	for row := 7; row >= 0; row-- {
		builder.WriteString(fmt.Sprintf("%d ", row+1))
		for col := 0; col < 8; col++ {
			if col > 0 {
				builder.WriteRune(' ')
			}
			if pieceRune := grid[row][col]; pieceRune != 0 {
				builder.WriteRune(pieceRune)
			} else if (row+col)%2 == 0 {
				builder.WriteRune('■')
			} else {
				builder.WriteRune('□')
			}
		}
		builder.WriteString(fmt.Sprintf(" %d\n", row+1))
	}

	builder.WriteString("  ")
	for i, label := range fileLabels {
		if i > 0 {
			builder.WriteRune(' ')
		}
		builder.WriteRune(label)
	}
	builder.WriteRune('\n')

	return []byte(builder.String()), nil
}

func runeForPiece(piece ChessPiece) (rune, error) {
	colorMap, ok := pieceRunes[piece.Color()]
	if !ok {
		return 0, fmt.Errorf("unknown piece color %s", piece.Color())
	}
	r, ok := colorMap[piece.Kind()]
	if !ok {
		return 0, fmt.Errorf("unknown piece kind %s", piece.Kind())
	}
	return r, nil
}
