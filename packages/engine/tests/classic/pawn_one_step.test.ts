import { describe, expect, it, vi } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { PawnOneStepMoveResolver } from '@kaboom/engine/classic/pawn_one_step';
import { ChessColor, ChessPiece, ChessPieceKind, Move, Place } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkPawnOneStepMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      pawn: {
        oneStep: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('PawnOneStepMoveResolver (classic)', () => {
  it('enumerates one-step moves when the forward square is empty', () => {
    const whitePawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 1, column: 3 });
    const blackPawn = mkPiece({ id: 'bp', color: ChessColor.BLACK, row: 6, column: 4 });
    const gs = mkSnapshot({ pieces: [whitePawn, blackPawn] });

    const whiteMoves = PawnOneStepMoveResolver.validMoves(gs, whitePawn.id);
    const blackMoves = PawnOneStepMoveResolver.validMoves(gs, blackPawn.id);

    expect(whiteMoves).toHaveLength(1);
    expect(blackMoves).toHaveLength(1);
    const [whiteMove] = whiteMoves;
    const [blackMove] = blackMoves;
    if (!whiteMove || !blackMove) {
      throw new Error('Expected pawn one-step moves to be present');
    }
    expect(movesEqual(whiteMove, mkPawnOneStepMove(1, 3, 2, 3))).toBe(true);
    expect(movesEqual(blackMove, mkPawnOneStepMove(6, 4, 5, 4))).toBe(true);
  });

  it('returns no moves when the forward square is blocked', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 1, column: 3 });
    const blocker = mkPiece({
      id: 'block',
      kind: ChessPieceKind.KNIGHT,
      color: ChessColor.BLACK,
      row: 2,
      column: 3,
    });
    const gs = mkSnapshot({ pieces: [pawn, blocker] });

    const moves = PawnOneStepMoveResolver.validMoves(gs, pawn.id);

    expect(moves).toHaveLength(0);
  });

  it('resolves a legal one-step move into a pieceMoved state change', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 1, column: 3 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const move = mkPawnOneStepMove(1, 3, 2, 3);

    const effects = PawnOneStepMoveResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(1);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(pawn.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 2, column: 3 });
  });

  it('throws IllegalMoveError for an illegal one-step move', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 1, column: 3 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const illegal = mkPawnOneStepMove(1, 3, 3, 3);

    expect(() => PawnOneStepMoveResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });

  it('validates invariant checks for pawn one-step moves', () => {
    expect(() => PawnOneStepMoveResolver.validMoves(mkSnapshot(), 'missing')).toThrow(
      "Piece with ID 'missing' does not exist",
    );

    const rook = mkPiece({ id: 'rook', kind: ChessPieceKind.ROOK, row: 1, column: 3 });
    const gsWrong = mkSnapshot({ pieces: [rook] });
    expect(() => PawnOneStepMoveResolver.validMoves(gsWrong, rook.id)).toThrow('not a Pawn');

    const unplaced = ChessPiece.create({
      id: 'p1',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsUnplaced = mkSnapshot({ pieces: [unplaced] });
    expect(() => PawnOneStepMoveResolver.validMoves(gsUnplaced, unplaced.id)).toThrow(
      'not on a board',
    );

    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 1, column: 1 });
    const gsPawn = mkSnapshot({ pieces: [pawn] });
    const badBoardMove = Move.create({
      classicMove: {
        pawn: {
          oneStep: {
            from: { boardId: 'unknown', boardPosition: { row: 1, column: 1 } },
            to: { boardId: 'unknown', boardPosition: { row: 2, column: 1 } },
          },
        },
      },
    });
    expect(() => PawnOneStepMoveResolver.getMovedPieceIds(gsPawn, badBoardMove)).toThrow(
      "unknown board ID 'unknown'",
    );

    const missingBoardIdMove = Move.create({
      classicMove: {
        pawn: {
          oneStep: {
            from: { boardPosition: { row: 1, column: 1 } },
            to: { boardId: BOARD_ID, boardPosition: { row: 2, column: 1 } },
          },
        },
      },
    });
    expect(() => PawnOneStepMoveResolver.getMovedPieceIds(gsPawn, missingBoardIdMove)).toThrow(
      "unknown board ID ''",
    );

    const emptyMove = mkPawnOneStepMove(1, 1, 2, 1);
    expect(() => PawnOneStepMoveResolver.getMovedPieceIds(mkSnapshot(), emptyMove)).toThrow(
      'no piece at position',
    );
  });

  it('rejects non-pawn moves and out-of-bounds one-step attempts', () => {
    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 7, column: 0 });
    const gs = mkSnapshot({ pieces: [pawn] });

    expect(PawnOneStepMoveResolver.validMoves(gs, pawn.id)).toHaveLength(0);

    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 1, column: 1 });
    const gsWrong = mkSnapshot({ pieces: [rook] });
    const move = mkPawnOneStepMove(1, 1, 2, 1);
    expect(() => PawnOneStepMoveResolver.resolveToEffects(gsWrong, move)).toThrow(
      'piece at origin is not a Pawn',
    );
  });

  it('rejects moves that are not pawn one-step shapes', () => {
    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 1, column: 1 });
    const gs = mkSnapshot({ pieces: [pawn] });

    expect(() => PawnOneStepMoveResolver.getMovedPieceIds(gs, Move.create({}))).toThrow(
      'not a Pawn one-step move',
    );
    expect(() => PawnOneStepMoveResolver.resolveToEffects(gs, Move.create({}))).toThrow(
      'not a Pawn one-step move',
    );
  });

  it('guards against inconsistent moved piece resolution', () => {
    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 1, column: 1 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const move = mkPawnOneStepMove(1, 1, 2, 1);

    const emptySpy = vi.spyOn(PawnOneStepMoveResolver, 'getMovedPieceIds').mockReturnValue([]);
    expect(() => PawnOneStepMoveResolver.resolveToEffects(gs, move)).toThrow(
      'Pawn one-step should move exactly one piece',
    );
    emptySpy.mockRestore();

    const missingSpy = vi
      .spyOn(PawnOneStepMoveResolver, 'getMovedPieceIds')
      .mockReturnValue(['missing']);
    expect(() => PawnOneStepMoveResolver.resolveToEffects(gs, move)).toThrow(
      "could not find pawn piece with ID 'missing'",
    );
    missingSpy.mockRestore();
  });
});
