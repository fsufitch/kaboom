package kaboomstate

import "fmt"

// ApplyEffects sequentially applies the provided effects to the given game and returns the updated state.
func ApplyEffects(game Game, effects []*Effect) (Game, error) {
	current := game
	for _, effect := range effects {
		var (
			next *Game
			err  error
		)

		switch effect.Kind() {
		case EffectKindNothingHappens:
			next, err = effect.NothingHappens().Apply(current)
		case EffectKindPieceCreated:
			next, err = effect.PieceCreated().Apply(current)
		case EffectKindPieceDeleted:
			next, err = effect.PieceDeleted().Apply(current)
		case EffectKindPieceMoved:
			next, err = effect.PieceMoved().Apply(current)
		case EffectKindPieceCaptured:
			next, err = effect.PieceCaptured().Apply(current)
		case EffectKindPieceBumped:
			next, err = effect.PieceBumped().Apply(current)
		case EffectKindPiecePromoted:
			next, err = effect.PiecePromoted().Apply(current)
		case EffectKindPieceDeployed:
			next, err = effect.PieceDeployed().Apply(current)
		case EffectKindPieceTransfer:
			next, err = effect.PieceTransfer().Apply(current)
		case EffectKindWin:
			next, err = effect.Win().Apply(current)
		default:
			return game, fmt.Errorf("unsupported effect kind %s", effect.Kind())
		}

		if err != nil {
			return game, err
		}

		current = *next
	}

	return current, nil
}
