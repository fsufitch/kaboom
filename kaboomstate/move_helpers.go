package kaboomstate

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

// PieceMovement describes a move's from/to squares and the resulting vector.
type PieceMovement struct {
	From   Position
	To     Position
	Vector Vector
}

// PieceMovement extracts validated origin/destination data for move kinds that
// describe a trajectory on the board (most normal moves and captures).
func (m Move) PieceMovement() (PieceMovement, error) {
	fromProto, toProto, ok := m.movementEndpoints()
	if !ok {
		return PieceMovement{}, fmt.Errorf("%w: %s", ErrMoveHasNoTrajectory, m.Kind())
	}

	from, err := validatedPositionFromProto(fromProto)
	if err != nil {
		return PieceMovement{}, err
	}

	to, err := validatedPositionFromProto(toProto)
	{
		if err != nil {
			return PieceMovement{}, err
		}
	}

	vector := NewVector(to.Row()-from.Row(), to.Col()-from.Col())
	return PieceMovement{
		From:   from,
		To:     to,
		Vector: vector,
	}, nil
}

// PieceMovement extracts the movement descriptor from an intent's piece move data.
func (pm IntentPieceMove) PieceMovement() (PieceMovement, error) {
	if pm.proto == nil {
		return PieceMovement{}, fmt.Errorf("%w: intent piece move data is null", ErrInvalidProto)
	}
	moveProto := pm.proto.GetMove()
	if moveProto == nil {
		return PieceMovement{}, fmt.Errorf("%w: piece move missing move data", ErrInvalidProto)
	}
	return MoveFromProto(moveProto).PieceMovement()
}

func validatedPositionFromProto(posProto *kaboomproto.Position) (Position, error) {
	if posProto == nil {
		return Position{}, fmt.Errorf("%w: %w", ErrInvalidProto, ErrMoveMissingPosition)
	}
	pos := PositionFromProto(posProto)
	if err := pos.Validate(); err != nil {
		return Position{}, err
	}
	return pos, nil
}

func (m Move) movementEndpoints() (*kaboomproto.Position, *kaboomproto.Position, bool) {
	if m.proto == nil {
		return nil, nil, false
	}

	switch move := m.proto.GetMove().(type) {
	case *kaboomproto.KaboomMove_CPawnMove:
		return move.CPawnMove.GetFrom(), move.CPawnMove.GetTo(), true
	case *kaboomproto.KaboomMove_CPawnCapture:
		return move.CPawnCapture.GetFrom(), move.CPawnCapture.GetTo(), true
	case *kaboomproto.KaboomMove_KPawnBump:
		return move.KPawnBump.GetFrom(), move.KPawnBump.GetTo(), true
	case *kaboomproto.KaboomMove_CKnightMove:
		return move.CKnightMove.GetFrom(), move.CKnightMove.GetTo(), true
	case *kaboomproto.KaboomMove_CKnightCapture:
		return move.CKnightCapture.GetFrom(), move.CKnightCapture.GetTo(), true
	case *kaboomproto.KaboomMove_KKnightBump:
		return move.KKnightBump.GetFrom(), move.KKnightBump.GetTo(), true
	case *kaboomproto.KaboomMove_KKnightStomp:
		return move.KKnightStomp.GetFrom(), move.KKnightStomp.GetTo(), true
	case *kaboomproto.KaboomMove_CBishopMove:
		return move.CBishopMove.GetFrom(), move.CBishopMove.GetTo(), true
	case *kaboomproto.KaboomMove_CBishopCapture:
		return move.CBishopCapture.GetFrom(), move.CBishopCapture.GetTo(), true
	case *kaboomproto.KaboomMove_KBishopBump:
		return move.KBishopBump.GetFrom(), move.KBishopBump.GetTo(), true
	case *kaboomproto.KaboomMove_KBishopSnipe:
		return move.KBishopSnipe.GetFrom(), move.KBishopSnipe.GetTarget(), true
	case *kaboomproto.KaboomMove_CRookMove:
		return move.CRookMove.GetFrom(), move.CRookMove.GetTo(), true
	case *kaboomproto.KaboomMove_CRookCapture:
		return move.CRookCapture.GetFrom(), move.CRookCapture.GetTo(), true
	case *kaboomproto.KaboomMove_KRookBump:
		return move.KRookBump.GetFrom(), move.KRookBump.GetTo(), true
	case *kaboomproto.KaboomMove_KRookTackle:
		return move.KRookTackle.GetFrom(), move.KRookTackle.GetTo(), true
	case *kaboomproto.KaboomMove_CQueenMove:
		return move.CQueenMove.GetFrom(), move.CQueenMove.GetTo(), true
	case *kaboomproto.KaboomMove_CQueenCapture:
		return move.CQueenCapture.GetFrom(), move.CQueenCapture.GetTo(), true
	case *kaboomproto.KaboomMove_KQueenBump:
		return move.KQueenBump.GetFrom(), move.KQueenBump.GetTo(), true
	case *kaboomproto.KaboomMove_CKingMove:
		return move.CKingMove.GetFrom(), move.CKingMove.GetTo(), true
	case *kaboomproto.KaboomMove_CKingCapture:
		return move.CKingCapture.GetFrom(), move.CKingCapture.GetTo(), true
	case *kaboomproto.KaboomMove_KKingBump:
		return move.KKingBump.GetFrom(), move.KKingBump.GetTo(), true
	default:
		return nil, nil, false
	}
}
