package kaboom

import "github.com/google/uuid"

type UUIDSource interface {
	NewUUID() uuid.UUID
}

type defaultUUIDSource struct{}

func (defaultUUIDSource) NewUUID() uuid.UUID {
	return uuid.New()
}

var DefaultUUIDSource UUIDSource = defaultUUIDSource{}
