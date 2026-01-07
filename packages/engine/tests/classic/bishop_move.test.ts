import { describe, expect, it, vi } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { BishopMoveResolver } from '@kaboom/engine/classic/bishop_move';
import { ChessColor, ChessPiece, ChessPieceKind, Move, Place } from '@kaboom/proto';

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

  it('validates invariant checks for bishop moves', () => {
    expect(() => BishopMoveResolver.validMoves(mkSnapshot(), 'missing')).toThrow(
      "Piece with ID 'missing' does not exist",
    );

    const unplaced = ChessPiece.create({
      id: 'wb-unplaced',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsUnplaced = mkSnapshot({ pieces: [unplaced] });
    expect(() => BishopMoveResolver.validMoves(gsUnplaced, unplaced.id)).toThrow('not on a board');

    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 3, column: 3 });
    const gsWrong = mkSnapshot({ pieces: [pawn] });
    expect(() => BishopMoveResolver.validMoves(gsWrong, pawn.id)).toThrow('not a Bishop');

    const bishop = mkPiece({ id: 'wb', kind: ChessPieceKind.BISHOP, row: 2, column: 2 });
    const gsBishop = mkSnapshot({ pieces: [bishop] });
    const badBoardMove = Move.create({
      classicMove: {
        bishop: {
          move: {
            from: { boardId: 'unknown', boardPosition: { row: 2, column: 2 } },
            to: { boardId: 'unknown', boardPosition: { row: 3, column: 3 } },
          },
        },
      },
    });
    expect(() => BishopMoveResolver.getMovedPieceIds(gsBishop, badBoardMove)).toThrow(
      "unknown board ID 'unknown'",
    );

    const missingBoardIdMove = Move.create({
      classicMove: {
        bishop: {
          move: {
            from: { boardPosition: { row: 2, column: 2 } },
            to: { boardId: BOARD_ID, boardPosition: { row: 3, column: 3 } },
          },
        },
      },
    });
    expect(() => BishopMoveResolver.getMovedPieceIds(gsBishop, missingBoardIdMove)).toThrow(
      "unknown board ID ''",
    );

    const emptyMove = mkBishopMove(2, 2, 3, 3);
    expect(() => BishopMoveResolver.getMovedPieceIds(mkSnapshot(), emptyMove)).toThrow(
      'no piece at position',
    );
  });

  it('rejects moves that are not bishop moves', () => {
    const bishop = mkPiece({ id: 'wb', kind: ChessPieceKind.BISHOP, row: 2, column: 2 });
    const gs = mkSnapshot({ pieces: [bishop] });

    expect(() => BishopMoveResolver.getMovedPieceIds(gs, Move.create({}))).toThrow(
      'not a Bishop move',
    );
    expect(() => BishopMoveResolver.resolveToEffects(gs, Move.create({}))).toThrow(
      'not a Bishop move',
    );

    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 2, column: 2 });
    const gsWrong = mkSnapshot({ pieces: [rook] });
    const move = mkBishopMove(2, 2, 3, 3);
    expect(() => BishopMoveResolver.resolveToEffects(gsWrong, move)).toThrow('not a Bishop');
  });

  it('guards against inconsistent moved piece resolution', () => {
    const bishop = mkPiece({ id: 'wb', kind: ChessPieceKind.BISHOP, row: 2, column: 2 });
    const gs = mkSnapshot({ pieces: [bishop] });
    const move = mkBishopMove(2, 2, 3, 3);

    const emptySpy = vi.spyOn(BishopMoveResolver, 'getMovedPieceIds').mockReturnValue([]);
    expect(() => BishopMoveResolver.resolveToEffects(gs, move)).toThrow(
      'Bishop move should move exactly one piece',
    );
    emptySpy.mockRestore();

    const missingSpy = vi.spyOn(BishopMoveResolver, 'getMovedPieceIds').mockReturnValue(['x']);
    expect(() => BishopMoveResolver.resolveToEffects(gs, move)).toThrow(
      "could not find bishop piece with ID 'x'",
    );
    missingSpy.mockRestore();
  });
});
