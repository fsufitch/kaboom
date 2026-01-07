import { describe, expect, it, vi } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { KnightCaptureResolver } from '@kaboom/engine/classic/knight_capture';
import { ChessColor, ChessPiece, ChessPieceKind, Move, Place } from '@kaboom/proto';

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

  it('skips off-board captures from the corner', () => {
    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 0, column: 0 });
    const enemy = mkPiece({
      id: 'enemy',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 2,
      column: 1,
    });
    const gs = mkSnapshot({ pieces: [knight, enemy] });

    const moves = KnightCaptureResolver.validMoves(gs, knight.id);

    expect(moves).toHaveLength(1);
    expect(moves.some((m) => movesEqual(m, mkKnightCapture(0, 0, 2, 1)))).toBe(true);
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

  it('validates invariant checks for knight captures', () => {
    expect(() => KnightCaptureResolver.validMoves(mkSnapshot(), 'missing')).toThrow(
      "Piece with ID 'missing' does not exist",
    );

    const unplaced = ChessPiece.create({
      id: 'wn-unplaced',
      kind: ChessPieceKind.KNIGHT,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsUnplaced = mkSnapshot({ pieces: [unplaced] });
    expect(() => KnightCaptureResolver.validMoves(gsUnplaced, unplaced.id)).toThrow(
      'not on a board',
    );

    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 3, column: 3 });
    const gsWrong = mkSnapshot({ pieces: [pawn] });
    expect(() => KnightCaptureResolver.validMoves(gsWrong, pawn.id)).toThrow('not a Knight');

    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 2, column: 2 });
    const gsKnight = mkSnapshot({ pieces: [knight] });
    const badBoardMove = Move.create({
      classicMove: {
        knight: {
          capture: {
            from: { boardId: 'unknown', boardPosition: { row: 2, column: 2 } },
            to: { boardId: 'unknown', boardPosition: { row: 3, column: 4 } },
          },
        },
      },
    });
    expect(() => KnightCaptureResolver.getMovedPieceIds(gsKnight, badBoardMove)).toThrow(
      "unknown board ID 'unknown'",
    );

    const missingBoardIdMove = Move.create({
      classicMove: {
        knight: {
          capture: {
            from: { boardPosition: { row: 2, column: 2 } },
            to: { boardId: BOARD_ID, boardPosition: { row: 3, column: 4 } },
          },
        },
      },
    });
    expect(() => KnightCaptureResolver.getMovedPieceIds(gsKnight, missingBoardIdMove)).toThrow(
      "unknown board ID ''",
    );

    const emptyCapture = mkKnightCapture(2, 2, 3, 4);
    expect(() => KnightCaptureResolver.getMovedPieceIds(mkSnapshot(), emptyCapture)).toThrow(
      'no piece at position',
    );
  });

  it('rejects moves that are not knight captures', () => {
    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 2, column: 2 });
    const gs = mkSnapshot({ pieces: [knight] });

    expect(() => KnightCaptureResolver.getMovedPieceIds(gs, Move.create({}))).toThrow(
      'not a Knight capture',
    );
    expect(() => KnightCaptureResolver.resolveToEffects(gs, Move.create({}))).toThrow(
      'not a Knight capture',
    );

    const bishop = mkPiece({ id: 'wb', kind: ChessPieceKind.BISHOP, row: 2, column: 2 });
    const gsWrong = mkSnapshot({ pieces: [bishop] });
    const move = mkKnightCapture(2, 2, 3, 4);
    expect(() => KnightCaptureResolver.resolveToEffects(gsWrong, move)).toThrow('not a Knight');
  });

  it('guards against inconsistent moved piece resolution and capture targets', () => {
    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 2, column: 2 });
    const gs = mkSnapshot({ pieces: [knight] });
    const move = mkKnightCapture(2, 2, 3, 4);

    const emptySpy = vi.spyOn(KnightCaptureResolver, 'getMovedPieceIds').mockReturnValue([]);
    expect(() => KnightCaptureResolver.resolveToEffects(gs, move)).toThrow(
      'Knight capture should move exactly one piece',
    );
    emptySpy.mockRestore();

    const missingSpy = vi.spyOn(KnightCaptureResolver, 'getMovedPieceIds').mockReturnValue(['x']);
    expect(() => KnightCaptureResolver.resolveToEffects(gs, move)).toThrow(
      "could not find knight piece with ID 'x'",
    );
    missingSpy.mockRestore();

    const validSpy = vi.spyOn(KnightCaptureResolver, 'validMoves').mockReturnValue([move]);
    const movedSpy = vi
      .spyOn(KnightCaptureResolver, 'getMovedPieceIds')
      .mockReturnValue([knight.id]);
    expect(() => KnightCaptureResolver.resolveToEffects(gs, move)).toThrow('No piece to capture');
    movedSpy.mockRestore();
    validSpy.mockRestore();

    const missingTargetBoardMove = Move.create({
      classicMove: {
        knight: {
          capture: {
            from: { boardId: BOARD_ID, boardPosition: { row: 2, column: 2 } },
            to: { boardPosition: { row: 3, column: 4 } },
          },
        },
      },
    });
    const validSpy2 = vi
      .spyOn(KnightCaptureResolver, 'validMoves')
      .mockReturnValue([missingTargetBoardMove]);
    expect(() => KnightCaptureResolver.resolveToEffects(gs, missingTargetBoardMove)).toThrow(
      'No piece to capture',
    );
    validSpy2.mockRestore();
  });
});
