package main

import (
	"fmt"
	"os"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/examples"
	"google.golang.org/protobuf/encoding/protojson"
)

func main() {
	game := examples.GameInProgress()

	if err := game.Validate(); err != nil {
		fmt.Fprintf(os.Stderr, "game validation error: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Game loaded successfully. Here is the game state in JSON format:")
	fmt.Println("-----------------------------------------------------")
	jsonData, err := protojson.MarshalOptions{
		Multiline:         true,
		Indent:            "  ",
		EmitUnpopulated:   true,
		EmitDefaultValues: true,
	}.Marshal(game.ToProto())
	if err != nil {
		fmt.Fprintf(os.Stderr, "error marshaling game state to JSON: %v\n", err)
		os.Exit(1)
	}
	fmt.Println(string(jsonData))
	fmt.Println("-----------------------------------------------------")

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
