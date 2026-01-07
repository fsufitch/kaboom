import { describe, expect, it } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { RookMoveResolver } from '@kaboom/engine/classic/rook_move';
import { ChessColor, ChessPieceKind, Move } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkRookMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      rook: {
        move: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('RookMoveResolver (classic)', () => {
  it('enumerates straight-line moves until blocked', () => {
    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 3, column: 3 });
    const northBlock = mkPiece({
      id: 'block-n',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.WHITE,
      row: 5,
      column: 3,
    });
    const eastBlock = mkPiece({
      id: 'block-e',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 3,
      column: 5,
    });
    const westBlock = mkPiece({
      id: 'block-w',
      kind: ChessPieceKind.KNIGHT,
      color: ChessColor.WHITE,
      row: 3,
      column: 2,
    });

    const gs = mkSnapshot({ pieces: [rook, northBlock, eastBlock, westBlock] });

    const moves = RookMoveResolver.validMoves(gs, rook.id);

    const expected = [
      mkRookMove(3, 3, 4, 3),
      mkRookMove(3, 3, 3, 4),
      mkRookMove(3, 3, 2, 3),
      mkRookMove(3, 3, 1, 3),
      mkRookMove(3, 3, 0, 3),
    ];

    expect(moves).toHaveLength(5);
    for (const e of expected) {
      expect(moves.some((m) => movesEqual(m, e))).toBe(true);
    }

    expect(moves.some((m) => movesEqual(m, mkRookMove(3, 3, 5, 3)))).toBe(false);
    expect(moves.some((m) => movesEqual(m, mkRookMove(3, 3, 3, 2)))).toBe(false);
  });

  it('resolves a legal rook move into pieceMoved', () => {
    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [rook] });
    const move = mkRookMove(3, 3, 1, 3);

    const effects = RookMoveResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(1);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(rook.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 1, column: 3 });
  });

  it('throws IllegalMoveError for an illegal rook move', () => {
    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [rook] });
    const illegal = mkRookMove(3, 3, 4, 4);

    expect(() => RookMoveResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });
});
