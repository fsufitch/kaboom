import { describe, expect, it, vi } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { KingCaptureResolver } from '@kaboom/engine/classic/king_capture';
import { ChessColor, ChessPiece, ChessPieceKind, Move, Place } from '@kaboom/proto';

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

  it('skips off-board capture directions', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 0, column: 0 });
    const enemy = mkPiece({
      id: 'enemy',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.BLACK,
      row: 0,
      column: 1,
    });
    const gs = mkSnapshot({ pieces: [king, enemy] });

    const moves = KingCaptureResolver.validMoves(gs, king.id);

    expect(moves).toHaveLength(1);
    expect(moves.some((m) => movesEqual(m, mkKingCapture(0, 0, 0, 1)))).toBe(true);
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

  it('validates invariant checks for king captures', () => {
    expect(() => KingCaptureResolver.validMoves(mkSnapshot(), 'missing')).toThrow(
      "Piece with ID 'missing' does not exist",
    );

    const unplaced = ChessPiece.create({
      id: 'wk-unplaced',
      kind: ChessPieceKind.KING,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsUnplaced = mkSnapshot({ pieces: [unplaced] });
    expect(() => KingCaptureResolver.validMoves(gsUnplaced, unplaced.id)).toThrow('not on a board');

    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 3, column: 3 });
    const gsWrong = mkSnapshot({ pieces: [pawn] });
    expect(() => KingCaptureResolver.validMoves(gsWrong, pawn.id)).toThrow('not a King');

    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 2, column: 2 });
    const gsKing = mkSnapshot({ pieces: [king] });
    const badBoardMove = Move.create({
      classicMove: {
        king: {
          capture: {
            from: { boardId: 'unknown', boardPosition: { row: 2, column: 2 } },
            to: { boardId: 'unknown', boardPosition: { row: 3, column: 2 } },
          },
        },
      },
    });
    expect(() => KingCaptureResolver.getMovedPieceIds(gsKing, badBoardMove)).toThrow(
      "unknown board ID 'unknown'",
    );

    const missingBoardIdMove = Move.create({
      classicMove: {
        king: {
          capture: {
            from: { boardPosition: { row: 2, column: 2 } },
            to: { boardId: BOARD_ID, boardPosition: { row: 3, column: 2 } },
          },
        },
      },
    });
    expect(() => KingCaptureResolver.getMovedPieceIds(gsKing, missingBoardIdMove)).toThrow(
      "unknown board ID ''",
    );

    const emptyCapture = mkKingCapture(2, 2, 3, 2);
    expect(() => KingCaptureResolver.getMovedPieceIds(mkSnapshot(), emptyCapture)).toThrow(
      'no piece at position',
    );
  });

  it('rejects moves that are not king captures', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 2, column: 2 });
    const gs = mkSnapshot({ pieces: [king] });

    expect(() => KingCaptureResolver.getMovedPieceIds(gs, Move.create({}))).toThrow(
      'not a King capture',
    );
    expect(() => KingCaptureResolver.resolveToEffects(gs, Move.create({}))).toThrow(
      'not a King capture',
    );

    const bishop = mkPiece({ id: 'wb', kind: ChessPieceKind.BISHOP, row: 2, column: 2 });
    const gsWrong = mkSnapshot({ pieces: [bishop] });
    const move = mkKingCapture(2, 2, 3, 2);
    expect(() => KingCaptureResolver.resolveToEffects(gsWrong, move)).toThrow('not a King');
  });

  it('guards against inconsistent moved piece resolution and capture targets', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 2, column: 2 });
    const gs = mkSnapshot({ pieces: [king] });
    const move = mkKingCapture(2, 2, 3, 2);

    const emptySpy = vi.spyOn(KingCaptureResolver, 'getMovedPieceIds').mockReturnValue([]);
    expect(() => KingCaptureResolver.resolveToEffects(gs, move)).toThrow(
      'King capture should move exactly one piece',
    );
    emptySpy.mockRestore();

    const missingSpy = vi.spyOn(KingCaptureResolver, 'getMovedPieceIds').mockReturnValue(['x']);
    expect(() => KingCaptureResolver.resolveToEffects(gs, move)).toThrow(
      "could not find king piece with ID 'x'",
    );
    missingSpy.mockRestore();

    const validSpy = vi.spyOn(KingCaptureResolver, 'validMoves').mockReturnValue([move]);
    const movedSpy = vi.spyOn(KingCaptureResolver, 'getMovedPieceIds').mockReturnValue([king.id]);
    expect(() => KingCaptureResolver.resolveToEffects(gs, move)).toThrow('No piece to capture');
    movedSpy.mockRestore();
    validSpy.mockRestore();

    const missingTargetBoardMove = Move.create({
      classicMove: {
        king: {
          capture: {
            from: { boardId: BOARD_ID, boardPosition: { row: 2, column: 2 } },
            to: { boardPosition: { row: 2, column: 3 } },
          },
        },
      },
    });
    const validSpy2 = vi
      .spyOn(KingCaptureResolver, 'validMoves')
      .mockReturnValue([missingTargetBoardMove]);
    expect(() => KingCaptureResolver.resolveToEffects(gs, missingTargetBoardMove)).toThrow(
      'No piece to capture',
    );
    validSpy2.mockRestore();
  });
});
