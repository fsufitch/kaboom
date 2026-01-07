import { describe, expect, it } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { PawnCaptureResolver } from '@kaboom/engine/classic/pawn_capture';
import { ChessColor, ChessPieceKind, Move } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkPawnCaptureMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      pawn: {
        capture: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('PawnCaptureResolver (classic)', () => {
  it('enumerates only diagonal captures against opponent pieces', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 3, column: 3 });
    const enemy = mkPiece({
      id: 'bp',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 4,
      column: 2,
    });
    const friendly = mkPiece({
      id: 'wp2',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.WHITE,
      row: 4,
      column: 4,
    });
    const gs = mkSnapshot({ pieces: [pawn, enemy, friendly] });

    const moves = PawnCaptureResolver.validMoves(gs, pawn.id);

    expect(moves).toHaveLength(1);
    const [move] = moves;
    if (!move) {
      throw new Error('Expected pawn capture move to be present');
    }
    expect(movesEqual(move, mkPawnCaptureMove(3, 3, 4, 2))).toBe(true);
  });

  it('resolves a legal capture into pieceMoved + pieceCaptured state changes', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 3, column: 3 });
    const enemy = mkPiece({
      id: 'bp',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 4,
      column: 2,
    });
    const gs = mkSnapshot({ pieces: [pawn, enemy] });
    const move = mkPawnCaptureMove(3, 3, 4, 2);

    const effects = PawnCaptureResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(2);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(pawn.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 4, column: 2 });
    expect(effect?.stateChanges[1]?.pieceCaptured?.pieceId).toBe(enemy.id);
  });

  it('throws IllegalMoveError for an illegal capture move', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const illegal = mkPawnCaptureMove(3, 3, 4, 2);

    expect(() => PawnCaptureResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });
});
