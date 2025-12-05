package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

const MIN_ROW = 0
const MAX_ROW = 7
const MIN_COL = 0
const MAX_COL = 7

type Position struct {
	proto *kaboomproto.Position
}

func NewPosition(row, col int32) Position {
	return Position{
		proto: &kaboomproto.Position{
			Row: row,
			Col: col,
		},
	}
}

func PositionFromProto(p *kaboomproto.Position) Position {
	return Position{proto: p}
}

func (p Position) ToProto() *kaboomproto.Position {
	return proto.CloneOf(p.proto)
}

func (p Position) Clone() Position {
	return PositionFromProto(p.ToProto())
}

func (p Position) Validate() error {
	if p.proto == nil {
		return fmt.Errorf("%w: position data is null", ErrInvalidProto)
	}
	if !p.InBounds() {
		return fmt.Errorf("%w: position out of bounds: row=%d, col=%d", ErrInvalidProto, p.proto.Row, p.proto.Col)
	}

	return nil
}

func (p Position) Row() int32 {
	return p.proto.Row
}

func (p Position) Col() int32 {
	return p.proto.Col
}

func (p Position) InBounds() bool {
	return p.Row() >= MIN_ROW && p.Row() <= MAX_ROW &&
		p.Col() >= MIN_COL && p.Col() <= MAX_COL
}

func (p Position) AddVector(v Vector) Position {
	return NewPosition(p.proto.Row+v.DRow(), p.proto.Col+v.DCol())
}

func (p Position) Equals(other Position) bool {
	return p.Row() == other.Row() && p.Col() == other.Col()
}
