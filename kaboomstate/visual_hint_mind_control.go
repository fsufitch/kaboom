package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type VisualHintMindControl struct {
	proto *kaboomproto.VisualHint__MindControl
}

func VisualHintMindControlFromProto(vm *kaboomproto.VisualHint__MindControl) VisualHintMindControl {
	return VisualHintMindControl{proto: vm}
}

func (vm VisualHintMindControl) ToProto() *kaboomproto.VisualHint__MindControl {
	return proto.CloneOf(vm.proto)
}

func (vm VisualHintMindControl) Clone() VisualHintMindControl {
	return VisualHintMindControlFromProto(vm.ToProto())
}

func (vm VisualHintMindControl) Validate() error {
	if vm.proto == nil {
		return fmt.Errorf("%w: mind control hint data is null", ErrInvalidProto)
	}
	if vm.PieceAUUID() == "" || vm.PieceBUUID() == "" {
		return fmt.Errorf("%w: mind control hint missing piece uuids", ErrInvalidProto)
	}
	return nil
}

func (vm VisualHintMindControl) PieceAUUID() string {
	return vm.proto.GetPieceAUuid()
}

func (vm VisualHintMindControl) PieceBUUID() string {
	return vm.proto.GetPieceBUuid()
}
