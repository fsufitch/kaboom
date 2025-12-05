package main

import (
	"fmt"
	"os"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/classic"
	"github.com/fsufitch/kaboom/kaboomstate"
	"google.golang.org/protobuf/encoding/protojson"
)

func main() {
	if len(os.Args) != 3 {
		fmt.Fprintf(os.Stderr, "usage: %s <white name> <black name>\n", os.Args[0])
		os.Exit(1)
	}

	whiteName := os.Args[1]
	blackName := os.Args[2]

	game := classic.NewClassicChessGame(whiteName, blackName)

	fmt.Println("Loaded classic starting position:")
	printGame(game)

	fmt.Println("Validating game state...")
	if err := game.Validate(); err != nil {
		fmt.Fprintf(os.Stderr, "game validation error: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("Game is valid!")
	fmt.Println("------------------------------------------------------")

	fmt.Println("Serializing current chess board state...")
	board := game.Boards()[0]
	boardData, err := kaboom.SerializeChessBoard(board, game.Pieces())
	if err != nil {
		fmt.Fprintf(os.Stderr, "error serializing chess board: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("Serialized chess board data:")
	fmt.Println(string(boardData))
}

func printGame(game kaboomstate.Game) {
	jsonData, err := protojson.MarshalOptions{
		Multiline:         true,
		Indent:            "  ",
		EmitUnpopulated:   true,
		EmitDefaultValues: true,
	}.Marshal(game.ToProto())
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to marshal game: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("-----------------------------------------------------")
	fmt.Println(string(jsonData))
	fmt.Println("-----------------------------------------------------")
}
