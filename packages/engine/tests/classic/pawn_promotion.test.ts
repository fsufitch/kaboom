import { describe, expect, it, vi } from 'vitest';

import { IllegalMoveError } from '@kaboom/engine/base';
import { PawnPromotionResolver } from '@kaboom/engine/classic/pawn_promotion';
import { ChessColor, ChessPiece, ChessPieceKind, Move, Place } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkPawnPromotionMove = (fromRow: number, fromCol: number, promoteTo: ChessPieceKind): Move =>
  Move.create({
    classicMove: {
      pawn: {
        promotion: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          promoteTo,
        },
      },
    },
  });

describe('PawnPromotionResolver (classic)', () => {
  it('enumerates promotion options for pawns on the final rank', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 7, column: 0 });
    const gs = mkSnapshot({ pieces: [pawn] });

    const moves = PawnPromotionResolver.validMoves(gs, pawn.id);

    expect(moves).toHaveLength(4);
    const kinds = moves.map((move) => move.classicMove?.pawn?.promotion?.promoteTo);
    expect(kinds).toEqual(
      expect.arrayContaining([
        ChessPieceKind.QUEEN,
        ChessPieceKind.ROOK,
        ChessPieceKind.BISHOP,
        ChessPieceKind.KNIGHT,
      ]),
    );
  });

  it('enumerates promotion options for black pawns on rank 0', () => {
    const pawn = mkPiece({ id: 'bp', color: ChessColor.BLACK, row: 0, column: 7 });
    const gs = mkSnapshot({ pieces: [pawn] });

    const moves = PawnPromotionResolver.validMoves(gs, pawn.id);

    expect(moves).toHaveLength(4);
  });

  it('resolves a legal promotion into a piecePromoted state change', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 7, column: 0 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const move = mkPawnPromotionMove(7, 0, ChessPieceKind.QUEEN);

    const effects = PawnPromotionResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(1);
    expect(effect?.stateChanges[0]?.piecePromoted?.pieceId).toBe(pawn.id);
    expect(effect?.stateChanges[0]?.piecePromoted?.newKind).toBe(ChessPieceKind.QUEEN);
  });

  it('throws IllegalMoveError for an illegal promotion move', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 6, column: 0 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const illegal = mkPawnPromotionMove(6, 0, ChessPieceKind.QUEEN);

    expect(() => PawnPromotionResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });

  it('returns no promotion moves when not on the final rank', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 5, column: 0 });
    const gs = mkSnapshot({ pieces: [pawn] });

    expect(PawnPromotionResolver.validMoves(gs, pawn.id)).toHaveLength(0);
  });

  it('validates invariant checks for pawn promotion moves', () => {
    expect(() => PawnPromotionResolver.validMoves(mkSnapshot(), 'missing')).toThrow(
      "Piece with ID 'missing' does not exist",
    );

    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 7, column: 0 });
    const gsWrongKind = mkSnapshot({ pieces: [rook] });
    expect(() => PawnPromotionResolver.validMoves(gsWrongKind, rook.id)).toThrow('not a Pawn');

    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 7, column: 0 });
    const gsPawn = mkSnapshot({ pieces: [pawn] });
    const missingFrom = Move.create({
      classicMove: {
        pawn: {
          promotion: {
            from: { boardId: BOARD_ID },
            promoteTo: ChessPieceKind.QUEEN,
          },
        },
      },
    });
    expect(() => PawnPromotionResolver.getMovedPieceIds(gsPawn, missingFrom)).toThrow(
      IllegalMoveError,
    );

    const missingBoardIdMove = Move.create({
      classicMove: {
        pawn: {
          promotion: {
            from: { boardPosition: { row: 7, column: 0 } },
            promoteTo: ChessPieceKind.QUEEN,
          },
        },
      },
    });
    expect(() => PawnPromotionResolver.getMovedPieceIds(gsPawn, missingBoardIdMove)).toThrow(
      "unknown board ID ''",
    );

    const emptyPromotion = mkPawnPromotionMove(7, 0, ChessPieceKind.QUEEN);
    expect(() => PawnPromotionResolver.getMovedPieceIds(mkSnapshot(), emptyPromotion)).toThrow(
      'no piece at position',
    );

    const queen = mkPiece({ id: 'wq', kind: ChessPieceKind.QUEEN, row: 7, column: 0 });
    const gsWrong = mkSnapshot({ pieces: [queen] });
    const move = mkPawnPromotionMove(7, 0, ChessPieceKind.QUEEN);
    expect(() => PawnPromotionResolver.resolveToEffects(gsWrong, move)).toThrow(
      'piece at origin is not a Pawn',
    );

    const unplaced = ChessPiece.create({
      id: 'p1',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsUnplaced = mkSnapshot({ pieces: [unplaced] });
    expect(() => PawnPromotionResolver.validMoves(gsUnplaced, unplaced.id)).toThrow(
      'not on a board',
    );
  });

  it('rejects moves that are not pawn promotions', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 7, column: 0 });
    const gs = mkSnapshot({ pieces: [pawn] });

    expect(() => PawnPromotionResolver.getMovedPieceIds(gs, Move.create({}))).toThrow(
      'not a Pawn promotion',
    );
    expect(() => PawnPromotionResolver.resolveToEffects(gs, Move.create({}))).toThrow(
      'not a Pawn promotion',
    );
  });

  it('guards against inconsistent moved piece resolution', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 7, column: 0 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const move = mkPawnPromotionMove(7, 0, ChessPieceKind.QUEEN);

    const emptySpy = vi.spyOn(PawnPromotionResolver, 'getMovedPieceIds').mockReturnValue([]);
    expect(() => PawnPromotionResolver.resolveToEffects(gs, move)).toThrow(
      'Pawn promotion should move exactly one piece',
    );
    emptySpy.mockRestore();

    const missingSpy = vi.spyOn(PawnPromotionResolver, 'getMovedPieceIds').mockReturnValue(['x']);
    expect(() => PawnPromotionResolver.resolveToEffects(gs, move)).toThrow(
      "could not find pawn piece with ID 'x'",
    );
    missingSpy.mockRestore();
  });
});
