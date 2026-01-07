import fischerSpassky from 'src/example_games/1972-07-23_fischer_spassky';
import nikolicArsovic from 'src/example_games/1989-02-00_nikolic_arsovic';
import kasparovDeepBlue from 'src/example_games/1997-05-11_kasparov_deepblue';
import { describe, expect, it } from 'vitest';

import { ChessColor, ChessPieceKind, type GameSnapshot } from '@kaboom/proto';

type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';

const files: File[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const pieceKind = (kind: ChessPieceKind, promotedKind: ChessPieceKind) =>
  promotedKind !== ChessPieceKind.KIND_UNKNOWN ? promotedKind : kind;

const snapshotBoardMap = (snapshot: GameSnapshot) => {
  const map = new Map<string, { color: ChessColor; kind: ChessPieceKind }>();
  for (const piece of snapshot.pieces) {
    const pos = piece.place?.boardPosition;
    if (!pos) {
      continue;
    }
    const file = files[pos.column];
    const rank = pos.row + 1;
    if (!file) {
      throw new Error(`Invalid board column ${pos.column}`);
    }
    const key = `${file}${rank}`;
    if (map.has(key)) {
      throw new Error(`Multiple pieces on ${key}`);
    }
    map.set(key, {
      color: piece.color,
      kind: pieceKind(piece.kind, piece.promotedKind),
    });
  }
  return map;
};

const expectFinalPosition = (
  snapshot: GameSnapshot,
  expected: Array<{ square: `${File}${number}`; color: ChessColor; kind: ChessPieceKind }>,
) => {
  const map = snapshotBoardMap(snapshot);
  expect(map.size).toBe(expected.length);
  for (const piece of expected) {
    const actual = map.get(piece.square);
    expect(actual, `missing piece at ${piece.square}`).toBeDefined();
    expect(actual?.color).toBe(piece.color);
    expect(actual?.kind).toBe(piece.kind);
  }
};

describe('example game final positions', () => {
  it('matches Fischer vs. Spassky (1972-07-23)', () => {
    expectFinalPosition(fischerSpassky, [
      { square: 'c4', color: ChessColor.WHITE, kind: ChessPieceKind.BISHOP },
      { square: 'g1', color: ChessColor.WHITE, kind: ChessPieceKind.KING },
      { square: 'g2', color: ChessColor.WHITE, kind: ChessPieceKind.PAWN },
      { square: 'b3', color: ChessColor.WHITE, kind: ChessPieceKind.PAWN },
      { square: 'a4', color: ChessColor.WHITE, kind: ChessPieceKind.PAWN },
      { square: 'h4', color: ChessColor.WHITE, kind: ChessPieceKind.PAWN },
      { square: 'e6', color: ChessColor.WHITE, kind: ChessPieceKind.PAWN },
      { square: 'f4', color: ChessColor.WHITE, kind: ChessPieceKind.QUEEN },
      { square: 'f6', color: ChessColor.WHITE, kind: ChessPieceKind.ROOK },
      { square: 'h8', color: ChessColor.BLACK, kind: ChessPieceKind.KING },
      { square: 'd4', color: ChessColor.BLACK, kind: ChessPieceKind.PAWN },
      { square: 'a5', color: ChessColor.BLACK, kind: ChessPieceKind.PAWN },
      { square: 'c5', color: ChessColor.BLACK, kind: ChessPieceKind.PAWN },
      { square: 'h6', color: ChessColor.BLACK, kind: ChessPieceKind.PAWN },
      { square: 'e8', color: ChessColor.BLACK, kind: ChessPieceKind.QUEEN },
      { square: 'c7', color: ChessColor.BLACK, kind: ChessPieceKind.ROOK },
      { square: 'e7', color: ChessColor.BLACK, kind: ChessPieceKind.ROOK },
    ]);
  });

  it('matches Kasparov vs. Deep Blue (1997-05-11)', () => {
    expectFinalPosition(kasparovDeepBlue, [
      { square: 'a1', color: ChessColor.WHITE, kind: ChessPieceKind.ROOK },
      { square: 'b2', color: ChessColor.WHITE, kind: ChessPieceKind.PAWN },
      { square: 'c4', color: ChessColor.WHITE, kind: ChessPieceKind.PAWN },
      { square: 'd3', color: ChessColor.WHITE, kind: ChessPieceKind.QUEEN },
      { square: 'd4', color: ChessColor.WHITE, kind: ChessPieceKind.PAWN },
      { square: 'f2', color: ChessColor.WHITE, kind: ChessPieceKind.PAWN },
      { square: 'f3', color: ChessColor.WHITE, kind: ChessPieceKind.KNIGHT },
      { square: 'g1', color: ChessColor.WHITE, kind: ChessPieceKind.KING },
      { square: 'g2', color: ChessColor.WHITE, kind: ChessPieceKind.PAWN },
      { square: 'g3', color: ChessColor.WHITE, kind: ChessPieceKind.BISHOP },
      { square: 'h2', color: ChessColor.WHITE, kind: ChessPieceKind.PAWN },
      { square: 'a7', color: ChessColor.BLACK, kind: ChessPieceKind.PAWN },
      { square: 'b5', color: ChessColor.BLACK, kind: ChessPieceKind.PAWN },
      { square: 'c6', color: ChessColor.BLACK, kind: ChessPieceKind.BISHOP },
      { square: 'c8', color: ChessColor.BLACK, kind: ChessPieceKind.KING },
      { square: 'd5', color: ChessColor.BLACK, kind: ChessPieceKind.KNIGHT },
      { square: 'd7', color: ChessColor.BLACK, kind: ChessPieceKind.KNIGHT },
      { square: 'e7', color: ChessColor.BLACK, kind: ChessPieceKind.BISHOP },
      { square: 'f5', color: ChessColor.BLACK, kind: ChessPieceKind.PAWN },
      { square: 'g7', color: ChessColor.BLACK, kind: ChessPieceKind.PAWN },
      { square: 'h6', color: ChessColor.BLACK, kind: ChessPieceKind.PAWN },
      { square: 'a8', color: ChessColor.BLACK, kind: ChessPieceKind.ROOK },
      { square: 'h8', color: ChessColor.BLACK, kind: ChessPieceKind.ROOK },
    ]);
  });

  it('matches Nikolic vs. Arsovic (1989-02-00)', () => {
    expectFinalPosition(nikolicArsovic, [
      { square: 'd3', color: ChessColor.WHITE, kind: ChessPieceKind.BISHOP },
      { square: 'd4', color: ChessColor.WHITE, kind: ChessPieceKind.KING },
      { square: 'f2', color: ChessColor.WHITE, kind: ChessPieceKind.ROOK },
      { square: 'd1', color: ChessColor.BLACK, kind: ChessPieceKind.KING },
      { square: 'g7', color: ChessColor.BLACK, kind: ChessPieceKind.ROOK },
    ]);
  });
});
