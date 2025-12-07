package kaboom

import (
	"errors"
	"fmt"

	"github.com/fsufitch/kaboom/kaboomstate"
)

var ErrNotYourTurn = errors.New("not your turn")
var ErrInvalidMove = errors.New("invalid move")

type VariantAdjudicator struct {
	ID          string
	Description string

	MoveToIntentRules   []MoveToIntentRule
	IntentToEffectRules []IntentToEffectRule
	GameValidatorRules  []GameValidatorRule
}

func (va VariantAdjudicator) MoveToIntent(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error) {
	var resultIntent *kaboomstate.Intent

	for _, rule := range va.MoveToIntentRules {
		intent, err := rule.Convert(game, move)
		if err != nil {
			// There was a general error converting the move to an intent; this should not happen
			return nil, fmt.Errorf("unexpected error converting move to intent using rule %s: %w", rule.ID, err)
		}

		if intent == nil {
			// This rule does not apply to the given move; try the next one
			continue
		}

		if resultIntent != nil {
			return nil, fmt.Errorf("%w: ambiguous move (multiple rules produced an intent)", ErrInvalidMove)
		}
		resultIntent = intent
	}

	if resultIntent == nil {
		return nil, fmt.Errorf("%w: no valid intent produced", ErrInvalidMove)
	}

	return resultIntent, nil
}

func (va VariantAdjudicator) IntentToEffects(game kaboomstate.Game, intent kaboomstate.Intent) ([]*kaboomstate.Effect, error) {
	var resultEffects []*kaboomstate.Effect

	for _, rule := range va.IntentToEffectRules {
		effects, err := rule.Convert(game, intent)
		if err != nil {
			// There was a general error converting the intent to effects; this should not happen
			return nil, fmt.Errorf("unexpected error converting intent to effects using rule %s: %w", rule.ID, err)
		}

		if len(effects) == 0 {
			// This rule does not apply to the given intent; try the next one
			// If the intent is actually supposed to have no effects,
			// the list should contain at least one kaboomstate.EffectNothingHappens.
			continue
		}

		if len(resultEffects) != 0 {
			return nil, fmt.Errorf("%w: ambiguous intent (multiple rules produced effects)", ErrInvalidMove)
		}

		resultEffects = append(resultEffects, effects...)
	}

	if len(resultEffects) == 0 {
		return nil, fmt.Errorf("%w: no valid effects produced", ErrInvalidMove)
	}

	return resultEffects, nil
}

func (va VariantAdjudicator) ValidateGame(game kaboomstate.Game) error {
	for _, rule := range va.GameValidatorRules {
		if err := rule.Validate(game); err != nil {
			return fmt.Errorf("invalid game state: %w", err)
		}
	}
	return nil
}

// MoveToIntentRule defines how to convert a Move into an Intent for a specific rules variant.
type MoveToIntentRule struct {
	ID          string
	Description string

	// Convert attempts to convert the given Move into an Intent.
	// If the rule does not apply to the given Move (the move is either irrelevant
	//     or invalid according to this rule), it should return (nil, nil).
	// If the rule applies and the Move is valid, it should return (Intent, nil).
	// Only return an error if a serious problem occurred during conversion.
	Convert func(game kaboomstate.Game, move kaboomstate.Move) (*kaboomstate.Intent, error)
}

// IntentToEffectRule defines how to convert an Intent into Effects for a specific rules variant.
type IntentToEffectRule struct {
	ID          string
	Description string

	// Convert attempts to convert the given Intent into a list of Effects.
	// If the rule does not apply to the given Intent (the intent is either irrelevant
	//     or invalid according to this rule), it should return (nil, nil).
	// If the rule applies and the Intent is valid, it should return (Effects, nil).
	//     If the Intent is valid but has no effects, it should return a list containing
	//     at least one kaboomstate.EffectNothingHappens.
	// Only return an error if a serious problem occurred during conversion.
	Convert func(game kaboomstate.Game, intent kaboomstate.Intent) ([]*kaboomstate.Effect, error)
}

// GameValidatorRule defines a validation rule for a specific rules variant.
type GameValidatorRule struct {
	ID          string
	Description string

	// Validate checks whether the given game state is valid according to this rule.
	// It should return nil if the game state is valid.
	// If the game state is invalid, it should return an error describing the problem.
	// An invalid game state is one that should not occur during normal gameplay;
	// it is a "game-ending" event.
	Validate func(game kaboomstate.Game) error
}
