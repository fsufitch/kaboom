package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type Vector struct {
	proto *kaboomproto.Vector
}

func NewVector(dRow, dCol int32) Vector {
	return Vector{
		proto: &kaboomproto.Vector{
			DRow: dRow,
			DCol: dCol,
		},
	}
}

func VectorFromProto(v *kaboomproto.Vector) Vector {
	return Vector{proto: v}
}

func (v Vector) ToProto() *kaboomproto.Vector {
	return proto.CloneOf(v.proto)
}

func (v Vector) Clone() Vector {
	return VectorFromProto(v.ToProto())
}
func (v Vector) DRow() int32 {
	return v.proto.DRow
}

func (v Vector) DCol() int32 {
	return v.proto.DCol
}

func (v Vector) Equals(other Vector) bool {
	return v.DRow() == other.DRow() && v.DCol() == other.DCol()
}

func (v Vector) Validate() error {
	if v.proto == nil {
		return fmt.Errorf("%w: vector data is null", ErrInvalidProto)
	}

	if v.DCol() == 0 && v.DRow() == 0 {
		return fmt.Errorf("%w: vector cannot be zero", ErrInvalidProto)
	}
	return nil
}
