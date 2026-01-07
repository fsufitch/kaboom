import { describe, expect, it, vi } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { RookMoveResolver } from '@kaboom/engine/classic/rook_move';
import { ChessColor, ChessPiece, ChessPieceKind, Move, Place } from '@kaboom/proto';

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

  it('validates invariant checks for rook moves', () => {
    expect(() => RookMoveResolver.validMoves(mkSnapshot(), 'missing')).toThrow(
      "Piece with ID 'missing' does not exist",
    );

    const unplaced = ChessPiece.create({
      id: 'wr-unplaced',
      kind: ChessPieceKind.ROOK,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsUnplaced = mkSnapshot({ pieces: [unplaced] });
    expect(() => RookMoveResolver.validMoves(gsUnplaced, unplaced.id)).toThrow('not on a board');

    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 3, column: 3 });
    const gsWrong = mkSnapshot({ pieces: [pawn] });
    expect(() => RookMoveResolver.validMoves(gsWrong, pawn.id)).toThrow('not a Rook');

    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 2, column: 2 });
    const gsRook = mkSnapshot({ pieces: [rook] });
    const badBoardMove = Move.create({
      classicMove: {
        rook: {
          move: {
            from: { boardId: 'unknown', boardPosition: { row: 2, column: 2 } },
            to: { boardId: 'unknown', boardPosition: { row: 2, column: 3 } },
          },
        },
      },
    });
    expect(() => RookMoveResolver.getMovedPieceIds(gsRook, badBoardMove)).toThrow(
      "unknown board ID 'unknown'",
    );

    const missingBoardIdMove = Move.create({
      classicMove: {
        rook: {
          move: {
            from: { boardPosition: { row: 2, column: 2 } },
            to: { boardId: BOARD_ID, boardPosition: { row: 2, column: 3 } },
          },
        },
      },
    });
    expect(() => RookMoveResolver.getMovedPieceIds(gsRook, missingBoardIdMove)).toThrow(
      "unknown board ID ''",
    );

    const emptyMove = mkRookMove(2, 2, 2, 3);
    expect(() => RookMoveResolver.getMovedPieceIds(mkSnapshot(), emptyMove)).toThrow(
      'no piece at position',
    );
  });

  it('rejects moves that are not rook moves', () => {
    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 2, column: 2 });
    const gs = mkSnapshot({ pieces: [rook] });

    expect(() => RookMoveResolver.getMovedPieceIds(gs, Move.create({}))).toThrow('not a Rook move');
    expect(() => RookMoveResolver.resolveToEffects(gs, Move.create({}))).toThrow('not a Rook move');

    const bishop = mkPiece({ id: 'wb', kind: ChessPieceKind.BISHOP, row: 2, column: 2 });
    const gsWrong = mkSnapshot({ pieces: [bishop] });
    const move = mkRookMove(2, 2, 2, 3);
    expect(() => RookMoveResolver.resolveToEffects(gsWrong, move)).toThrow('not a Rook');
  });

  it('guards against inconsistent moved piece resolution', () => {
    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 2, column: 2 });
    const gs = mkSnapshot({ pieces: [rook] });
    const move = mkRookMove(2, 2, 2, 3);

    const emptySpy = vi.spyOn(RookMoveResolver, 'getMovedPieceIds').mockReturnValue([]);
    expect(() => RookMoveResolver.resolveToEffects(gs, move)).toThrow(
      'Rook move should move exactly one piece',
    );
    emptySpy.mockRestore();

    const missingSpy = vi.spyOn(RookMoveResolver, 'getMovedPieceIds').mockReturnValue(['x']);
    expect(() => RookMoveResolver.resolveToEffects(gs, move)).toThrow(
      "could not find rook piece with ID 'x'",
    );
    missingSpy.mockRestore();
  });
});
