package kaboom

import (
	"testing"

	"github.com/fsufitch/kaboom/kaboomstate"
	kaboomproto "github.com/fsufitch/kaboom/proto/go"
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
		{"PawnMove", buildPawnMove, "M", kaboomstate.MoveKind_PawnMove, 1, 3, 2, 3},
		{"PawnCapture", buildPawnMove, "C", kaboomstate.MoveKind_PawnCapture, 1, 3, 2, 4},
		{"BishopMove", buildBishopMove, "M", kaboomstate.MoveKind_BishopMove, 0, 2, 2, 0},
		{"BishopCapture", buildBishopMove, "C", kaboomstate.MoveKind_BishopCapture, 7, 2, 4, 5},
		{"RookMove", buildRookMove, "M", kaboomstate.MoveKind_RookMove, 0, 0, 3, 0},
		{"RookCapture", buildRookMove, "C", kaboomstate.MoveKind_RookCapture, 7, 7, 7, 0},
		{"KnightMove", buildKnightMove, "M", kaboomstate.MoveKind_KnightMove, 0, 1, 2, 2},
		{"KnightCapture", buildKnightMove, "C", kaboomstate.MoveKind_KnightCapture, 7, 6, 5, 5},
		{"QueenMove", buildQueenMove, "M", kaboomstate.MoveKind_QueenMove, 0, 3, 4, 7},
		{"QueenCapture", buildQueenMove, "C", kaboomstate.MoveKind_QueenCapture, 7, 3, 4, 0},
		{"KingMove", buildKingMove, "M", kaboomstate.MoveKind_KingMove, 0, 4, 1, 4},
		{"KingCapture", buildKingMove, "C", kaboomstate.MoveKind_KingCapture, 7, 4, 6, 3},
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
		{"Pawn", buildPawnMove, 1, 0, 2, 0},
		{"Bishop", buildBishopMove, 0, 2, 2, 0},
		{"Rook", buildRookMove, 0, 0, 1, 0},
		{"Knight", buildKnightMove, 0, 1, 2, 2},
		{"Queen", buildQueenMove, 0, 3, 2, 3},
		{"King", buildKingMove, 0, 4, 1, 4},
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

func TestBuildKingCastleMove(t *testing.T) {
	pos := mustPos(t, 0, 4)
	move := buildKingCastleMove(pos, kaboomproto.C_KingCastle_CASTLE_SIDE_SHORT)
	if move.Kind() != kaboomstate.MoveKind_KingCastle {
		t.Fatalf("expected castle move kind, got %s", move.Kind())
	}
	castle := move.AsKingCastle()
	if castle == nil {
		t.Fatalf("expected castle data")
	}
	if castle.GetSide() != kaboomproto.C_KingCastle_CASTLE_SIDE_SHORT {
		t.Fatalf("expected short castle side")
	}
	if castle.GetPosition().GetRow() != 0 || castle.GetPosition().GetCol() != 4 {
		t.Fatalf("unexpected castle origin")
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

func TestParseReplMove_Castle(t *testing.T) {
	move, err := ParseReplMove("K O e1 s")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if move.Kind() != kaboomstate.MoveKind_KingCastle {
		t.Fatalf("expected castle move, got %s", move.Kind())
	}
	castle := move.AsKingCastle()
	if castle == nil {
		t.Fatalf("expected castle payload")
	}
	if castle.GetSide() != kaboomproto.C_KingCastle_CASTLE_SIDE_SHORT {
		t.Fatalf("expected short castle")
	}
	if castle.GetPosition().GetRow() != 0 || castle.GetPosition().GetCol() != 4 {
		t.Fatalf("unexpected castle position")
	}

	move, err = ParseReplMove("K O e8 L")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	castle = move.AsKingCastle()
	if castle.GetSide() != kaboomproto.C_KingCastle_CASTLE_SIDE_LONG {
		t.Fatalf("expected long castle")
	}
}

func TestParseReplMove_Errors(t *testing.T) {
	inputs := []string{
		"P M A2",
		"Z M A1 A2",
		"P M I2 I3",
		"K O E1 X",
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
