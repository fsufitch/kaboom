package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func ValidateColor(c kaboomproto.Color) error {
	if c != kaboomproto.Color_COLOR_WHITE && c != kaboomproto.Color_COLOR_BLACK {
		return fmt.Errorf("%w: unknown color: %s", ErrInvalidProto, c.String())
	}
	return nil
}

func ColorInvert(c kaboomproto.Color) kaboomproto.Color {
	switch c {
	case kaboomproto.Color_COLOR_WHITE:
		return kaboomproto.Color_COLOR_BLACK
	case kaboomproto.Color_COLOR_BLACK:
		return kaboomproto.Color_COLOR_WHITE
	default:
		panic("(unreachable) invalid color in ColorInvert: " + c.String())
	}
}
