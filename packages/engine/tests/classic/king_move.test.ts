import { describe, expect, it } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { KingMoveResolver } from '@kaboom/engine/classic/king_move';
import { ChessColor, ChessPieceKind, Move } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkKingMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      king: {
        move: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('KingMoveResolver (classic)', () => {
  it('enumerates adjacent empty squares only', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 3, column: 3 });
    const enemy = mkPiece({
      id: 'enemy',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 4,
      column: 3,
    });
    const friendly = mkPiece({
      id: 'friendly',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.WHITE,
      row: 4,
      column: 4,
    });

    const gs = mkSnapshot({ pieces: [king, enemy, friendly] });

    const moves = KingMoveResolver.validMoves(gs, king.id);

    const expected = [
      mkKingMove(3, 3, 4, 2),
      mkKingMove(3, 3, 3, 4),
      mkKingMove(3, 3, 3, 2),
      mkKingMove(3, 3, 2, 4),
      mkKingMove(3, 3, 2, 3),
      mkKingMove(3, 3, 2, 2),
    ];

    expect(moves).toHaveLength(6);
    for (const e of expected) {
      expect(moves.some((m) => movesEqual(m, e))).toBe(true);
    }

    expect(moves.some((m) => movesEqual(m, mkKingMove(3, 3, 4, 3)))).toBe(false);
    expect(moves.some((m) => movesEqual(m, mkKingMove(3, 3, 4, 4)))).toBe(false);
  });

  it('resolves a legal king move into pieceMoved', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [king] });
    const move = mkKingMove(3, 3, 4, 2);

    const effects = KingMoveResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(1);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(king.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 4, column: 2 });
  });

  it('throws IllegalMoveError for an illegal king move', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [king] });
    const illegal = mkKingMove(3, 3, 5, 3);

    expect(() => KingMoveResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });
});
