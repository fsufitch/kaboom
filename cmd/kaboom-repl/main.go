package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/classic"
	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

func main() {
	game := classic.NewClassicChessGame("White", "Black")
	if err := game.Validate(); err != nil {
		fmt.Fprintf(os.Stderr, "failed to build starting game: %v\n", err)
		os.Exit(1)
	}

	adjudicator := classic.ClassicChessVariantAdjudicator

	fmt.Println("Kaboom Classic REPL")
	printHelp()

	scanner := bufio.NewScanner(os.Stdin)
	for {
		fmt.Print("> ")
		if !scanner.Scan() {
			fmt.Println()
			break
		}
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}

		if shouldExit(line) {
			fmt.Println("Exiting.")
			break
		}

		if strings.EqualFold(line, "help") {
			printHelp()
			continue
		}

		if strings.EqualFold(line, "board") {
			printBoard(game)
			continue
		}

		move, err := ParseReplMove(line)
		if err != nil {
			fmt.Printf("Parse error: %v\n", err)
			continue
		}

		intent, err := adjudicator.MoveToIntent(game, move)
		if err != nil {
			fmt.Printf("Move->Intent error: %v\n", err)
			continue
		}

		effects, err := adjudicator.IntentToEffects(game, *intent)
		if err != nil {
			fmt.Printf("Intent->Effect error: %v\n", err)
			continue
		}

		fmt.Println("Effects that would occur:")
		for _, effect := range effects {
			fmt.Printf(" - %s: %s\n", effect.Kind(), effect.Why())
		}

		nextGame, err := applyEffects(game, effects)
		if err != nil {
			fmt.Printf("Failed to apply effects: %v\n", err)
			continue
		}
		game = nextGame

		gameWithTurn, err := appendTurn(game, *intent, effects)
		if err != nil {
			fmt.Printf("Failed to record turn: %v\n", err)
			continue
		}
		game = gameWithTurn
	}

	if err := scanner.Err(); err != nil {
		fmt.Fprintf(os.Stderr, "error reading input: %v\n", err)
		os.Exit(1)
	}
}

func printHelp() {
	fmt.Println("Enter moves like `P M D2 D3`, `N M B1 C3`, or `Q C D1 H5` (piece action from to).")
	fmt.Println("Pieces: P (pawn), B (bishop), R (rook), N (knight), Q (queen). Actions: M=move, C=capture. Pawns detect single vs. double based on the destination square.")
	fmt.Println("Type 'board' to show the current board, 'help' for this message, and 'exit' or 'quit' to stop.")
}

func shouldExit(input string) bool {
	return strings.EqualFold(input, "exit") || strings.EqualFold(input, "quit")
}

func printBoard(game kaboomstate.Game) {
	boards := game.Boards()
	if len(boards) == 0 {
		fmt.Println("No boards available.")
		return
	}
	board := boards[0]

	data, err := kaboom.SerializeChessBoard(board, game.Pieces())
	if err != nil {
		fmt.Printf("Failed to render board: %v\n", err)
		return
	}
	fmt.Println(string(data))
}

func applyEffects(game kaboomstate.Game, effects []*kaboomstate.Effect) (kaboomstate.Game, error) {
	current := game
	for _, effect := range effects {
		var (
			next *kaboomstate.Game
			err  error
		)

		switch effect.Kind() {
		case kaboomstate.EffectKindNothingHappens:
			next, err = effect.NothingHappens().Apply(current)
		case kaboomstate.EffectKindPieceCreated:
			next, err = effect.PieceCreated().Apply(current)
		case kaboomstate.EffectKindPieceDeleted:
			next, err = effect.PieceDeleted().Apply(current)
		case kaboomstate.EffectKindPieceMoved:
			next, err = effect.PieceMoved().Apply(current)
		case kaboomstate.EffectKindPieceCaptured:
			next, err = effect.PieceCaptured().Apply(current)
		case kaboomstate.EffectKindPieceBumped:
			next, err = effect.PieceBumped().Apply(current)
		case kaboomstate.EffectKindPiecePromoted:
			next, err = effect.PiecePromoted().Apply(current)
		case kaboomstate.EffectKindPieceDeployed:
			next, err = effect.PieceDeployed().Apply(current)
		case kaboomstate.EffectKindPieceTransfer:
			next, err = effect.PieceTransfer().Apply(current)
		case kaboomstate.EffectKindWin:
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

func appendTurn(game kaboomstate.Game, intent kaboomstate.Intent, effects []*kaboomstate.Effect) (kaboomstate.Game, error) {
	intentProto := intent.Clone().ToProto()
	turnProto := &kaboomproto.Turn{
		Uuid:       kaboom.DefaultUUIDSource.NewUUID().String(),
		PlayerUuid: intent.ActingPlayerUUID(),
		Intents:    []*kaboomproto.Intent{intentProto},
		Effects:    make([]*kaboomproto.Effect, 0, len(effects)),
	}

	for _, effect := range effects {
		turnProto.Effects = append(turnProto.Effects, effect.Clone().ToProto())
	}

	gameProto := game.ToProto()
	gameProto.Turns = append(gameProto.Turns, turnProto)

	next := kaboomstate.GameFromProto(gameProto)
	if err := next.Validate(); err != nil {
		return game, fmt.Errorf("invalid game after recording turn: %w", err)
	}
	return next, nil
}
