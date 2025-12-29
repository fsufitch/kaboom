package classic

import (
	"fmt"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

type pawnContext struct {
	pawn             kaboomstate.ChessPiece
	board            kaboomstate.Board
	actingPlayerUUID string
	direction        int32
}

func newPawnContext(game kaboomstate.Game, from kaboomstate.Position) (pawnContext, error) {
	pawn, err := game.GetPieceAt("", from)
	if err != nil {
		return pawnContext{}, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if pawn.Kind() != kaboomproto.PieceKind_PAWN {
		return pawnContext{}, fmt.Errorf("%w: no pawn at %s", kaboom.ErrInvalidMove, describePosition(from))
	}

	board, ok := game.GetBoard(pawn.BoardUUID())
	if !ok {
		return pawnContext{}, fmt.Errorf("%w: pawn references missing board %q", kaboom.ErrInvalidMove, pawn.BoardUUID())
	}

	actingPlayerUUID, ok := board.PlayerUUIDForColor(pawn.Color())
	if !ok {
		return pawnContext{}, fmt.Errorf("%w: no player assigned color %s on board %s", kaboom.ErrInvalidMove, pawn.Color().String(), board.UUID())
	}

	if err := ensurePlayerTurn(game, board, actingPlayerUUID); err != nil {
		return pawnContext{}, err
	}

	dir, err := pawnForwardDirection(pawn.Color())
	if err != nil {
		return pawnContext{}, err
	}

	return pawnContext{
		pawn:             pawn,
		board:            board,
		actingPlayerUUID: actingPlayerUUID,
		direction:        dir,
	}, nil
}

func pawnForwardDirection(color kaboomproto.Color) (int32, error) {
	switch color {
	case kaboomproto.Color_COLOR_WHITE:
		return 1, nil
	case kaboomproto.Color_COLOR_BLACK:
		return -1, nil
	default:
		return 0, fmt.Errorf("%w: unknown pawn color %s", kaboom.ErrInvalidMove, color.String())
	}
}

func pawnStartingRow(color kaboomproto.Color) (int32, error) {
	switch color {
	case kaboomproto.Color_COLOR_WHITE:
		return 1, nil
	case kaboomproto.Color_COLOR_BLACK:
		return 6, nil
	default:
		return -1, fmt.Errorf("%w: unknown pawn color %s", kaboom.ErrInvalidMove, color.String())
	}
}

func ensurePawnSingleAdvance(game kaboomstate.Game, ctx pawnContext, from, to kaboomstate.Position) error {
	if from.Col() != to.Col() {
		return fmt.Errorf("%w: pawns move straight forward for single moves", kaboom.ErrInvalidMove)
	}
	if to.Row()-from.Row() != ctx.direction {
		return fmt.Errorf("%w: pawn moves one square forward", kaboom.ErrInvalidMove)
	}
	if _, occupied, err := getPieceAt(game, ctx.board.UUID(), to); err != nil {
		return fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	} else if occupied {
		return fmt.Errorf("%w: destination %s is occupied", kaboom.ErrInvalidMove, describePosition(to))
	}
	return nil
}

func ensurePawnDoubleAdvance(game kaboomstate.Game, ctx pawnContext, from, to kaboomstate.Position) error {
	if from.Col() != to.Col() {
		return fmt.Errorf("%w: pawns move straight forward for double moves", kaboom.ErrInvalidMove)
	}
	if to.Row()-from.Row() != 2*ctx.direction {
		return fmt.Errorf("%w: pawn double move must advance two squares", kaboom.ErrInvalidMove)
	}

	startRow, err := pawnStartingRow(ctx.pawn.Color())
	if err != nil {
		return err
	}

	if from.Row() != startRow {
		return fmt.Errorf("%w: pawn double move only allowed from starting rank", kaboom.ErrInvalidMove)
	}

	intermediate := kaboomstate.NewPosition(from.Row()+ctx.direction, from.Col())
	if _, occupied, err := getPieceAt(game, ctx.board.UUID(), intermediate); err != nil {
		return fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	} else if occupied {
		return fmt.Errorf("%w: pawn double move blocked at %s", kaboom.ErrInvalidMove, describePosition(intermediate))
	}

	if _, occupied, err := getPieceAt(game, ctx.board.UUID(), to); err != nil {
		return fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	} else if occupied {
		return fmt.Errorf("%w: destination %s is occupied", kaboom.ErrInvalidMove, describePosition(to))
	}

	return nil
}

func ensurePawnStandardCapture(game kaboomstate.Game, ctx pawnContext, from, to kaboomstate.Position) (kaboomstate.ChessPiece, error) {
	if absInt32(to.Col()-from.Col()) != 1 || to.Row()-from.Row() != ctx.direction {
		return kaboomstate.ChessPiece{}, fmt.Errorf("%w: pawn capture must move diagonally forward", kaboom.ErrInvalidMove)
	}

	targetPiece, occupied, err := getPieceAt(game, ctx.board.UUID(), to)
	if err != nil {
		return kaboomstate.ChessPiece{}, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if !occupied {
		return kaboomstate.ChessPiece{}, fmt.Errorf("%w: capture square %s is empty", kaboom.ErrInvalidMove, describePosition(to))
	}

	if targetPiece.Color() == ctx.pawn.Color() {
		return kaboomstate.ChessPiece{}, fmt.Errorf("%w: cannot capture friendly piece at %s", kaboom.ErrInvalidMove, describePosition(to))
	}

	return targetPiece, nil
}

func ensurePawnEnPassantCapture(game kaboomstate.Game, ctx pawnContext, from, to kaboomstate.Position) (kaboomstate.ChessPiece, error) {
	if absInt32(to.Col()-from.Col()) != 1 || to.Row()-from.Row() != ctx.direction {
		return kaboomstate.ChessPiece{}, fmt.Errorf("%w: en passant capture must move diagonally forward", kaboom.ErrInvalidMove)
	}

	if _, occupied, err := getPieceAt(game, ctx.board.UUID(), to); err != nil {
		return kaboomstate.ChessPiece{}, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	} else if occupied {
		return kaboomstate.ChessPiece{}, fmt.Errorf("%w: en passant destination %s must be empty", kaboom.ErrInvalidMove, describePosition(to))
	}

	capturePos := kaboomstate.NewPosition(from.Row(), to.Col())
	if !capturePos.InBounds() {
		return kaboomstate.ChessPiece{}, fmt.Errorf("%w: en passant capture out of bounds", kaboom.ErrInvalidMove)
	}

	targetPiece, occupied, err := getPieceAt(game, ctx.board.UUID(), capturePos)
	if err != nil {
		return kaboomstate.ChessPiece{}, fmt.Errorf("%w: %v", kaboom.ErrInvalidMove, err)
	}

	if !occupied {
		return kaboomstate.ChessPiece{}, fmt.Errorf("%w: no pawn to capture en passant at %s", kaboom.ErrInvalidMove, describePosition(capturePos))
	}

	if targetPiece.Kind() != kaboomproto.PieceKind_PAWN {
		return kaboomstate.ChessPiece{}, fmt.Errorf("%w: en passant target at %s is not a pawn", kaboom.ErrInvalidMove, describePosition(capturePos))
	}

	if targetPiece.Color() == ctx.pawn.Color() {
		return kaboomstate.ChessPiece{}, fmt.Errorf("%w: cannot capture friendly pawn en passant at %s", kaboom.ErrInvalidMove, describePosition(capturePos))
	}

	lastTurn, ok := lastTurnOnBoard(game, ctx.board)
	if !ok {
		return kaboomstate.ChessPiece{}, fmt.Errorf("%w: en passant only allowed immediately after pawn double move", kaboom.ErrInvalidMove)
	}

	expectedPlayer, ok := ctx.board.PlayerUUIDForColor(targetPiece.Color())
	if !ok || lastTurn.PlayerUUID() != expectedPlayer {
		return kaboomstate.ChessPiece{}, fmt.Errorf("%w: en passant must follow opponent's pawn move", kaboom.ErrInvalidMove)
	}

	doubleAdvance := false
	for _, effect := range lastTurn.Effects() {
		if effect.BoardUUID() != ctx.board.UUID() {
			continue
		}
		if effect.Kind() != kaboomstate.EffectKindPieceMoved {
			continue
		}
		moved := effect.PieceMoved()
		if moved.PieceUUID() != targetPiece.UUID() {
			continue
		}
		vector := moved.Vector()
		if vector.DCol() == 0 && absInt32(vector.DRow()) == 2 {
			doubleAdvance = true
			break
		}
	}

	if !doubleAdvance {
		return kaboomstate.ChessPiece{}, fmt.Errorf("%w: target pawn did not move two squares last turn", kaboom.ErrInvalidMove)
	}

	return targetPiece, nil
}

func newPawnIntent(ctx pawnContext, move kaboomstate.Move) kaboomstate.Intent {
	return kaboomstate.NewIntentPieceMove(
		kaboom.DefaultUUIDSource.NewUUID().String(),
		ctx.actingPlayerUUID,
		ctx.board.UUID(),
		move,
	)
}

func pawnPromotionEffects(pawn kaboomstate.ChessPiece, destination kaboomstate.Position, move kaboomstate.Move) ([]*kaboomstate.Effect, error) {
	var promotionKind kaboomproto.PieceKind
	switch move.Kind() {
	case kaboomstate.MoveKind_PawnMove:
		promotionKind = move.AsPawnMove().GetPromotion()
	case kaboomstate.MoveKind_PawnCapture:
		promotionKind = move.AsPawnCapture().GetPromotion()
	default:
		return nil, nil
	}

	if promotionKind == kaboomproto.PieceKind_INVALID_PIECE {
		return nil, nil
	}

	targetRow := destination.Row()
	switch pawn.Color() {
	case kaboomproto.Color_COLOR_WHITE:
		if targetRow != kaboomstate.MAX_ROW {
			return nil, fmt.Errorf("%w: white pawn promotions must land on row %d", kaboom.ErrInvalidMove, kaboomstate.MAX_ROW)
		}
	case kaboomproto.Color_COLOR_BLACK:
		if targetRow != kaboomstate.MIN_ROW {
			return nil, fmt.Errorf("%w: black pawn promotions must land on row %d", kaboom.ErrInvalidMove, kaboomstate.MIN_ROW)
		}
	default:
		return nil, fmt.Errorf("%w: unknown pawn color %s", kaboom.ErrInvalidMove, pawn.Color().String())
	}

	promoEffectProto := &kaboomproto.Effect{
		Uuid:      kaboom.DefaultUUIDSource.NewUUID().String(),
		BoardUuid: pawn.BoardUUID(),
		Why:       fmt.Sprintf("pawn %s promotes to %s", pawn.UUID(), promotionKind.String()),
		EffectOneof: &kaboomproto.Effect_PiecePromoted{
			PiecePromoted: &kaboomproto.Effect__PiecePromoted{
				PieceUuid: pawn.UUID(),
				ToKind:    promotionKind,
			},
		},
	}

	return []*kaboomstate.Effect{effectFromProto(promoEffectProto)}, nil
}
