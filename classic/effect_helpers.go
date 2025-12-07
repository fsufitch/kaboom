package classic

import (
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func effectFromProto(proto *kaboomproto.Effect) *kaboomstate.Effect {
	effect := kaboomstate.EffectFromProto(proto)
	return &effect
}
