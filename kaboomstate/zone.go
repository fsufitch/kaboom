package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

type Zone struct {
	value kaboomproto.ZoneKind
}

func ZoneFromProto(value kaboomproto.ZoneKind) Zone {
	return Zone{value: value}
}

func (z Zone) Value() kaboomproto.ZoneKind {
	return z.value
}

func (z Zone) Validate() error {
	switch z.value {
	case kaboomproto.ZoneKind_ZONE_BOARD,
		kaboomproto.ZoneKind_ZONE_GRAVEYARD,
		kaboomproto.ZoneKind_ZONE_BENCH,
		kaboomproto.ZoneKind_ZONE_TEMPORARY:
		return nil
	default:
		return fmt.Errorf("%w: unknown zone kind: %s", ErrInvalidProto, z.value.String())
	}
}
