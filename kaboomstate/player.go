package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/proto"
)

type Player struct {
	proto *kaboomproto.Player
}

func PlayerFromProto(p *kaboomproto.Player) Player {
	return Player{proto: p}
}

func (p Player) ToProto() *kaboomproto.Player {
	return proto.CloneOf(p.proto)
}

func (p Player) Clone() Player {
	return PlayerFromProto(p.ToProto())
}

func (p Player) Validate() error {
	if p.proto == nil {
		return fmt.Errorf("%w: player data is null", ErrInvalidProto)
	}

	if p.UUID() == "" {
		return fmt.Errorf("%w: player uuid is empty", ErrInvalidProto)
	}

	return nil
}

func (p Player) UUID() string {
	return p.proto.GetUuid()
}

func (p Player) Name() string {
	return p.proto.GetName()
}
