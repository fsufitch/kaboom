import { describe, expect, it } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { KnightMoveResolver } from '@kaboom/engine/classic/knight_move';
import { ChessColor, ChessPieceKind, Move } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkKnightMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      knight: {
        move: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('KnightMoveResolver (classic)', () => {
  it('enumerates L-shaped moves to empty squares only', () => {
    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 3, column: 3 });
    const friendly = mkPiece({
      id: 'block',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      row: 5,
      column: 4,
    });
    const enemy = mkPiece({
      id: 'enemy',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.BLACK,
      row: 2,
      column: 1,
    });

    const gs = mkSnapshot({ pieces: [knight, friendly, enemy] });

    const moves = KnightMoveResolver.validMoves(gs, knight.id);

    const expected = [
      mkKnightMove(3, 3, 5, 2),
      mkKnightMove(3, 3, 1, 4),
      mkKnightMove(3, 3, 1, 2),
      mkKnightMove(3, 3, 4, 5),
      mkKnightMove(3, 3, 4, 1),
      mkKnightMove(3, 3, 2, 5),
    ];

    expect(moves).toHaveLength(6);
    for (const e of expected) {
      expect(moves.some((m) => movesEqual(m, e))).toBe(true);
    }

    expect(moves.some((m) => movesEqual(m, mkKnightMove(3, 3, 5, 4)))).toBe(false);
    expect(moves.some((m) => movesEqual(m, mkKnightMove(3, 3, 2, 1)))).toBe(false);
  });

  it('resolves a legal knight move into pieceMoved', () => {
    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [knight] });
    const move = mkKnightMove(3, 3, 5, 2);

    const effects = KnightMoveResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(1);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(knight.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 5, column: 2 });
  });

  it('throws IllegalMoveError for an illegal knight move', () => {
    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [knight] });
    const illegal = mkKnightMove(3, 3, 3, 4);

    expect(() => KnightMoveResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });
});
