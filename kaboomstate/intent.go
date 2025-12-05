package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type Intent struct {
	proto *kaboomproto.Intent
}

func IntentFromProto(i *kaboomproto.Intent) Intent {
	return Intent{proto: i}
}

func (i Intent) ToProto() *kaboomproto.Intent {
	return proto.CloneOf(i.proto)
}

func (i Intent) Clone() Intent {
	return IntentFromProto(i.ToProto())
}

func (i Intent) Validate() error {
	if i.proto == nil {
		return fmt.Errorf("%w: intent data is null", ErrInvalidProto)
	}

	if i.UUID() == "" {
		return fmt.Errorf("%w: intent uuid is empty", ErrInvalidProto)
	}

	if i.ActingPlayerUUID() == "" {
		return fmt.Errorf("%w: intent missing acting player", ErrInvalidProto)
	}

	actionCount := 0

	if pm := i.proto.GetPieceMove(); pm != nil {
		actionCount++
		if err := IntentPieceMoveFromProto(pm).Validate(); err != nil {
			return err
		}
	}

	if pt := i.proto.GetPieceTransfer(); pt != nil {
		actionCount++
		if err := IntentPieceTransferFromProto(pt).Validate(); err != nil {
			return err
		}
	}

	if r := i.proto.GetResign(); r != nil {
		actionCount++
		if err := IntentResignFromProto(r).Validate(); err != nil {
			return err
		}
	}

	if actionCount == 0 {
		return fmt.Errorf("%w: intent has no action", ErrInvalidProto)
	}
	if actionCount > 1 {
		return fmt.Errorf("%w: intent has multiple actions", ErrInvalidProto)
	}

	return nil
}

func (i Intent) UUID() string {
	return i.proto.GetUuid()
}

func (i Intent) ActingPlayerUUID() string {
	return i.proto.GetActingPlayerUuid()
}

func (i Intent) PieceMove() IntentPieceMove {
	return IntentPieceMoveFromProto(i.proto.GetPieceMove())
}

func (i Intent) PieceTransfer() IntentPieceTransfer {
	return IntentPieceTransferFromProto(i.proto.GetPieceTransfer())
}

func (i Intent) Resign() IntentResign {
	return IntentResignFromProto(i.proto.GetResign())
}

type IntentPieceMove struct {
	proto *kaboomproto.Intent_PieceMove
}

func IntentPieceMoveFromProto(pm *kaboomproto.Intent_PieceMove) IntentPieceMove {
	return IntentPieceMove{proto: pm}
}

func (pm IntentPieceMove) ToProto() *kaboomproto.Intent_PieceMove {
	return proto.CloneOf(pm.proto)
}

func (pm IntentPieceMove) Clone() IntentPieceMove {
	return IntentPieceMoveFromProto(pm.ToProto())
}

func (pm IntentPieceMove) Validate() error {
	if pm.proto == nil {
		return fmt.Errorf("%w: intent piece move data is null", ErrInvalidProto)
	}

	if pm.BoardUUID() == "" {
		return fmt.Errorf("%w: piece move missing board uuid", ErrInvalidProto)
	}

	if pm.proto.GetMove() == nil {
		return fmt.Errorf("%w: piece move missing move data", ErrInvalidProto)
	}

	if err := MoveFromProto(pm.proto.GetMove()).Validate(); err != nil {
		return err
	}

	return nil
}

func (pm IntentPieceMove) BoardUUID() string {
	return pm.proto.GetBoardUuid()
}

func (pm IntentPieceMove) Move() Move {
	return MoveFromProto(pm.proto.GetMove())
}

type IntentPieceTransfer struct {
	proto *kaboomproto.Intent_PieceTransfer
}

func IntentPieceTransferFromProto(pt *kaboomproto.Intent_PieceTransfer) IntentPieceTransfer {
	return IntentPieceTransfer{proto: pt}
}

func (pt IntentPieceTransfer) ToProto() *kaboomproto.Intent_PieceTransfer {
	return proto.CloneOf(pt.proto)
}

func (pt IntentPieceTransfer) Clone() IntentPieceTransfer {
	return IntentPieceTransferFromProto(pt.ToProto())
}

func (pt IntentPieceTransfer) Validate() error {
	if pt.proto == nil {
		return fmt.Errorf("%w: intent piece transfer data is null", ErrInvalidProto)
	}

	if pt.PieceUUID() == "" {
		return fmt.Errorf("%w: piece transfer missing piece uuid", ErrInvalidProto)
	}

	if pt.ToBoardUUID() == "" {
		return fmt.Errorf("%w: piece transfer missing target board uuid", ErrInvalidProto)
	}

	if err := ZoneFromProto(pt.proto.GetToZone()).Validate(); err != nil {
		return err
	}

	if pos := pt.proto.GetToPosition(); pos != nil {
		if err := PositionFromProto(pos).Validate(); err != nil {
			return err
		}
	}

	return nil
}

func (pt IntentPieceTransfer) PieceUUID() string {
	return pt.proto.GetPieceUuid()
}

func (pt IntentPieceTransfer) ToBoardUUID() string {
	return pt.proto.GetToBoardUuid()
}

func (pt IntentPieceTransfer) ToZone() Zone {
	return ZoneFromProto(pt.proto.GetToZone())
}

func (pt IntentPieceTransfer) ToPosition() Position {
	return PositionFromProto(pt.proto.GetToPosition())
}

type IntentResign struct {
	proto *kaboomproto.Intent_Resign
}

func IntentResignFromProto(r *kaboomproto.Intent_Resign) IntentResign {
	return IntentResign{proto: r}
}

func (r IntentResign) ToProto() *kaboomproto.Intent_Resign {
	return proto.CloneOf(r.proto)
}

func (r IntentResign) Clone() IntentResign {
	return IntentResignFromProto(r.ToProto())
}

func (r IntentResign) Validate() error {
	if r.proto == nil {
		return fmt.Errorf("%w: intent resign data is null", ErrInvalidProto)
	}

	if r.BoardUUID() == "" {
		return fmt.Errorf("%w: resign intent missing board uuid", ErrInvalidProto)
	}

	return nil
}

func (r IntentResign) BoardUUID() string {
	return r.proto.GetBoardUuid()
}

func (r IntentResign) Reason() string {
	return r.proto.GetReason()
}
