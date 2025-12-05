package kaboom

// import (
// 	"errors"
// 	"fmt"

// 	kaboomproto "github.com/fsufitch/kaboom/proto/go"
// 	"google.golang.org/protobuf/proto"
// )

// var ErrUnknownEffectType = errors.New("unknown effect type")

// func ApplyEffect(originalState *kaboomproto.Game, effect *kaboomproto.Effect) (*kaboomproto.Game, error) {
// 	var err error
// 	nextState := proto.CloneOf(originalState)

// 	switch eff := effect.Effect.(type) {
// 	case *kaboomproto.Effect_NothingHappens:
// 		err = applyEffect_NothingHappens(eff, nextState)
// 	case *kaboomproto.Effect_PieceCreated:
// 		err = applyEffect_PieceCreated(eff, nextState)
// 	case *kaboomproto.Effect_PieceDeleted:
// 		err = applyEffect_PieceDeleted(eff, nextState)
// 	case *kaboomproto.Effect_PieceMoved:
// 		err = applyEffect_PieceMoved(eff, nextState)
// 	case *kaboomproto.Effect_PieceCaptured:
// 		err = applyEffect_PieceCaptured(eff, nextState)
// 	case *kaboomproto.Effect_PieceBumped:
// 		err = applyEffect_PieceBumped(eff, nextState)
// 	case *kaboomproto.Effect_PiecePromoted:
// 		err = applyEffect_PiecePromoted(eff, nextState)
// 	case *kaboomproto.Effect_PieceDeployed:
// 		err = applyEffect_PieceDeployed(eff, nextState)
// 	case *kaboomproto.Effect_PieceTransfer:
// 		err = applyEffect_PieceTransfer(eff, nextState)
// 	case *kaboomproto.Effect_Win:
// 		err = applyEffect_Win(eff, effect.GetBoardUuid(), nextState)
// 	default:
// 		err = fmt.Errorf("ApplyEffect: %w: %T", ErrUnknownEffectType, eff)
// 	}

// 	return nextState, err
// }

// func applyEffect_NothingHappens(effect *kaboomproto.Effect_NothingHappens, state *kaboomproto.Game) error {
// 	return nil
// }

// func applyEffect_PieceCreated(effect *kaboomproto.Effect_PieceCreated, state *kaboomproto.Game) error {
// 	piece := effect.PieceCreated.GetPiece()

// 	// TODO: auto-fill the UUID if it's empty

// 	for _, existingPiece := range state.Pieces {
// 		if existingPiece.GetUuid() != piece.GetUuid() {
// 			continue
// 		}
// 		return fmt.Errorf("applyEffect_PieceCreated: piece with UUID %s already exists", piece.GetUuid())
// 	}

// 	state.Pieces = append(state.Pieces, piece)
// 	return nil
// }

// func applyEffect_PieceDeleted(effect *kaboomproto.Effect_PieceDeleted, state *kaboomproto.Game) error {
// 	pieceUUIDToDelete := effect.PieceDeleted.GetPieceUuid()
// 	var updatedPieces []*kaboomproto.ChessPiece
// 	success := false

// 	for _, piece := range state.Pieces {
// 		if piece.GetUuid() != pieceUUIDToDelete {
// 			updatedPieces = append(updatedPieces, piece)
// 		}
// 	}
// 	if !success {
// 		return fmt.Errorf("applyEffect_PieceDeleted: piece with UUID %s not found", pieceUUIDToDelete)
// 	}

// 	state.Pieces = updatedPieces
// 	return nil
// }

// func applyEffect_PieceMoved(effect *kaboomproto.Effect_PieceMoved, state *kaboomproto.Game) (err error) {
// 	for _, p := range state.Pieces {
// 		if p.GetUuid() != effect.PieceMoved.GetPieceUuid() {
// 			continue
// 		}
// 		pos := ImmutablePosition{position: p.GetPosition()}
// 		nextPos := pos.AddVector(effect.PieceMoved.GetVector())
// 		p.Position = nextPos.Position()
// 		return nil
// 	}

// 	return fmt.Errorf("applyEffect_PieceMoved: piece with UUID %s not found", effect.PieceMoved.GetPieceUuid())
// }

// func applyEffect_PieceCaptured(effect *kaboomproto.Effect_PieceCaptured, state *kaboomproto.Game) error {
// 	for _, p := range state.Pieces {
// 		if p.GetUuid() != effect.PieceCaptured.GetPieceUuid() {
// 			continue
// 		}
// 		if p.GetZone() != kaboomproto.ZoneKind_BOARD_ZONE {
// 			return fmt.Errorf("applyEffect_PieceCaptured: piece with UUID %s is not on the board", effect.PieceCaptured.GetPieceUuid())
// 		}

// 		p.Zone = kaboomproto.ZoneKind_GRAVEYARD_ZONE
// 		return nil
// 	}
// 	return fmt.Errorf("applyEffect_PieceCaptured: piece with UUID %s not found", effect.PieceCaptured.GetPieceUuid())
// }

// func applyEffect_PieceBumped(effect *kaboomproto.Effect_PieceBumped, state *kaboomproto.Game) error {
// 	// Complex bumping and chain logic here
// 	return nil
// }

// func applyEffect_PiecePromoted(effect *kaboomproto.Effect_PiecePromoted, state *kaboomproto.Game) error {
// 	for _, p := range state.Pieces {
// 		if p.GetUuid() != effect.PiecePromoted.GetPieceUuid() {
// 			continue
// 		}
// 		p.Kind = effect.PiecePromoted.GetToKind()
// 		return nil
// 	}
// 	return fmt.Errorf("applyEffect_PiecePromoted: piece with UUID %s not found", effect.PiecePromoted.GetPieceUuid())
// }

// func applyEffect_PieceDeployed(effect *kaboomproto.Effect_PieceDeployed, state *kaboomproto.Game) error {
// 	for _, p := range state.Pieces {
// 		if p.GetUuid() != effect.PieceDeployed.GetPieceUuid() {
// 			continue
// 		}
// 		if p.GetZone() != kaboomproto.ZoneKind_BENCH_ZONE {
// 			return fmt.Errorf("applyEffect_PieceDeployed: piece with UUID %s is not in the bench", effect.PieceDeployed.GetPieceUuid())
// 		}
// 		p.Zone = kaboomproto.ZoneKind_BOARD_ZONE
// 		return nil
// 	}

// 	return fmt.Errorf("applyEffect_PieceDeployed: piece with UUID %s not found", effect.PieceDeployed.GetPieceUuid())
// }

// func applyEffect_PieceTransfer(effect *kaboomproto.Effect_PieceTransfer, state *kaboomproto.Game) error {
// 	for _, p := range state.Pieces {
// 		if p.GetUuid() != effect.PieceTransfer.GetPieceUuid() {
// 			continue
// 		}

// 		p.BoardUuid = effect.PieceTransfer.GetToBoardUuid()
// 		p.Zone = effect.PieceTransfer.GetToZone()
// 		p.Position = effect.PieceTransfer.GetToPosition()

// 		return nil
// 	}
// 	return nil
// }

// func applyEffect_Win(effect *kaboomproto.Effect_Win, effectBoardUUID string, state *kaboomproto.Game) error {
// 	var board *kaboomproto.Board

// 	for _, b := range state.Boards {
// 		if b.GetUuid() != effectBoardUUID {
// 			continue
// 		}
// 		board = b
// 		break
// 	}

// 	if board == nil {
// 		return fmt.Errorf("applyEffect_Win: board with UUID %s not found", effectBoardUUID)
// 	}

// 	for _, boardPlayer := range board.GetPlayers() {
// 		if boardPlayer.PlayerUuid != effect.Win.GetWinningPlayerUuid() {
// 			continue
// 		}
// 		board.WinningPlayerUuid = boardPlayer.PlayerUuid
// 		return nil
// 	}

// 	return fmt.Errorf("applyEffect_Win: winning player UUID %s not found on board %s", effect.Win.GetWinningPlayerUuid(), effectBoardUUID)
// }
