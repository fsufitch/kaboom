import { describe, expect, it, vi } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { PawnCaptureResolver } from '@kaboom/engine/classic/pawn_capture';
import { ChessColor, ChessPiece, ChessPieceKind, Move, Place } from '@kaboom/proto';

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

  it('skips off-board capture diagonals at the edge', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 3, column: 0 });
    const enemy = mkPiece({
      id: 'bp',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 4,
      column: 1,
    });
    const gs = mkSnapshot({ pieces: [pawn, enemy] });

    const moves = PawnCaptureResolver.validMoves(gs, pawn.id);

    expect(moves).toHaveLength(1);
    expect(moves.some((m) => movesEqual(m, mkPawnCaptureMove(3, 0, 4, 1)))).toBe(true);
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

  it('validates invariant checks for pawn capture moves', () => {
    expect(() => PawnCaptureResolver.validMoves(mkSnapshot(), 'missing')).toThrow(
      "Piece with ID 'missing' does not exist",
    );

    const rook = mkPiece({ id: 'rook', kind: ChessPieceKind.ROOK, row: 1, column: 3 });
    const gsWrong = mkSnapshot({ pieces: [rook] });
    expect(() => PawnCaptureResolver.validMoves(gsWrong, rook.id)).toThrow('not a Pawn');

    const unplaced = ChessPiece.create({
      id: 'p1',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsUnplaced = mkSnapshot({ pieces: [unplaced] });
    expect(() => PawnCaptureResolver.validMoves(gsUnplaced, unplaced.id)).toThrow('not on a board');

    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 1, column: 1 });
    const gsPawn = mkSnapshot({ pieces: [pawn] });
    const badBoardMove = Move.create({
      classicMove: {
        pawn: {
          capture: {
            from: { boardId: 'unknown', boardPosition: { row: 1, column: 1 } },
            to: { boardId: 'unknown', boardPosition: { row: 2, column: 2 } },
          },
        },
      },
    });
    expect(() => PawnCaptureResolver.getMovedPieceIds(gsPawn, badBoardMove)).toThrow(
      "unknown board ID 'unknown'",
    );

    const missingBoardIdMove = Move.create({
      classicMove: {
        pawn: {
          capture: {
            from: { boardPosition: { row: 1, column: 1 } },
            to: { boardId: BOARD_ID, boardPosition: { row: 2, column: 2 } },
          },
        },
      },
    });
    expect(() => PawnCaptureResolver.getMovedPieceIds(gsPawn, missingBoardIdMove)).toThrow(
      "unknown board ID ''",
    );

    const emptyCapture = mkPawnCaptureMove(1, 1, 2, 2);
    expect(() => PawnCaptureResolver.getMovedPieceIds(mkSnapshot(), emptyCapture)).toThrow(
      'no piece at position',
    );
  });

  it('rejects moves that are not pawn captures', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [pawn] });

    expect(() => PawnCaptureResolver.getMovedPieceIds(gs, Move.create({}))).toThrow(
      'not a Pawn capture',
    );
    expect(() => PawnCaptureResolver.resolveToEffects(gs, Move.create({}))).toThrow(
      'not a Pawn capture',
    );

    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 3, column: 3 });
    const gsWrong = mkSnapshot({ pieces: [rook] });
    const move = mkPawnCaptureMove(3, 3, 4, 4);
    expect(() => PawnCaptureResolver.resolveToEffects(gsWrong, move)).toThrow(
      'piece at origin is not a Pawn',
    );
  });

  it('guards against inconsistent moved piece resolution and capture targets', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const move = mkPawnCaptureMove(3, 3, 4, 4);

    const emptySpy = vi.spyOn(PawnCaptureResolver, 'getMovedPieceIds').mockReturnValue([]);
    expect(() => PawnCaptureResolver.resolveToEffects(gs, move)).toThrow(
      'Pawn capture should move exactly one piece',
    );
    emptySpy.mockRestore();

    const missingSpy = vi.spyOn(PawnCaptureResolver, 'getMovedPieceIds').mockReturnValue(['x']);
    expect(() => PawnCaptureResolver.resolveToEffects(gs, move)).toThrow(
      "could not find pawn piece with ID 'x'",
    );
    missingSpy.mockRestore();

    const validSpy = vi.spyOn(PawnCaptureResolver, 'validMoves').mockReturnValue([move]);
    const movedSpy = vi.spyOn(PawnCaptureResolver, 'getMovedPieceIds').mockReturnValue([pawn.id]);
    expect(() => PawnCaptureResolver.resolveToEffects(gs, move)).toThrow('No piece to capture');
    movedSpy.mockRestore();
    validSpy.mockRestore();

    const missingTargetBoardMove = Move.create({
      classicMove: {
        pawn: {
          capture: {
            from: { boardId: BOARD_ID, boardPosition: { row: 3, column: 3 } },
            to: { boardPosition: { row: 4, column: 4 } },
          },
        },
      },
    });
    const validSpyMissingTarget = vi
      .spyOn(PawnCaptureResolver, 'validMoves')
      .mockReturnValue([missingTargetBoardMove]);
    expect(() => PawnCaptureResolver.resolveToEffects(gs, missingTargetBoardMove)).toThrow(
      'No piece to capture',
    );
    validSpyMissingTarget.mockRestore();

    const friendly = mkPiece({
      id: 'wp2',
      color: ChessColor.WHITE,
      row: 4,
      column: 4,
    });
    const gsFriendly = mkSnapshot({ pieces: [pawn, friendly] });
    const validSpy2 = vi.spyOn(PawnCaptureResolver, 'validMoves').mockReturnValue([move]);
    const movedSpy2 = vi.spyOn(PawnCaptureResolver, 'getMovedPieceIds').mockReturnValue([pawn.id]);
    expect(() => PawnCaptureResolver.resolveToEffects(gsFriendly, move)).toThrow(
      'Cannot capture own piece',
    );
    movedSpy2.mockRestore();
    validSpy2.mockRestore();
  });
});
