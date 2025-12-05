package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type EffectPieceCreated struct {
	proto *kaboomproto.Effect__PieceCreated
}

func EffectPieceCreatedFromProto(epc *kaboomproto.Effect__PieceCreated) EffectPieceCreated {
	return EffectPieceCreated{proto: epc}
}

func (epc EffectPieceCreated) ToProto() *kaboomproto.Effect__PieceCreated {
	return proto.CloneOf(epc.proto)
}

func (epc EffectPieceCreated) Clone() EffectPieceCreated {
	return EffectPieceCreatedFromProto(epc.ToProto())
}

func (epc EffectPieceCreated) Validate() error {
	if epc.proto == nil {
		return fmt.Errorf("%w: piece created data is null", ErrInvalidProto)
	}
	if epc.proto.GetPiece() == nil {
		return fmt.Errorf("%w: piece created missing piece data", ErrInvalidProto)
	}
	return ChessPieceFromProto(epc.proto.GetPiece()).Validate()
}

func (epc EffectPieceCreated) Piece() ChessPiece {
	return ChessPieceFromProto(epc.proto.GetPiece())
}

func (epc EffectPieceCreated) Apply(game Game) (*Game, error) {
	if err := epc.Validate(); err != nil {
		return nil, err
	}

	next := game.Clone()
	newPiece := ChessPieceFromProto(proto.CloneOf(epc.proto.GetPiece()))
	if err := newPiece.Validate(); err != nil {
		return nil, fmt.Errorf("effect piece_created: %w", err)
	}

	if _, _, found := findPieceProto(next.proto, newPiece.UUID()); found {
		return nil, fmt.Errorf("effect piece_created: piece %s already exists", newPiece.UUID())
	}

	if newPiece.BoardUUID() != "" {
		if _, _, ok := findBoardProto(next.proto, newPiece.BoardUUID()); !ok {
			return nil, fmt.Errorf("effect piece_created: board %s not found", newPiece.BoardUUID())
		}
	}

	next.proto.Pieces = append(next.proto.Pieces, newPiece.ToProto())
	return &next, nil
}
