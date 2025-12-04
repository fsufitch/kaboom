package kaboom

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

const (
	ChessPieceKind_King   ChessPieceKind = "piecekind.king"
	MoveKind_KingMove     MoveKind       = "movekind.king.move"
	MoveKind_KingCapture  MoveKind       = "movekind.king.capture"
	MoveKind_KKingBump    MoveKind       = "movekind.king.bump"
	MoveKind_KKingControl MoveKind       = "movekind.king.control"
)

func init() {
	chessPieceTypeToKindMap[kaboomproto.PieceType_KING] = ChessPieceKind_King
	registerMoveConstructor(MoveKind_KingMove, NewKingMove)
	registerMoveConstructor(MoveKind_KingCapture, NewKingCapture)
	registerMoveConstructor(MoveKind_KKingBump, NewKingBump)
	registerMoveConstructor(MoveKind_KKingControl, NewKingControl)

}

// King represents a king chess piece.
type King struct {
	baseChessPiece
}

func (k King) Validate() error {
	return k.validateBasePiece("king", ChessPieceKind_King)
}

// NewKing creates a new King from proto data.
func NewKing(piece *kaboomproto.ChessPiece) (King, error) {
	base := baseChessPiece{data: piece}
	if base.Kind() != ChessPieceKind_King {
		return King{}, fmt.Errorf("piece is not a king (kind=%s)", base.Kind())
	}
	return King{baseChessPiece: base}, nil
}

// KingMove represents a classical king move.
type KingMove struct {
	baseMove
}

func NewKingMove(move *kaboomproto.KaboomMove) (KingMove, error) {
	km := KingMove{}
	km.data = move
	if km.moveData() == nil {
		return KingMove{}, fmt.Errorf("move is not a king move")
	}
	return km, nil
}

func (km KingMove) moveData() *kaboomproto.C_KingMove {
	return km.data.GetCKingMove()
}

func (km KingMove) PiecePosition() Position {
	return Position{data: km.moveData().From}
}

func (km KingMove) Destination() Position {
	return Position{data: km.moveData().To}
}

func (km KingMove) Validate() error {
	data := km.moveData()
	if err := km.validateBaseMove("king move", data == nil, km.PiecePosition); err != nil {
		return err
	}
	if err := km.Destination().Validate(); err != nil {
		return fmt.Errorf("king move (to): %w", err)
	}
	return nil
}

// KingCapture represents a classical king capture.
type KingCapture struct {
	baseMove
}

func NewKingCapture(move *kaboomproto.KaboomMove) (KingCapture, error) {
	kc := KingCapture{}
	kc.data = move
	if kc.moveData() == nil {
		return KingCapture{}, fmt.Errorf("move is not a king capture")
	}
	return kc, nil
}

func (kc KingCapture) moveData() *kaboomproto.C_KingCapture {
	return kc.data.GetCKingCapture()
}

func (kc KingCapture) PiecePosition() Position {
	return Position{data: kc.moveData().From}
}

func (kc KingCapture) Destination() Position {
	return Position{data: kc.moveData().To}
}

func (kc KingCapture) Validate() error {
	data := kc.moveData()
	if err := kc.validateBaseMove("king capture", data == nil, kc.PiecePosition); err != nil {
		return err
	}
	if err := kc.Destination().Validate(); err != nil {
		return fmt.Errorf("king capture (to): %w", err)
	}
	return nil
}

// KingBump represents the Kaboom king bump move.
type KingBump struct {
	baseMove
}

func NewKingBump(move *kaboomproto.KaboomMove) (KingBump, error) {
	kb := KingBump{}
	kb.data = move
	if kb.moveData() == nil {
		return KingBump{}, fmt.Errorf("move is not a king bump")
	}
	return kb, nil
}

func (kb KingBump) moveData() *kaboomproto.K_KingBump {
	return kb.data.GetKKingBump()
}

func (kb KingBump) PiecePosition() Position {
	return Position{data: kb.moveData().From}
}

func (kb KingBump) Destination() Position {
	return Position{data: kb.moveData().To}
}

// BumpVector returns the direction the opposing piece is displaced.
func (kb KingBump) BumpVector() Vector {
	return normalizedVectorBetween(kb.PiecePosition(), kb.Destination())
}

func (kb KingBump) Validate() error {
	data := kb.moveData()
	if err := kb.validateBaseMove("king bump", data == nil, kb.PiecePosition); err != nil {
		return err
	}
	if err := kb.Destination().Validate(); err != nil {
		return fmt.Errorf("king bump (to): %w", err)
	}
	return nil
}

// KingControl represents the Kaboom king control move.
type KingControl struct {
	baseMove
}

func NewKingControl(move *kaboomproto.KaboomMove) (KingControl, error) {
	kc := KingControl{}
	kc.data = move
	if kc.moveData() == nil {
		return KingControl{}, fmt.Errorf("move is not a king control move")
	}
	return kc, nil
}

func (kc KingControl) moveData() *kaboomproto.K_KingControl {
	return kc.data.GetKKingControl()
}

func (kc KingControl) PiecePosition() Position {
	return Position{data: kc.moveData().GetPosition()}
}

// ForcedMove returns the move forced upon the controlled target.
func (kc KingControl) ForcedMove() *kaboomproto.KaboomMove {
	return kc.moveData().GetForcedMove()
}

func (kc KingControl) Validate() error {
	data := kc.moveData()
	if err := kc.validateBaseMove("king control", data == nil, kc.PiecePosition); err != nil {
		return err
	}
	if data.GetForcedMove() == nil {
		return fmt.Errorf("king control missing forced move: %w", ErrGameStateInvalid)
	}
	forcedKind := kindOfMove(data.GetForcedMove())
	constructor, ok := moveKindConstructors[forcedKind]
	if !ok {
		return fmt.Errorf("king control forced move has unknown kind: %w", ErrGameStateInvalid)
	}
	forcedMove, err := constructor(data.GetForcedMove())
	if err != nil {
		return fmt.Errorf("king control forced move invalid: %w", err)
	}
	return validateMove(forcedMove)
}
