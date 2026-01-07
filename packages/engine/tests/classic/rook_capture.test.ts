import { describe, expect, it } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { RookCaptureResolver } from '@kaboom/engine/classic/rook_capture';
import { ChessColor, ChessPieceKind, Move } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkRookCapture = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      rook: {
        capture: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('RookCaptureResolver (classic)', () => {
  it('enumerates first capturable opponent in each direction', () => {
    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 3, column: 3 });

    const northTarget = mkPiece({
      id: 'bt-n',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 5,
      column: 3,
    });
    const northBehind = mkPiece({
      id: 'bt-n2',
      kind: ChessPieceKind.QUEEN,
      color: ChessColor.BLACK,
      row: 6,
      column: 3,
    });

    const eastBlock = mkPiece({
      id: 'block-e',
      kind: ChessPieceKind.KNIGHT,
      color: ChessColor.WHITE,
      row: 3,
      column: 5,
    });
    const eastBehind = mkPiece({
      id: 'bt-e',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 3,
      column: 6,
    });

    const westTarget = mkPiece({
      id: 'bt-w',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.BLACK,
      row: 3,
      column: 1,
    });

    const southTarget = mkPiece({
      id: 'bt-s',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 1,
      column: 3,
    });
    const southBehind = mkPiece({
      id: 'bt-s2',
      kind: ChessPieceKind.ROOK,
      color: ChessColor.BLACK,
      row: 0,
      column: 3,
    });

    const gs = mkSnapshot({
      pieces: [
        rook,
        northTarget,
        northBehind,
        eastBlock,
        eastBehind,
        westTarget,
        southTarget,
        southBehind,
      ],
    });

    const moves = RookCaptureResolver.validMoves(gs, rook.id);

    const expected = [
      mkRookCapture(3, 3, 5, 3),
      mkRookCapture(3, 3, 3, 1),
      mkRookCapture(3, 3, 1, 3),
    ];

    expect(moves).toHaveLength(3);
    for (const e of expected) {
      expect(moves.some((m) => movesEqual(m, e))).toBe(true);
    }

    expect(moves.some((m) => movesEqual(m, mkRookCapture(3, 3, 6, 3)))).toBe(false);
    expect(moves.some((m) => movesEqual(m, mkRookCapture(3, 3, 3, 6)))).toBe(false);
    expect(moves.some((m) => movesEqual(m, mkRookCapture(3, 3, 0, 3)))).toBe(false);
  });

  it('resolves a legal capture into pieceMoved + pieceCaptured', () => {
    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 3, column: 3 });
    const target = mkPiece({
      id: 'bt',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 5,
      column: 3,
    });

    const gs = mkSnapshot({ pieces: [rook, target] });
    const move = mkRookCapture(3, 3, 5, 3);

    const effects = RookCaptureResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(2);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(rook.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 5, column: 3 });
    expect(effect?.stateChanges[1]?.pieceCaptured?.pieceId).toBe(target.id);
  });

  it('throws IllegalMoveError for an illegal rook capture', () => {
    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [rook] });
    const illegal = mkRookCapture(3, 3, 4, 3);

    expect(() => RookCaptureResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });
});
