package kaboom

import kaboomproto "github.com/fsufitch/kaboom/proto/go"

// MoveKind represents the kind of move being made. Values for this enum are in each piece's specific file.
type MoveKind string

const (
	MoveKind_Unknown MoveKind = "movekind.unknown"
)

var moveKindEvaluators = map[MoveKind]func(move *kaboomproto.KaboomMove) bool{}

func kindOfMove(move *kaboomproto.KaboomMove) MoveKind {
	for kind, evaluator := range moveKindEvaluators {
		if evaluator(move) {
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
