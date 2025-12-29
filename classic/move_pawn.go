package classic

import (
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func evaluatePieceMoves_Pawn(game kaboomstate.Game, pawn kaboomstate.ChessPiece) ([]kaboomstate.Move, error) {
	ctx, err := newPawnContext(game, pawn.Position())
	if err != nil {
		return nil, err
	}

	from := pawn.Position()
	var moves []kaboomstate.Move

	// Single advance
	singleTarget := from.AddVector(kaboomstate.NewVector(ctx.direction, 0))
	if singleTarget.InBounds() {
		if err := ensurePawnSingleAdvance(game, ctx, from, singleTarget); err == nil {
			appendPawnAdvanceMoves(&moves, from, singleTarget, ctx.direction)
		}
	}

	// Double advance
	doubleTarget := from.AddVector(kaboomstate.NewVector(2*ctx.direction, 0))
	if doubleTarget.InBounds() {
		if err := ensurePawnDoubleAdvance(game, ctx, from, doubleTarget); err == nil {
			move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
				Move: &kaboomproto.KaboomMove_CPawnMove{
					CPawnMove: &kaboomproto.C_PawnMove{From: from.ToProto(), To: doubleTarget.ToProto(), Promotion: kaboomproto.PieceKind_INVALID_PIECE},
				},
			})
			moves = append(moves, move)
		}
	}

	// Captures
	for _, deltaCol := range []int32{-1, 1} {
		target := from.AddVector(kaboomstate.NewVector(ctx.direction, deltaCol))
		if !target.InBounds() {
			continue
		}

		if _, err := ensurePawnStandardCapture(game, ctx, from, target); err == nil {
			appendPawnCaptureMoves(&moves, from, target, ctx.direction)
		}
	}

	// En passant captures
	for _, deltaCol := range []int32{-1, 1} {
		target := from.AddVector(kaboomstate.NewVector(ctx.direction, deltaCol))
		if !target.InBounds() {
			continue
		}
		if _, err := ensurePawnEnPassantCapture(game, ctx, from, target); err == nil {
			move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
				Move: &kaboomproto.KaboomMove_CPawnCapture{
					CPawnCapture: &kaboomproto.C_PawnCapture{From: from.ToProto(), To: target.ToProto(), Promotion: kaboomproto.PieceKind_INVALID_PIECE},
				},
			})
			moves = append(moves, move)
		}
	}

	return moves, nil
}

func appendPawnAdvanceMoves(moves *[]kaboomstate.Move, from, to kaboomstate.Position, direction int32) {
	if isPromotionRank(to, direction) {
		for _, promotion := range standardPromotions() {
			move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
				Move: &kaboomproto.KaboomMove_CPawnMove{
					CPawnMove: &kaboomproto.C_PawnMove{From: from.ToProto(), To: to.ToProto(), Promotion: promotion},
				},
			})
			*moves = append(*moves, move)
		}
		return
	}

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CPawnMove{
			CPawnMove: &kaboomproto.C_PawnMove{From: from.ToProto(), To: to.ToProto(), Promotion: kaboomproto.PieceKind_INVALID_PIECE},
		},
	})
	*moves = append(*moves, move)
}

func appendPawnCaptureMoves(moves *[]kaboomstate.Move, from, to kaboomstate.Position, direction int32) {
	if isPromotionRank(to, direction) {
		for _, promotion := range standardPromotions() {
			move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
				Move: &kaboomproto.KaboomMove_CPawnCapture{
					CPawnCapture: &kaboomproto.C_PawnCapture{From: from.ToProto(), To: to.ToProto(), Promotion: promotion},
				},
			})
			*moves = append(*moves, move)
		}
		return
	}

	move := kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
		Move: &kaboomproto.KaboomMove_CPawnCapture{
			CPawnCapture: &kaboomproto.C_PawnCapture{From: from.ToProto(), To: to.ToProto(), Promotion: kaboomproto.PieceKind_INVALID_PIECE},
		},
	})
	*moves = append(*moves, move)
}

func isPromotionRank(pos kaboomstate.Position, direction int32) bool {
	switch direction {
	case 1:
		return pos.Row() == kaboomstate.MAX_ROW
	case -1:
		return pos.Row() == kaboomstate.MIN_ROW
	default:
		return false
	}
}

func standardPromotions() []kaboomproto.PieceKind {
	return []kaboomproto.PieceKind{
		kaboomproto.PieceKind_QUEEN,
		kaboomproto.PieceKind_ROOK,
		kaboomproto.PieceKind_BISHOP,
		kaboomproto.PieceKind_KNIGHT,
	}
}
