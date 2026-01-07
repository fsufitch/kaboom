import { describe, expect, it } from 'vitest';

import { IllegalMoveError } from '@kaboom/engine/base';
import { PawnPromotionResolver } from '@kaboom/engine/classic/pawn_promotion';
import { ChessColor, ChessPieceKind, Move } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkPawnPromotionMove = (fromRow: number, fromCol: number, promoteTo: ChessPieceKind): Move =>
  Move.create({
    classicMove: {
      pawn: {
        promotion: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          promoteTo,
        },
      },
    },
  });

describe('PawnPromotionResolver (classic)', () => {
  it('enumerates promotion options for pawns on the final rank', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 7, column: 0 });
    const gs = mkSnapshot({ pieces: [pawn] });

    const moves = PawnPromotionResolver.validMoves(gs, pawn.id);

    expect(moves).toHaveLength(4);
    const kinds = moves.map((move) => move.classicMove?.pawn?.promotion?.promoteTo);
    expect(kinds).toEqual(
      expect.arrayContaining([
        ChessPieceKind.QUEEN,
        ChessPieceKind.ROOK,
        ChessPieceKind.BISHOP,
        ChessPieceKind.KNIGHT,
      ]),
    );
  });

  it('resolves a legal promotion into a piecePromoted state change', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 7, column: 0 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const move = mkPawnPromotionMove(7, 0, ChessPieceKind.QUEEN);

    const effects = PawnPromotionResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(1);
    expect(effect?.stateChanges[0]?.piecePromoted?.pieceId).toBe(pawn.id);
    expect(effect?.stateChanges[0]?.piecePromoted?.newKind).toBe(ChessPieceKind.QUEEN);
  });

  it('throws IllegalMoveError for an illegal promotion move', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 6, column: 0 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const illegal = mkPawnPromotionMove(6, 0, ChessPieceKind.QUEEN);

    expect(() => PawnPromotionResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });
});
