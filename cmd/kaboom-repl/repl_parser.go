package main

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
)

// ParseReplMove parses tokens like "P M D2 D3" into a kaboomstate.Move.
func ParseReplMove(input string) (kaboomstate.Move, error) {
	tokens := strings.Fields(strings.TrimSpace(input))
	if len(tokens) != 4 {
		return kaboomstate.Move{}, fmt.Errorf("expected 4 tokens (piece action from to), got %d", len(tokens))
	}

	pieceToken := strings.ToUpper(tokens[0])
	actionToken := strings.ToUpper(tokens[1])

	from, err := parseBoardSquare(tokens[2])
	if err != nil {
		return kaboomstate.Move{}, fmt.Errorf("invalid from-square: %w", err)
	}
	to, err := parseBoardSquare(tokens[3])
	if err != nil {
		return kaboomstate.Move{}, fmt.Errorf("invalid to-square: %w", err)
	}

	switch pieceToken {
	case "P":
		return buildPawnMove(actionToken, from, to)
	case "B":
		return buildBishopMove(actionToken, from, to)
	case "R":
		return buildRookMove(actionToken, from, to)
	case "N":
		return buildKnightMove(actionToken, from, to)
	case "Q":
		return buildQueenMove(actionToken, from, to)
	case "K":
		return buildKingMove(actionToken, from, to)
	default:
		return kaboomstate.Move{}, fmt.Errorf("unsupported piece token %q (supported: P, B, R, N, Q, K)", tokens[0])
	}
}

func parseBoardSquare(token string) (kaboomstate.Position, error) {
	text := strings.TrimSpace(token)
	if len(text) < 2 {
		return kaboomstate.Position{}, fmt.Errorf("square %q is too short", token)
	}

	upperText := strings.ToUpper(text)
	colChar := upperText[0]
	if colChar < 'A' || colChar > 'H' {
		return kaboomstate.Position{}, fmt.Errorf("column %q must be between A and H", string(colChar))
	}
	rank, err := strconv.Atoi(upperText[1:])
	if err != nil {
		return kaboomstate.Position{}, fmt.Errorf("invalid rank %q", upperText[1:])
	}
	if rank < 1 || rank > 8 {
		return kaboomstate.Position{}, fmt.Errorf("rank %d must be between 1 and 8", rank)
	}

	col := int32(colChar-'A') + kaboomstate.MIN_COL
	row := int32(8-rank) + kaboomstate.MIN_ROW
	pos := kaboomstate.NewPosition(row, col)
	if err := pos.Validate(); err != nil {
		return kaboomstate.Position{}, err
	}
	return pos, nil
}

func buildPawnMove(action string, from, to kaboomstate.Position) (kaboomstate.Move, error) {
	switch action {
	case "M":
		return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
			Move: &kaboomproto.KaboomMove_CPawnMove{
				CPawnMove: &kaboomproto.C_PawnMove{
					From:      from.ToProto(),
					To:        to.ToProto(),
					Promotion: kaboomproto.PieceKind_INVALID_PIECE,
				},
			},
		}), nil
	case "C":
		return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
			Move: &kaboomproto.KaboomMove_CPawnCapture{
				CPawnCapture: &kaboomproto.C_PawnCapture{
					From:      from.ToProto(),
					To:        to.ToProto(),
					Promotion: kaboomproto.PieceKind_INVALID_PIECE,
				},
			},
		}), nil
	default:
		return kaboomstate.Move{}, fmt.Errorf("unsupported pawn action %q (use M for move or C for capture)", action)
	}
}

func buildBishopMove(action string, from, to kaboomstate.Position) (kaboomstate.Move, error) {
	switch action {
	case "M":
		return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
			Move: &kaboomproto.KaboomMove_CBishopMove{
				CBishopMove: &kaboomproto.C_BishopMove{
					From: from.ToProto(),
					To:   to.ToProto(),
				},
			},
		}), nil
	case "C":
		return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
			Move: &kaboomproto.KaboomMove_CBishopCapture{
				CBishopCapture: &kaboomproto.C_BishopCapture{
					From: from.ToProto(),
					To:   to.ToProto(),
				},
			},
		}), nil
	default:
		return kaboomstate.Move{}, fmt.Errorf("unsupported bishop action %q (use M for move or C for capture)", action)
	}
}

func buildRookMove(action string, from, to kaboomstate.Position) (kaboomstate.Move, error) {
	switch action {
	case "M":
		return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
			Move: &kaboomproto.KaboomMove_CRookMove{
				CRookMove: &kaboomproto.C_RookMove{
					From: from.ToProto(),
					To:   to.ToProto(),
				},
			},
		}), nil
	case "C":
		return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
			Move: &kaboomproto.KaboomMove_CRookCapture{
				CRookCapture: &kaboomproto.C_RookCapture{
					From: from.ToProto(),
					To:   to.ToProto(),
				},
			},
		}), nil
	default:
		return kaboomstate.Move{}, fmt.Errorf("unsupported rook action %q (use M for move or C for capture)", action)
	}
}

func buildKnightMove(action string, from, to kaboomstate.Position) (kaboomstate.Move, error) {
	switch action {
	case "M":
		return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
			Move: &kaboomproto.KaboomMove_CKnightMove{
				CKnightMove: &kaboomproto.C_KnightMove{
					From: from.ToProto(),
					To:   to.ToProto(),
				},
			},
		}), nil
	case "C":
		return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
			Move: &kaboomproto.KaboomMove_CKnightCapture{
				CKnightCapture: &kaboomproto.C_KnightCapture{
					From: from.ToProto(),
					To:   to.ToProto(),
				},
			},
		}), nil
	default:
		return kaboomstate.Move{}, fmt.Errorf("unsupported knight action %q (use M for move or C for capture)", action)
	}
}

func buildQueenMove(action string, from, to kaboomstate.Position) (kaboomstate.Move, error) {
	switch action {
	case "M":
		return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
			Move: &kaboomproto.KaboomMove_CQueenMove{
				CQueenMove: &kaboomproto.C_QueenMove{
					From: from.ToProto(),
					To:   to.ToProto(),
				},
			},
		}), nil
	case "C":
		return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
			Move: &kaboomproto.KaboomMove_CQueenCapture{
				CQueenCapture: &kaboomproto.C_QueenCapture{
					From: from.ToProto(),
					To:   to.ToProto(),
				},
			},
		}), nil
	default:
		return kaboomstate.Move{}, fmt.Errorf("unsupported queen action %q (use M for move or C for capture)", action)
	}
}

func buildKingMove(action string, from, to kaboomstate.Position) (kaboomstate.Move, error) {
	switch action {
	case "M":
		return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
			Move: &kaboomproto.KaboomMove_CKingMove{
				CKingMove: &kaboomproto.C_KingMove{
					From: from.ToProto(),
					To:   to.ToProto(),
				},
			},
		}), nil
	case "C":
		return kaboomstate.MoveFromProto(&kaboomproto.KaboomMove{
			Move: &kaboomproto.KaboomMove_CKingCapture{
				CKingCapture: &kaboomproto.C_KingCapture{
					From: from.ToProto(),
					To:   to.ToProto(),
				},
			},
		}), nil
	default:
		return kaboomstate.Move{}, fmt.Errorf("unsupported king action %q (use M for move or C for capture)", action)
	}
}
