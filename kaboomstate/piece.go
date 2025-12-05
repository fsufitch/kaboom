package kaboomstate

import (
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type ChessPiece struct {
	proto *kaboomproto.ChessPiece
}

func ChessPieceFromProto(cp *kaboomproto.ChessPiece) ChessPiece {
	return ChessPiece{proto: cp}
}

func (cp ChessPiece) ToProto() *kaboomproto.ChessPiece {
	return proto.CloneOf(cp.proto)
}

func (cp ChessPiece) Clone() ChessPiece {
	return ChessPieceFromProto(cp.ToProto())
}
func (cp ChessPiece) Validate() error {
	if err := ValidateColor(cp.Color()); err != nil {
		return err
	}

	if err := cp.Position().Validate(); err != nil {
		return err
	}

	return nil
}

func (cp ChessPiece) Color() kaboomproto.Color {
	return cp.proto.GetColor()
}

func (cp ChessPiece) Position() Position {
	return PositionFromProto(cp.proto.Position)
}

func (cp ChessPiece) Zone() Zone {
	return ZoneFromProto(cp.proto.Zone)
}

func (cp ChessPiece) BoardUUID() string {
	return cp.proto.GetBoardUuid()
}

func (cp ChessPiece) UUID() string {
	return cp.proto.GetUuid()
}

func (cp ChessPiece) Kind() kaboomproto.PieceKind {
	return cp.proto.GetKind()
}

func (cp ChessPiece) WithPosition(pos Position) ChessPiece {
	newPiece := cp.Clone()
	newPiece.proto.Position = pos.ToProto()
	return newPiece
}

func (cp ChessPiece) WithZone(zone Zone) ChessPiece {
	newPiece := cp.Clone()
	newPiece.proto.Zone = zone.Value()
	return newPiece
}

func (cp ChessPiece) WithBoardUUID(boardUUID string) ChessPiece {
	newPiece := cp.Clone()
	newPiece.proto.BoardUuid = boardUUID
	return newPiece
}

func (cp ChessPiece) WithKind(kind kaboomproto.PieceKind) ChessPiece {
	newPiece := cp.Clone()
	newPiece.proto.Kind = kind
	return newPiece
}
