package main

import (
	"fmt"
	"os"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/examples"
	"google.golang.org/protobuf/encoding/protojson"
)

func main() {

	gameProto := examples.GameInProgressProto()

	game := kaboom.NewTwoPlayerGame(gameProto)

	fmt.Println("Game loaded successfully. Here is the game state in JSON format:")
	fmt.Println("-----------------------------------------------------")
	jsonData, err := protojson.MarshalOptions{
		Multiline:         true,
		Indent:            "  ",
		EmitUnpopulated:   true,
		EmitDefaultValues: true,
	}.Marshal(gameProto)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error marshaling game state to JSON: %v\n", err)
		os.Exit(1)
	}
	fmt.Println(string(jsonData))
	fmt.Println("-----------------------------------------------------")

	fmt.Println("Validating game state...")
	if err := game.Validate(); err != nil {
		fmt.Fprintf(os.Stderr, "Game validation error: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Game is valid!")
	fmt.Println("------------------------------------------------------")

	fmt.Println("Serializing current chess board state...")
	boardData, err := kaboom.SerializeChessBoard(game.Board().ChessBoard())

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error serializing chess board: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Serialized chess board data:")
	fmt.Println(string(boardData))
}
