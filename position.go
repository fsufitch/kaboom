package kaboom

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

// Position represents a position on the chess board.
type Position struct {
	data *kaboomproto.Position
}

func (p Position) Row() int32 {
	return p.data.GetRow()
}

func (p Position) Col() int32 {
	return p.data.GetCol()
}

func (p Position) OnTheBoard() bool {
	row := p.Row()
	col := p.Col()
	return row >= 0 && row < 8 && col >= 0 && col < 8
}

func (p Position) String() string {
	return string(rune('a'+p.Col())) + fmt.Sprintf("%d", p.Row()+1)
}

type Vector struct {
	RowDelta int32
	ColDelta int32
}

func vectorBetween(from, to Position) Vector {
	return Vector{
		RowDelta: to.Row() - from.Row(),
		ColDelta: to.Col() - from.Col(),
	}
}

func normalizedVectorBetween(from, to Position) Vector {
	return vectorBetween(from, to).Normalized()
}

func (v Vector) Normalized() Vector {
	nRow := int32(0)
	if v.RowDelta > 0 {
		nRow = 1
	} else if v.RowDelta < 0 {
		nRow = -1
	}

	nCol := int32(0)
	if v.ColDelta > 0 {
		nCol = 1
	} else if v.ColDelta < 0 {
		nCol = -1
	}

	return Vector{
		RowDelta: nRow,
		ColDelta: nCol,
	}
}
