import { describe, expect, it } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { BishopMoveResolver } from '@kaboom/engine/classic/bishop_move';
import { ChessColor, ChessPieceKind, Move } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkBishopMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      bishop: {
        move: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('BishopMoveResolver (classic)', () => {
  it('enumerates diagonal moves until blocked', () => {
    const bishop = mkPiece({ id: 'wb', kind: ChessPieceKind.BISHOP, row: 3, column: 3 });
    const neBlock = mkPiece({
      id: 'block-ne',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      row: 5,
      column: 5,
    });
    const nwBlock = mkPiece({
      id: 'block-nw',
      kind: ChessPieceKind.KNIGHT,
      color: ChessColor.BLACK,
      row: 4,
      column: 2,
    });
    const swBlock = mkPiece({
      id: 'block-sw',
      kind: ChessPieceKind.ROOK,
      color: ChessColor.WHITE,
      row: 1,
      column: 1,
    });

    const gs = mkSnapshot({ pieces: [bishop, neBlock, nwBlock, swBlock] });

    const moves = BishopMoveResolver.validMoves(gs, bishop.id);

    const expected = [
      mkBishopMove(3, 3, 4, 4),
      mkBishopMove(3, 3, 2, 4),
      mkBishopMove(3, 3, 1, 5),
      mkBishopMove(3, 3, 0, 6),
      mkBishopMove(3, 3, 2, 2),
    ];

    expect(moves).toHaveLength(5);
    for (const e of expected) {
      expect(moves.some((m) => movesEqual(m, e))).toBe(true);
    }

    expect(moves.some((m) => movesEqual(m, mkBishopMove(3, 3, 5, 5)))).toBe(false);
    expect(moves.some((m) => movesEqual(m, mkBishopMove(3, 3, 4, 2)))).toBe(false);
    expect(moves.some((m) => movesEqual(m, mkBishopMove(3, 3, 1, 1)))).toBe(false);
  });

  it('resolves a legal bishop move into pieceMoved', () => {
    const bishop = mkPiece({ id: 'wb', kind: ChessPieceKind.BISHOP, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [bishop] });
    const move = mkBishopMove(3, 3, 2, 2);

    const effects = BishopMoveResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(1);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(bishop.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 2, column: 2 });
  });

  it('throws IllegalMoveError for an illegal bishop move', () => {
    const bishop = mkPiece({ id: 'wb', kind: ChessPieceKind.BISHOP, row: 3, column: 3 });
    const blocker = mkPiece({
      id: 'block',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      row: 4,
      column: 4,
    });
    const gs = mkSnapshot({ pieces: [bishop, blocker] });
    const illegal = mkBishopMove(3, 3, 5, 5);

    expect(() => BishopMoveResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });
});
