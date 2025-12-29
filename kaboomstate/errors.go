package kaboomstate

import (
	"errors"
	"fmt"
)

var (
	ErrInvalidProto        = errors.New("invalid proto data")
	ErrMoveHasNoTrajectory = errors.New("move has no board trajectory")
	ErrMoveMissingPosition = errors.New("move missing position data")
)

type ErrPieceNotFound struct {
	BoardUUID string
	Position  Position
}

func (e ErrPieceNotFound) Error() string {
	return fmt.Sprintf("piece not found (board=%s row=%d col=%d)", e.BoardUUID, e.Position.Row(), e.Position.Col())
}

func AsErrPieceNotFound(err error) (*ErrPieceNotFound) {
	var e *ErrPieceNotFound
	if errors.As(err, &e) {
		return e
	}
	return nil
}
