package kaboom

import (
	"fmt"

	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

const (
	ChessPieceKind_Bishop  ChessPieceKind = "piecekind.bishop"
	MoveKind_BishopMove    MoveKind       = "movekind.bishop.move"
	MoveKind_BishopCapture MoveKind       = "movekind.bishop.capture"
	MoveKind_KBishopBump   MoveKind       = "movekind.bishop.bump"
	MoveKind_KBishopSnipe  MoveKind       = "movekind.bishop.snipe"
)

func init() {
	chessPieceTypeToKindMap[kaboomproto.PieceType_BISHOP] = ChessPieceKind_Bishop
	moveKindEvaluators[MoveKind_BishopMove] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetCBishopMove() != nil
	}
	moveKindEvaluators[MoveKind_BishopCapture] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetCBishopCapture() != nil
	}
	moveKindEvaluators[MoveKind_KBishopBump] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetKBishopBump() != nil
	}
	moveKindEvaluators[MoveKind_KBishopSnipe] = func(move *kaboomproto.KaboomMove) bool {
		return move.GetKBishopSnipe() != nil
	}
}

// Bishop represents a bishop chess piece.
type Bishop struct {
	baseChessPiece
}

// NewBishop creates a new Bishop from proto data.
func NewBishop(piece *kaboomproto.ChessPiece) (Bishop, error) {
	base := baseChessPiece{data: piece}
	if base.Kind() != ChessPieceKind_Bishop {
		return Bishop{}, fmt.Errorf("piece is not a bishop (kind=%s)", base.Kind())
	}
	return Bishop{baseChessPiece: base}, nil
}

// BishopMove represents a classical bishop move.
type BishopMove struct {
	baseMove
}

func NewBishopMove(move *kaboomproto.KaboomMove) (BishopMove, error) {
	bm := BishopMove{}
	bm.data = move
	if bm.moveData() == nil {
		return BishopMove{}, fmt.Errorf("move is not a bishop move")
	}
	return bm, nil
}

func (bm BishopMove) moveData() *kaboomproto.C_BishopMove {
	return bm.data.GetCBishopMove()
}

func (bm BishopMove) PiecePosition() Position {
	return Position{data: bm.moveData().From}
}

func (bm BishopMove) Destination() Position {
	return Position{data: bm.moveData().To}
}

// BishopCapture represents a bishop capture move.
type BishopCapture struct {
	baseMove
}

func NewBishopCapture(move *kaboomproto.KaboomMove) (BishopCapture, error) {
	bc := BishopCapture{}
	bc.data = move
	if bc.moveData() == nil {
		return BishopCapture{}, fmt.Errorf("move is not a bishop capture")
	}
	return bc, nil
}

func (bc BishopCapture) moveData() *kaboomproto.C_BishopCapture {
	return bc.data.GetCBishopCapture()
}

func (bc BishopCapture) PiecePosition() Position {
	return Position{data: bc.moveData().From}
}

func (bc BishopCapture) Destination() Position {
	return Position{data: bc.moveData().To}
}

// BishopBump represents the Kaboom bishop bump move.
type BishopBump struct {
	baseMove
}

func NewBishopBump(move *kaboomproto.KaboomMove) (BishopBump, error) {
	bb := BishopBump{}
	bb.data = move
	if bb.moveData() == nil {
		return BishopBump{}, fmt.Errorf("move is not a bishop bump")
	}
	return bb, nil
}

func (bb BishopBump) moveData() *kaboomproto.K_BishopBump {
	return bb.data.GetKBishopBump()
}

func (bb BishopBump) PiecePosition() Position {
	return Position{data: bb.moveData().From}
}

func (bb BishopBump) Destination() Position {
	return Position{data: bb.moveData().To}
}

// BumpVector returns the diagonal direction the opponent is pushed.
func (bb BishopBump) BumpVector() Vector {
	return normalizedVectorBetween(bb.PiecePosition(), bb.Destination())
}

// BishopSnipe represents the Kaboom bishop snipe move.
type BishopSnipe struct {
	baseMove
}

func NewBishopSnipe(move *kaboomproto.KaboomMove) (BishopSnipe, error) {
	bs := BishopSnipe{}
	bs.data = move
	if bs.moveData() == nil {
		return BishopSnipe{}, fmt.Errorf("move is not a bishop snipe")
	}
	return bs, nil
}

func (bs BishopSnipe) moveData() *kaboomproto.K_BishopSnipe {
	return bs.data.GetKBishopSnipe()
}

func (bs BishopSnipe) PiecePosition() Position {
	return Position{data: bs.moveData().From}
}

// Target returns the position of the sniped piece.
func (bs BishopSnipe) Target() Position {
	return Position{data: bs.moveData().Target}
}

// BumpVector returns the direction the sniped piece is displaced.
func (bs BishopSnipe) BumpVector() Vector {
	return normalizedVectorBetween(bs.PiecePosition(), bs.Target())
}
