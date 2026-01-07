import { describe, expect, it, vi } from 'vitest';

import { IllegalMoveError, movesEqual, newReadonlyArray } from '@kaboom/engine/base';
import { BishopCaptureResolver } from '@kaboom/engine/classic/bishop_capture';
import {
  ChessBoard,
  ChessColor,
  ChessPiece,
  ChessPieceKind,
  GameSnapshot,
  Move,
  Place,
  Variant,
} from '@kaboom/proto';

const BOARD_ID = 'board-1';

function mkBoard(): ChessBoard {
  return ChessBoard.create({
    id: BOARD_ID,
    rows: 8,
    columns: 8,
    activeColor: ChessColor.WHITE,
  });
}

function mkPiece(
  id: string,
  kind: ChessPieceKind,
  color: ChessColor,
  row: number,
  column: number,
): ChessPiece {
  return ChessPiece.create({
    id,
    kind,
    color,
    place: {
      boardId: BOARD_ID,
      boardPosition: { row, column },
    },
  });
}

function mkSnapshot(pieces: readonly ChessPiece[]): GameSnapshot {
  return GameSnapshot.create({
    properties: { id: 'game-1', variant: Variant.CLASSIC },
    boards: newReadonlyArray(mkBoard()),
    pieces,
  });
}

function mkBishopCaptureMove(fromRow: number, fromCol: number, toRow: number, toCol: number): Move {
  return Move.create({
    classicMove: {
      bishop: {
        capture: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });
}

describe('BishopCaptureResolver (classic)', () => {
  it('enumerates only the first capturable opponent on each diagonal, and stops at blockers', () => {
    const bishop = mkPiece('wb', ChessPieceKind.BISHOP, ChessColor.WHITE, 3, 3);

    // NE: first enemy at (5,5) is capturable; piece behind at (6,6) must not be.
    const neTarget = mkPiece('bp-ne', ChessPieceKind.PAWN, ChessColor.BLACK, 5, 5);
    const neBehind = mkPiece('bq-ne-behind', ChessPieceKind.QUEEN, ChessColor.BLACK, 6, 6);

    // NW: enemy at (6,0) is capturable (diagonal up-left)
    const nwTarget = mkPiece('br-nw', ChessPieceKind.ROOK, ChessColor.BLACK, 6, 0);

    // SW: immediate enemy at (2,2) is capturable
    const swTarget = mkPiece('bn-sw', ChessPieceKind.KNIGHT, ChessColor.BLACK, 2, 2);

    // SE: friendly at (1,5) blocks; enemy behind at (0,6) must not be capturable
    const seBlock = mkPiece('wp-block', ChessPieceKind.PAWN, ChessColor.WHITE, 1, 5);
    const seBehind = mkPiece('bp-se-behind', ChessPieceKind.PAWN, ChessColor.BLACK, 0, 6);

    const gs = mkSnapshot([bishop, neTarget, neBehind, nwTarget, swTarget, seBlock, seBehind]);

    const moves = BishopCaptureResolver.validMoves(gs, bishop.id);

    const expected = [
      mkBishopCaptureMove(3, 3, 5, 5),
      mkBishopCaptureMove(3, 3, 6, 0),
      mkBishopCaptureMove(3, 3, 2, 2),
    ];

    expect(moves).toHaveLength(3);
    for (const e of expected) {
      expect(moves.some((m) => movesEqual(m, e))).toBe(true);
    }

    expect(moves.some((m) => movesEqual(m, mkBishopCaptureMove(3, 3, 6, 6)))).toBe(false);
    expect(moves.some((m) => movesEqual(m, mkBishopCaptureMove(3, 3, 0, 6)))).toBe(false);
  });

  it('resolves a legal capture into pieceMoved + pieceCaptured state changes', () => {
    const bishop = mkPiece('wb', ChessPieceKind.BISHOP, ChessColor.WHITE, 3, 3);
    const target = mkPiece('bp', ChessPieceKind.PAWN, ChessColor.BLACK, 5, 5);

    const gs = mkSnapshot([bishop, target]);
    const move = mkBishopCaptureMove(3, 3, 5, 5);

    const effects = BishopCaptureResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect).toBeDefined();

    expect(effect!.stateChanges).toHaveLength(2);

    const sc0 = effect!.stateChanges[0];
    const sc1 = effect!.stateChanges[1];

    expect(sc0?.pieceMoved?.pieceId).toBe(bishop.id);
    expect(sc0?.pieceMoved?.to).toEqual({ row: 5, column: 5 });

    expect(sc1?.pieceCaptured?.pieceId).toBe(target.id);
  });

  it('throws IllegalMoveError for an illegal capture move (e.g., capture to empty square)', () => {
    const bishop = mkPiece('wb', ChessPieceKind.BISHOP, ChessColor.WHITE, 3, 3);
    const gs = mkSnapshot([bishop]);

    const illegal = mkBishopCaptureMove(3, 3, 4, 4);

    expect(() => BishopCaptureResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });

  it('validates invariant checks for bishop captures', () => {
    expect(() => BishopCaptureResolver.validMoves(mkSnapshot([]), 'missing')).toThrow(
      "Piece with ID 'missing' does not exist",
    );

    const unplaced = ChessPiece.create({
      id: 'wb-unplaced',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsUnplaced = mkSnapshot([unplaced]);
    expect(() => BishopCaptureResolver.validMoves(gsUnplaced, unplaced.id)).toThrow(
      'not on a board',
    );

    const pawn = mkPiece('wp', ChessPieceKind.PAWN, ChessColor.WHITE, 3, 3);
    const gsWrong = mkSnapshot([pawn]);
    expect(() => BishopCaptureResolver.validMoves(gsWrong, pawn.id)).toThrow('not a Bishop');

    const bishop = mkPiece('wb', ChessPieceKind.BISHOP, ChessColor.WHITE, 2, 2);
    const gsBishop = mkSnapshot([bishop]);
    const badBoardMove = Move.create({
      classicMove: {
        bishop: {
          capture: {
            from: { boardId: 'unknown', boardPosition: { row: 2, column: 2 } },
            to: { boardId: 'unknown', boardPosition: { row: 3, column: 3 } },
          },
        },
      },
    });
    expect(() => BishopCaptureResolver.getMovedPieceIds(gsBishop, badBoardMove)).toThrow(
      "unknown board ID 'unknown'",
    );

    const missingBoardIdMove = Move.create({
      classicMove: {
        bishop: {
          capture: {
            from: { boardPosition: { row: 2, column: 2 } },
            to: { boardId: BOARD_ID, boardPosition: { row: 3, column: 3 } },
          },
        },
      },
    });
    expect(() => BishopCaptureResolver.getMovedPieceIds(gsBishop, missingBoardIdMove)).toThrow(
      "unknown board ID ''",
    );

    const emptyCapture = mkBishopCaptureMove(2, 2, 3, 3);
    expect(() => BishopCaptureResolver.getMovedPieceIds(mkSnapshot([]), emptyCapture)).toThrow(
      'no piece at position',
    );
  });

  it('rejects moves that are not bishop captures', () => {
    const bishop = mkPiece('wb', ChessPieceKind.BISHOP, ChessColor.WHITE, 3, 3);
    const gs = mkSnapshot([bishop]);

    expect(() => BishopCaptureResolver.getMovedPieceIds(gs, Move.create({}))).toThrow(
      'not a Bishop capture',
    );
    expect(() => BishopCaptureResolver.resolveToEffects(gs, Move.create({}))).toThrow(
      'not a Bishop capture',
    );

    const rook = mkPiece('wr', ChessPieceKind.ROOK, ChessColor.WHITE, 3, 3);
    const gsWrong = mkSnapshot([rook]);
    const move = mkBishopCaptureMove(3, 3, 4, 4);
    expect(() => BishopCaptureResolver.resolveToEffects(gsWrong, move)).toThrow('not a Bishop');
  });

  it('guards against inconsistent moved piece resolution and capture targets', () => {
    const bishop = mkPiece('wb', ChessPieceKind.BISHOP, ChessColor.WHITE, 2, 2);
    const gs = mkSnapshot([bishop]);
    const move = mkBishopCaptureMove(2, 2, 3, 3);

    const emptySpy = vi.spyOn(BishopCaptureResolver, 'getMovedPieceIds').mockReturnValue([]);
    expect(() => BishopCaptureResolver.resolveToEffects(gs, move)).toThrow(
      'Bishop capture should move exactly one piece',
    );
    emptySpy.mockRestore();

    const missingSpy = vi.spyOn(BishopCaptureResolver, 'getMovedPieceIds').mockReturnValue(['x']);
    expect(() => BishopCaptureResolver.resolveToEffects(gs, move)).toThrow(
      "could not find bishop piece with ID 'x'",
    );
    missingSpy.mockRestore();

    const validSpy = vi.spyOn(BishopCaptureResolver, 'validMoves').mockReturnValue([move]);
    const movedSpy = vi
      .spyOn(BishopCaptureResolver, 'getMovedPieceIds')
      .mockReturnValue([bishop.id]);
    expect(() => BishopCaptureResolver.resolveToEffects(gs, move)).toThrow('No piece to capture');
    movedSpy.mockRestore();
    validSpy.mockRestore();

    const missingTargetBoardMove = Move.create({
      classicMove: {
        bishop: {
          capture: {
            from: { boardId: BOARD_ID, boardPosition: { row: 2, column: 2 } },
            to: { boardPosition: { row: 3, column: 3 } },
          },
        },
      },
    });
    const validSpy2 = vi
      .spyOn(BishopCaptureResolver, 'validMoves')
      .mockReturnValue([missingTargetBoardMove]);
    expect(() => BishopCaptureResolver.resolveToEffects(gs, missingTargetBoardMove)).toThrow(
      'No piece to capture',
    );
    validSpy2.mockRestore();
  });
});
