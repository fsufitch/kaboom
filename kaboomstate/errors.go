package kaboomstate

import "errors"

var (
	ErrInvalidProto        = errors.New("invalid proto data")
	ErrMoveHasNoTrajectory = errors.New("move has no board trajectory")
	ErrMoveMissingPosition = errors.New("move missing position data")
)
