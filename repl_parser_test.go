package kaboom

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
)

func TestBuildPieceMoves(t *testing.T) {
	type buildFunc func(string, kaboomstate.Position, kaboomstate.Position) (kaboomstate.Move, error)
	tests := []struct {
		name         string
		fn           buildFunc
		action       string
		expectedKind kaboomstate.MoveKind
		fromRow      int32
		fromCol      int32
		toRow        int32
		toCol        int32
	}{
		{"PawnMove", buildPawnMove, "M", kaboomstate.MoveKind_PawnMove, 6, 3, 5, 3},
		{"PawnCapture", buildPawnMove, "C", kaboomstate.MoveKind_PawnCapture, 6, 3, 5, 4},
		{"BishopMove", buildBishopMove, "M", kaboomstate.MoveKind_BishopMove, 7, 2, 5, 0},
		{"BishopCapture", buildBishopMove, "C", kaboomstate.MoveKind_BishopCapture, 0, 2, 3, 5},
		{"RookMove", buildRookMove, "M", kaboomstate.MoveKind_RookMove, 7, 0, 4, 0},
		{"RookCapture", buildRookMove, "C", kaboomstate.MoveKind_RookCapture, 0, 7, 0, 0},
		{"KnightMove", buildKnightMove, "M", kaboomstate.MoveKind_KnightMove, 7, 1, 5, 2},
		{"KnightCapture", buildKnightMove, "C", kaboomstate.MoveKind_KnightCapture, 0, 6, 2, 5},
		{"QueenMove", buildQueenMove, "M", kaboomstate.MoveKind_QueenMove, 7, 3, 3, 7},
		{"QueenCapture", buildQueenMove, "C", kaboomstate.MoveKind_QueenCapture, 0, 3, 3, 0},
		{"KingMove", buildKingMove, "M", kaboomstate.MoveKind_KingMove, 7, 4, 6, 4},
		{"KingCapture", buildKingMove, "C", kaboomstate.MoveKind_KingCapture, 0, 4, 1, 3},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			from := mustPos(t, tt.fromRow, tt.fromCol)
			to := mustPos(t, tt.toRow, tt.toCol)

			move, err := tt.fn(tt.action, from, to)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if move.Kind() != tt.expectedKind {
				t.Fatalf("expected kind %s, got %s", tt.expectedKind, move.Kind())
			}

			movement, err := move.PieceMovement()
			if err != nil {
				t.Fatalf("movement invalid: %v", err)
			}
			if !movement.From.Equals(from) || !movement.To.Equals(to) {
				t.Fatalf("movement mismatch: got %+v", movement)
			}
		})
	}
}

func TestBuildPieceMovesInvalidAction(t *testing.T) {
	type buildFunc func(string, kaboomstate.Position, kaboomstate.Position) (kaboomstate.Move, error)
	tests := []struct {
		name    string
		fn      buildFunc
		fromRow int32
		fromCol int32
		toRow   int32
		toCol   int32
	}{
		{"Pawn", buildPawnMove, 6, 0, 5, 0},
		{"Bishop", buildBishopMove, 7, 2, 5, 0},
		{"Rook", buildRookMove, 7, 0, 6, 0},
		{"Knight", buildKnightMove, 7, 1, 5, 2},
		{"Queen", buildQueenMove, 7, 3, 5, 3},
		{"King", buildKingMove, 7, 4, 6, 4},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			from := mustPos(t, tt.fromRow, tt.fromCol)
			to := mustPos(t, tt.toRow, tt.toCol)
			if _, err := tt.fn("?", from, to); err == nil {
				t.Fatalf("expected error for invalid action")
			}
		})
	}
}

func TestParseReplMove_Success(t *testing.T) {
	tests := []struct {
		name         string
		input        string
		expectedKind kaboomstate.MoveKind
		fromSquare   string
		toSquare     string
	}{
		{"PawnMoveLowercase", "p m a2 a3", kaboomstate.MoveKind_PawnMove, "A2", "A3"},
		{"KnightCaptureMixedCase", "N c g1 e2", kaboomstate.MoveKind_KnightCapture, "G1", "E2"},
		{"QueenMoveExtraSpaces", "  Q   M d1 h5  ", kaboomstate.MoveKind_QueenMove, "D1", "H5"},
		{"KingCapture", "K C e1 f2", kaboomstate.MoveKind_KingCapture, "E1", "F2"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			move, err := ParseReplMove(tt.input)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if move.Kind() != tt.expectedKind {
				t.Fatalf("expected kind %s, got %s", tt.expectedKind, move.Kind())
			}

			movement, err := move.PieceMovement()
			if err != nil {
				t.Fatalf("invalid movement: %v", err)
			}

			from := mustSquare(t, tt.fromSquare)
			to := mustSquare(t, tt.toSquare)
			if !movement.From.Equals(from) || !movement.To.Equals(to) {
				t.Fatalf("movement mismatch: got %+v", movement)
			}
		})
	}
}

func TestParseReplMove_Errors(t *testing.T) {
	inputs := []string{
		"P M A2",
		"Z M A1 A2",
		"P M I2 I3",
	}
	for _, input := range inputs {
		t.Run(input, func(t *testing.T) {
			if _, err := ParseReplMove(input); err == nil {
				t.Fatalf("expected error for %q", input)
			}
		})
	}
}

func mustPos(t *testing.T, row, col int32) kaboomstate.Position {
	t.Helper()
	pos := kaboomstate.NewPosition(row, col)
	if err := pos.Validate(); err != nil {
		t.Fatalf("invalid test position row=%d col=%d: %v", row, col, err)
	}
	return pos
}

func mustSquare(t *testing.T, token string) kaboomstate.Position {
	t.Helper()
	pos, err := parseBoardSquare(token)
	if err != nil {
		t.Fatalf("invalid square %q: %v", token, err)
	}
	return pos
}
