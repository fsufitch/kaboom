import { describe, expect, it, vi } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { QueenMoveResolver } from '@kaboom/engine/classic/queen_move';
import { ChessColor, ChessPiece, ChessPieceKind, Move, Place } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkQueenMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      queen: {
        move: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('QueenMoveResolver (classic)', () => {
  it('enumerates queen moves until blocked in any direction', () => {
    const queen = mkPiece({ id: 'wq', kind: ChessPieceKind.QUEEN, row: 3, column: 3 });
    const eastBlock = mkPiece({
      id: 'block-e',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 3,
      column: 5,
    });
    const westBlock = mkPiece({
      id: 'block-w',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      row: 3,
      column: 2,
    });
    const northBlock = mkPiece({
      id: 'block-n',
      kind: ChessPieceKind.ROOK,
      color: ChessColor.WHITE,
      row: 5,
      column: 3,
    });
    const neBlock = mkPiece({
      id: 'block-ne',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.WHITE,
      row: 5,
      column: 5,
    });
    const seBlock = mkPiece({
      id: 'block-se',
      kind: ChessPieceKind.KNIGHT,
      color: ChessColor.BLACK,
      row: 2,
      column: 4,
    });
    const swBlock = mkPiece({
      id: 'block-sw',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      row: 1,
      column: 1,
    });

    const gs = mkSnapshot({
      pieces: [queen, eastBlock, westBlock, northBlock, neBlock, seBlock, swBlock],
    });

    const moves = QueenMoveResolver.validMoves(gs, queen.id);

    const expected = [
      mkQueenMove(3, 3, 4, 3),
      mkQueenMove(3, 3, 2, 3),
      mkQueenMove(3, 3, 1, 3),
      mkQueenMove(3, 3, 0, 3),
      mkQueenMove(3, 3, 3, 4),
      mkQueenMove(3, 3, 4, 4),
      mkQueenMove(3, 3, 4, 2),
      mkQueenMove(3, 3, 5, 1),
      mkQueenMove(3, 3, 6, 0),
      mkQueenMove(3, 3, 2, 2),
    ];

    expect(moves).toHaveLength(10);
    for (const e of expected) {
      expect(moves.some((m) => movesEqual(m, e))).toBe(true);
    }

    expect(moves.some((m) => movesEqual(m, mkQueenMove(3, 3, 5, 3)))).toBe(false);
    expect(moves.some((m) => movesEqual(m, mkQueenMove(3, 3, 3, 2)))).toBe(false);
    expect(moves.some((m) => movesEqual(m, mkQueenMove(3, 3, 2, 4)))).toBe(false);
  });

  it('resolves a legal queen move into pieceMoved', () => {
    const queen = mkPiece({ id: 'wq', kind: ChessPieceKind.QUEEN, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [queen] });
    const move = mkQueenMove(3, 3, 4, 3);

    const effects = QueenMoveResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(1);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(queen.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 4, column: 3 });
  });

  it('throws IllegalMoveError for an illegal queen move', () => {
    const queen = mkPiece({ id: 'wq', kind: ChessPieceKind.QUEEN, row: 3, column: 3 });
    const blocker = mkPiece({
      id: 'block',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      row: 5,
      column: 5,
    });
    const gs = mkSnapshot({ pieces: [queen, blocker] });
    const illegal = mkQueenMove(3, 3, 5, 5);

    expect(() => QueenMoveResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });

  it('validates invariant checks for queen moves', () => {
    expect(() => QueenMoveResolver.validMoves(mkSnapshot(), 'missing')).toThrow(
      "Piece with ID 'missing' does not exist",
    );

    const unplaced = ChessPiece.create({
      id: 'wq-unplaced',
      kind: ChessPieceKind.QUEEN,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsUnplaced = mkSnapshot({ pieces: [unplaced] });
    expect(() => QueenMoveResolver.validMoves(gsUnplaced, unplaced.id)).toThrow('not on a board');

    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 3, column: 3 });
    const gsWrong = mkSnapshot({ pieces: [pawn] });
    expect(() => QueenMoveResolver.validMoves(gsWrong, pawn.id)).toThrow('not a Queen');

    const queen = mkPiece({ id: 'wq', kind: ChessPieceKind.QUEEN, row: 2, column: 2 });
    const gsQueen = mkSnapshot({ pieces: [queen] });
    const badBoardMove = Move.create({
      classicMove: {
        queen: {
          move: {
            from: { boardId: 'unknown', boardPosition: { row: 2, column: 2 } },
            to: { boardId: 'unknown', boardPosition: { row: 2, column: 3 } },
          },
        },
      },
    });
    expect(() => QueenMoveResolver.getMovedPieceIds(gsQueen, badBoardMove)).toThrow(
      "unknown board ID 'unknown'",
    );

    const missingBoardIdMove = Move.create({
      classicMove: {
        queen: {
          move: {
            from: { boardPosition: { row: 2, column: 2 } },
            to: { boardId: BOARD_ID, boardPosition: { row: 2, column: 3 } },
          },
        },
      },
    });
    expect(() => QueenMoveResolver.getMovedPieceIds(gsQueen, missingBoardIdMove)).toThrow(
      "unknown board ID ''",
    );

    const emptyMove = mkQueenMove(2, 2, 2, 3);
    expect(() => QueenMoveResolver.getMovedPieceIds(mkSnapshot(), emptyMove)).toThrow(
      'no piece at position',
    );
  });

  it('rejects moves that are not queen moves', () => {
    const queen = mkPiece({ id: 'wq', kind: ChessPieceKind.QUEEN, row: 2, column: 2 });
    const gs = mkSnapshot({ pieces: [queen] });

    expect(() => QueenMoveResolver.getMovedPieceIds(gs, Move.create({}))).toThrow(
      'not a Queen move',
    );
    expect(() => QueenMoveResolver.resolveToEffects(gs, Move.create({}))).toThrow(
      'not a Queen move',
    );

    const bishop = mkPiece({ id: 'wb', kind: ChessPieceKind.BISHOP, row: 2, column: 2 });
    const gsWrong = mkSnapshot({ pieces: [bishop] });
    const move = mkQueenMove(2, 2, 2, 3);
    expect(() => QueenMoveResolver.resolveToEffects(gsWrong, move)).toThrow('not a Queen');
  });

  it('guards against inconsistent moved piece resolution', () => {
    const queen = mkPiece({ id: 'wq', kind: ChessPieceKind.QUEEN, row: 2, column: 2 });
    const gs = mkSnapshot({ pieces: [queen] });
    const move = mkQueenMove(2, 2, 2, 3);

    const emptySpy = vi.spyOn(QueenMoveResolver, 'getMovedPieceIds').mockReturnValue([]);
    expect(() => QueenMoveResolver.resolveToEffects(gs, move)).toThrow(
      'Queen move should move exactly one piece',
    );
    emptySpy.mockRestore();

    const missingSpy = vi.spyOn(QueenMoveResolver, 'getMovedPieceIds').mockReturnValue(['x']);
    expect(() => QueenMoveResolver.resolveToEffects(gs, move)).toThrow(
      "could not find queen piece with ID 'x'",
    );
    missingSpy.mockRestore();
  });
});
