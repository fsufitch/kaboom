package main

import (
	"fmt"
	"os"

	"github.com/fsufitch/kaboom"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
	"google.golang.org/protobuf/encoding/protojson"
)

func main() {
	if len(os.Args) != 2 {
		fmt.Fprintf(os.Stderr, "usage: %s <chessboard json>\n", os.Args[0])
		os.Exit(1)
	}
	path := os.Args[1]

	payload, err := os.ReadFile(path)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to read %s: %v\n", path, err)
		os.Exit(1)
	}

	var chessBoard kaboomproto.ChessBoard
	if err := (protojson.UnmarshalOptions{DiscardUnknown: true}).Unmarshal(payload, &chessBoard); err != nil {
		fmt.Fprintf(os.Stderr, "failed to parse chess board JSON: %v\n", err)
		os.Exit(1)
	}

	gameProto := &kaboomproto.GameState{
		Boards: []*kaboomproto.BoardState{
			{
				WhitePlayerUuid: "player-white",
				BlackPlayerUuid: "player-black",
				ChessBoard:      &chessBoard,
			},
		},
		Players: []*kaboomproto.Player{
			{Uuid: "player-white", Name: "Alice"},
			{Uuid: "player-black", Name: "Bob"},
		},
	}

	game := kaboom.NewTwoPlayerGame(gameProto)

	fmt.Println("Loaded starting board:")
	fmt.Println("-----------------------------------------------------")
	jsonData, err := (protojson.MarshalOptions{
		Multiline:         true,
		Indent:            "  ",
		EmitUnpopulated:   true,
		EmitDefaultValues: true,
	}).Marshal(gameProto)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to marshal game: %v\n", err)
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
