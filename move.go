package kaboom

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

// MoveKind represents the kind of move being made. Values for this enum are in each piece's specific file.
type MoveKind string

const (
	MoveKind_Unknown MoveKind = "movekind.unknown"
)

var moveKindConstructors = map[MoveKind]func(move *kaboomproto.KaboomMove) (Move, error){
	MoveKind_Unknown: func(move *kaboomproto.KaboomMove) (Move, error) {
		return nil, fmt.Errorf("tried to construct move of unknown kind")
	},
}

func registerMoveConstructor[T Move](kind MoveKind, fn func(move *kaboomproto.KaboomMove) (T, error)) {
	moveKindConstructors[kind] = func(move *kaboomproto.KaboomMove) (Move, error) {
		return fn(move)
	}
}

func kindOfMove(move *kaboomproto.KaboomMove) MoveKind {
	if move == nil {
		return MoveKind_Unknown
	}
	for kind, constructor := range moveKindConstructors {
		if _, err := constructor(move); err == nil {
			return kind
		}
	}
	return MoveKind_Unknown
}

// Move represents a chess move. It is an interface implemented by each specific move type.
type Move interface {
	Kind() MoveKind
	PiecePosition() Position
}

type baseMove struct {
	data *kaboomproto.KaboomMove
}

func (bm baseMove) Kind() MoveKind {
	return kindOfMove(bm.data)
}
