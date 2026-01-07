import { describe, expect, it, vi } from 'vitest';

import { IllegalMoveError, movesEqual, newReadonlyArray } from '@kaboom/engine/base';
import { KingCastleResolver } from '@kaboom/engine/classic/king_castle';
import {
  ChessColor,
  ChessPiece,
  ChessPieceKind,
  Effect,
  Effect_StateChange,
  Move,
  Place,
} from '@kaboom/proto';

import { BOARD_ID, mkBoard, mkExecutedTurn, mkPiece, mkSnapshot } from './helpers';

const mkCastleMove = (
  row: number,
  kingFromCol: number,
  kingToCol: number,
  rookFromCol: number,
  rookToCol: number,
): Move =>
  Move.create({
    classicMove: {
      king: {
        castle: {
          kingFrom: { boardId: BOARD_ID, boardPosition: { row, column: kingFromCol } },
          kingTo: { boardId: BOARD_ID, boardPosition: { row, column: kingToCol } },
          rookFrom: { boardId: BOARD_ID, boardPosition: { row, column: rookFromCol } },
          rookTo: { boardId: BOARD_ID, boardPosition: { row, column: rookToCol } },
        },
      },
    },
  });

describe('KingCastleResolver (classic)', () => {
  it('enumerates castle moves when path is clear and pieces have not moved', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 0, column: 4 });
    const rookA = mkPiece({ id: 'wr-a', kind: ChessPieceKind.ROOK, row: 0, column: 0 });
    const rookH = mkPiece({ id: 'wr-h', kind: ChessPieceKind.ROOK, row: 0, column: 7 });

    const gs = mkSnapshot({ pieces: [king, rookA, rookH] });

    const moves = KingCastleResolver.validMoves(gs, king.id);

    const expected = [mkCastleMove(0, 4, 2, 0, 3), mkCastleMove(0, 4, 6, 7, 5)];

    expect(moves).toHaveLength(2);
    for (const e of expected) {
      expect(moves.some((m) => movesEqual(m, e))).toBe(true);
    }
  });

  it('skips a castle when the path is blocked', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 0, column: 4 });
    const rookA = mkPiece({ id: 'wr-a', kind: ChessPieceKind.ROOK, row: 0, column: 0 });
    const rookH = mkPiece({ id: 'wr-h', kind: ChessPieceKind.ROOK, row: 0, column: 7 });
    const block = mkPiece({
      id: 'block',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.WHITE,
      row: 0,
      column: 5,
    });

    const gs = mkSnapshot({ pieces: [king, rookA, rookH, block] });

    const moves = KingCastleResolver.validMoves(gs, king.id);

    expect(moves).toHaveLength(1);
    expect(moves.some((m) => movesEqual(m, mkCastleMove(0, 4, 2, 0, 3)))).toBe(true);
  });

  it('skips castles when rook and king share a column', () => {
    const board = mkBoard({ columns: 1 });
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 0, column: 0 });
    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 0, column: 0 });
    const gs = mkSnapshot({ boards: [board], pieces: [rook, king] });

    expect(KingCastleResolver.validMoves(gs, king.id)).toHaveLength(0);
  });

  it('skips castles that would move off the board', () => {
    const board = mkBoard({ columns: 3 });
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 0, column: 1 });
    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 0, column: 2 });
    const gs = mkSnapshot({ boards: [board], pieces: [king, rook] });

    expect(KingCastleResolver.validMoves(gs, king.id)).toHaveLength(0);
  });

  it('returns no castles if the king has moved earlier in the game', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 0, column: 4 });
    const rookA = mkPiece({ id: 'wr-a', kind: ChessPieceKind.ROOK, row: 0, column: 0 });
    const rookH = mkPiece({ id: 'wr-h', kind: ChessPieceKind.ROOK, row: 0, column: 7 });

    const turn = mkExecutedTurn({
      effects: [
        Effect.create({
          stateChanges: newReadonlyArray(
            Effect_StateChange.create({
              pieceMoved: { pieceId: king.id, to: { row: 0, column: 5 } },
            }),
          ),
        }),
      ],
    });

    const gs = mkSnapshot({ pieces: [king, rookA, rookH], turnHistory: [turn] });

    const moves = KingCastleResolver.validMoves(gs, king.id);

    expect(moves).toHaveLength(0);
  });

  it('resolves a legal castle into two pieceMoved state changes', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 0, column: 4 });
    const rookH = mkPiece({ id: 'wr-h', kind: ChessPieceKind.ROOK, row: 0, column: 7 });

    const gs = mkSnapshot({ pieces: [king, rookH] });
    const move = mkCastleMove(0, 4, 6, 7, 5);

    const effects = KingCastleResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(2);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(king.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 0, column: 6 });
    expect(effect?.stateChanges[1]?.pieceMoved?.pieceId).toBe(rookH.id);
    expect(effect?.stateChanges[1]?.pieceMoved?.to).toEqual({ row: 0, column: 5 });
  });

  it('throws IllegalMoveError for an illegal castle move', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 0, column: 4 });
    const rookH = mkPiece({ id: 'wr-h', kind: ChessPieceKind.ROOK, row: 0, column: 7 });
    const block = mkPiece({
      id: 'block',
      kind: ChessPieceKind.KNIGHT,
      color: ChessColor.WHITE,
      row: 0,
      column: 5,
    });

    const gs = mkSnapshot({ pieces: [king, rookH, block] });
    const illegal = mkCastleMove(0, 4, 6, 7, 5);

    expect(() => KingCastleResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });

  it('validates invariant checks for castling moves', () => {
    expect(() => KingCastleResolver.validMoves(mkSnapshot(), 'missing')).toThrow(
      "Piece with ID 'missing' does not exist",
    );

    const unplaced = ChessPiece.create({
      id: 'wk-unplaced',
      kind: ChessPieceKind.KING,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsUnplaced = mkSnapshot({ pieces: [unplaced] });
    expect(() => KingCastleResolver.validMoves(gsUnplaced, unplaced.id)).toThrow('not on a board');

    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 0, column: 7 });
    const gsWrong = mkSnapshot({ pieces: [rook] });
    expect(() => KingCastleResolver.validMoves(gsWrong, rook.id)).toThrow('not a King');

    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 0, column: 4 });
    const gsKing = mkSnapshot({ pieces: [king] });
    const badBoardMove = Move.create({
      classicMove: {
        king: {
          castle: {
            kingFrom: { boardId: 'unknown', boardPosition: { row: 0, column: 4 } },
            kingTo: { boardId: 'unknown', boardPosition: { row: 0, column: 6 } },
            rookFrom: { boardId: 'unknown', boardPosition: { row: 0, column: 7 } },
            rookTo: { boardId: 'unknown', boardPosition: { row: 0, column: 5 } },
          },
        },
      },
    });
    expect(() => KingCastleResolver.getMovedPieceIds(gsKing, badBoardMove)).toThrow(
      "unknown board ID 'unknown'",
    );

    const missingBoardIdMove = Move.create({
      classicMove: {
        king: {
          castle: {
            kingFrom: { boardPosition: { row: 0, column: 4 } },
            kingTo: { boardId: BOARD_ID, boardPosition: { row: 0, column: 6 } },
            rookFrom: { boardId: BOARD_ID, boardPosition: { row: 0, column: 7 } },
            rookTo: { boardId: BOARD_ID, boardPosition: { row: 0, column: 5 } },
          },
        },
      },
    });
    expect(() => KingCastleResolver.getMovedPieceIds(gsKing, missingBoardIdMove)).toThrow(
      "unknown board ID ''",
    );

    const emptyCastle = mkCastleMove(0, 4, 6, 7, 5);
    expect(() => KingCastleResolver.getMovedPieceIds(mkSnapshot(), emptyCastle)).toThrow(
      'no king at position',
    );

    const missingRook = mkCastleMove(0, 4, 6, 7, 5);
    expect(() => KingCastleResolver.getMovedPieceIds(gsKing, missingRook)).toThrow(
      'no rook at position',
    );
  });

  it('rejects moves that are not castling moves', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 0, column: 4 });
    const gs = mkSnapshot({ pieces: [king] });

    expect(() => KingCastleResolver.getMovedPieceIds(gs, Move.create({}))).toThrow(
      'not a King castle',
    );
    expect(() => KingCastleResolver.resolveToEffects(gs, Move.create({}))).toThrow(
      'not a King castle',
    );
  });

  it('guards against inconsistent moved piece resolution', () => {
    const king = mkPiece({ id: 'wk', kind: ChessPieceKind.KING, row: 0, column: 4 });
    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 0, column: 7 });
    const gs = mkSnapshot({ pieces: [king, rook] });
    const move = mkCastleMove(0, 4, 6, 7, 5);

    const emptySpy = vi.spyOn(KingCastleResolver, 'getMovedPieceIds').mockReturnValue([]);
    expect(() => KingCastleResolver.resolveToEffects(gs, move)).toThrow(
      'King castle should move exactly two pieces',
    );
    emptySpy.mockRestore();

    const missingSpy = vi.spyOn(KingCastleResolver, 'getMovedPieceIds').mockReturnValue(['x', 'y']);
    expect(() => KingCastleResolver.resolveToEffects(gs, move)).toThrow(
      "could not find king piece with ID 'x'",
    );
    missingSpy.mockRestore();

    const missingRookSpy = vi
      .spyOn(KingCastleResolver, 'getMovedPieceIds')
      .mockReturnValue([king.id, 'missing-rook']);
    expect(() => KingCastleResolver.resolveToEffects(gs, move)).toThrow(
      "could not find rook piece with ID 'missing-rook'",
    );
    missingRookSpy.mockRestore();
  });
});
