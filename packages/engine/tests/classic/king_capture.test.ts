import { describe, expect, it } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { KingCaptureResolver } from '@kaboom/engine/classic/king_capture';
import { ChessColor, ChessPieceKind, Move } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkKingCapture = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      king: {
        capture: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('KingCaptureResolver (classic)', () => {
  it('enumerates adjacent enemy pieces only', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 3, column: 3 });
    const enemyA = mkPiece({
      id: 'enemy-a',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 4,
      column: 3,
    });
    const enemyB = mkPiece({
      id: 'enemy-b',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.BLACK,
      row: 2,
      column: 2,
    });
    const friendly = mkPiece({
      id: 'friendly',
      kind: ChessPieceKind.ROOK,
      color: ChessColor.WHITE,
      row: 4,
      column: 4,
    });

    const gs = mkSnapshot({ pieces: [king, enemyA, enemyB, friendly] });

    const moves = KingCaptureResolver.validMoves(gs, king.id);

    const expected = [mkKingCapture(3, 3, 4, 3), mkKingCapture(3, 3, 2, 2)];

    expect(moves).toHaveLength(2);
    for (const e of expected) {
      expect(moves.some((m) => movesEqual(m, e))).toBe(true);
    }

    expect(moves.some((m) => movesEqual(m, mkKingCapture(3, 3, 4, 4)))).toBe(false);
  });

  it('resolves a legal king capture into pieceMoved + pieceCaptured', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 3, column: 3 });
    const target = mkPiece({
      id: 'target',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 4,
      column: 3,
    });

    const gs = mkSnapshot({ pieces: [king, target] });
    const move = mkKingCapture(3, 3, 4, 3);

    const effects = KingCaptureResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(2);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(king.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 4, column: 3 });
    expect(effect?.stateChanges[1]?.pieceCaptured?.pieceId).toBe(target.id);
  });

  it('throws IllegalMoveError for an illegal king capture', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [king] });
    const illegal = mkKingCapture(3, 3, 4, 3);

    expect(() => KingCaptureResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });
});
