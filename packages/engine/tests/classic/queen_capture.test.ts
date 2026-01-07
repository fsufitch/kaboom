import { describe, expect, it } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { QueenCaptureResolver } from '@kaboom/engine/classic/queen_capture';
import { ChessColor, ChessPieceKind, Move } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkQueenCapture = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      queen: {
        capture: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('QueenCaptureResolver (classic)', () => {
  it('enumerates the first capturable opponent in each direction', () => {
    const queen = mkPiece({ id: 'wq', kind: ChessPieceKind.QUEEN, row: 3, column: 3 });

    const northTarget = mkPiece({
      id: 'target-n',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 5,
      column: 3,
    });
    const northBehind = mkPiece({
      id: 'behind-n',
      kind: ChessPieceKind.ROOK,
      color: ChessColor.BLACK,
      row: 6,
      column: 3,
    });

    const eastBlock = mkPiece({
      id: 'block-e',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.WHITE,
      row: 3,
      column: 5,
    });
    const eastBehind = mkPiece({
      id: 'behind-e',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 3,
      column: 6,
    });

    const westTarget = mkPiece({
      id: 'target-w',
      kind: ChessPieceKind.KNIGHT,
      color: ChessColor.BLACK,
      row: 3,
      column: 1,
    });

    const neTarget = mkPiece({
      id: 'target-ne',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 5,
      column: 5,
    });
    const neBehind = mkPiece({
      id: 'behind-ne',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.BLACK,
      row: 6,
      column: 6,
    });

    const nwBlock = mkPiece({
      id: 'block-nw',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      row: 4,
      column: 2,
    });
    const nwBehind = mkPiece({
      id: 'behind-nw',
      kind: ChessPieceKind.QUEEN,
      color: ChessColor.BLACK,
      row: 5,
      column: 1,
    });

    const seTarget = mkPiece({
      id: 'target-se',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 2,
      column: 4,
    });

    const swTarget = mkPiece({
      id: 'target-sw',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.BLACK,
      row: 1,
      column: 1,
    });
    const swBehind = mkPiece({
      id: 'behind-sw',
      kind: ChessPieceKind.ROOK,
      color: ChessColor.BLACK,
      row: 0,
      column: 0,
    });

    const gs = mkSnapshot({
      pieces: [
        queen,
        northTarget,
        northBehind,
        eastBlock,
        eastBehind,
        westTarget,
        neTarget,
        neBehind,
        nwBlock,
        nwBehind,
        seTarget,
        swTarget,
        swBehind,
      ],
    });

    const moves = QueenCaptureResolver.validMoves(gs, queen.id);

    const expected = [
      mkQueenCapture(3, 3, 5, 3),
      mkQueenCapture(3, 3, 3, 1),
      mkQueenCapture(3, 3, 5, 5),
      mkQueenCapture(3, 3, 2, 4),
      mkQueenCapture(3, 3, 1, 1),
    ];

    expect(moves).toHaveLength(5);
    for (const e of expected) {
      expect(moves.some((m) => movesEqual(m, e))).toBe(true);
    }

    expect(moves.some((m) => movesEqual(m, mkQueenCapture(3, 3, 6, 3)))).toBe(false);
    expect(moves.some((m) => movesEqual(m, mkQueenCapture(3, 3, 3, 6)))).toBe(false);
    expect(moves.some((m) => movesEqual(m, mkQueenCapture(3, 3, 5, 1)))).toBe(false);
    expect(moves.some((m) => movesEqual(m, mkQueenCapture(3, 3, 0, 0)))).toBe(false);
  });

  it('resolves a legal queen capture into pieceMoved + pieceCaptured', () => {
    const queen = mkPiece({ id: 'wq', kind: ChessPieceKind.QUEEN, row: 3, column: 3 });
    const target = mkPiece({
      id: 'target',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 5,
      column: 5,
    });

    const gs = mkSnapshot({ pieces: [queen, target] });
    const move = mkQueenCapture(3, 3, 5, 5);

    const effects = QueenCaptureResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(2);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(queen.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 5, column: 5 });
    expect(effect?.stateChanges[1]?.pieceCaptured?.pieceId).toBe(target.id);
  });

  it('throws IllegalMoveError for an illegal queen capture', () => {
    const queen = mkPiece({ id: 'wq', kind: ChessPieceKind.QUEEN, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [queen] });
    const illegal = mkQueenCapture(3, 3, 4, 4);

    expect(() => QueenCaptureResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });
});
