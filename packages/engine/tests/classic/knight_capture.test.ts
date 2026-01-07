import { describe, expect, it } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { KnightCaptureResolver } from '@kaboom/engine/classic/knight_capture';
import { ChessColor, ChessPieceKind, Move } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkKnightCapture = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      knight: {
        capture: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('KnightCaptureResolver (classic)', () => {
  it('enumerates L-shaped captures onto enemy pieces', () => {
    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 3, column: 3 });
    const enemyA = mkPiece({
      id: 'enemy-a',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 5,
      column: 4,
    });
    const enemyB = mkPiece({
      id: 'enemy-b',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.BLACK,
      row: 2,
      column: 1,
    });
    const friendly = mkPiece({
      id: 'friendly',
      kind: ChessPieceKind.ROOK,
      color: ChessColor.WHITE,
      row: 5,
      column: 2,
    });

    const gs = mkSnapshot({ pieces: [knight, enemyA, enemyB, friendly] });

    const moves = KnightCaptureResolver.validMoves(gs, knight.id);

    const expected = [mkKnightCapture(3, 3, 5, 4), mkKnightCapture(3, 3, 2, 1)];

    expect(moves).toHaveLength(2);
    for (const e of expected) {
      expect(moves.some((m) => movesEqual(m, e))).toBe(true);
    }

    expect(moves.some((m) => movesEqual(m, mkKnightCapture(3, 3, 5, 2)))).toBe(false);
  });

  it('resolves a legal knight capture into pieceMoved + pieceCaptured', () => {
    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 3, column: 3 });
    const target = mkPiece({
      id: 'enemy',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 5,
      column: 4,
    });

    const gs = mkSnapshot({ pieces: [knight, target] });
    const move = mkKnightCapture(3, 3, 5, 4);

    const effects = KnightCaptureResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(2);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(knight.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 5, column: 4 });
    expect(effect?.stateChanges[1]?.pieceCaptured?.pieceId).toBe(target.id);
  });

  it('throws IllegalMoveError for an illegal knight capture', () => {
    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [knight] });
    const illegal = mkKnightCapture(3, 3, 1, 2);

    expect(() => KnightCaptureResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });
});
