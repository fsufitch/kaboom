import { describe, expect, it, vi } from 'vitest';

import { IllegalMoveError, movesEqual, newReadonlyArray } from '@kaboom/engine/base';
import { PawnTwoStepMoveResolver } from '@kaboom/engine/classic/pawn_two_step';
import { ChessColor, ChessPiece, ChessPieceKind, Effect, Move, Place } from '@kaboom/proto';

import { BOARD_ID, mkBoard, mkExecutedTurn, mkPiece, mkSnapshot } from './helpers';

const mkPawnTwoStepMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      pawn: {
        twoStep: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('PawnTwoStepMoveResolver (classic)', () => {
  it('allows a two-step move from the home row when the path is clear', () => {
    const whitePawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 1, column: 3 });
    const blackPawn = mkPiece({ id: 'bp', color: ChessColor.BLACK, row: 6, column: 4 });
    const gs = mkSnapshot({ pieces: [whitePawn, blackPawn] });

    const whiteMoves = PawnTwoStepMoveResolver.validMoves(gs, whitePawn.id);
    const blackMoves = PawnTwoStepMoveResolver.validMoves(gs, blackPawn.id);

    expect(whiteMoves).toHaveLength(1);
    expect(blackMoves).toHaveLength(1);
    const [whiteMove] = whiteMoves;
    const [blackMove] = blackMoves;
    if (!whiteMove || !blackMove) {
      throw new Error('Expected pawn two-step moves to be present');
    }
    expect(movesEqual(whiteMove, mkPawnTwoStepMove(1, 3, 3, 3))).toBe(true);
    expect(movesEqual(blackMove, mkPawnTwoStepMove(6, 4, 4, 4))).toBe(true);
  });

  it('returns no moves when the pawn has moved or the path is blocked', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 1, column: 3 });
    const blocker = mkPiece({
      id: 'block',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.BLACK,
      row: 2,
      column: 3,
    });
    const blockedSnapshot = mkSnapshot({ pieces: [pawn, blocker] });

    expect(PawnTwoStepMoveResolver.validMoves(blockedSnapshot, pawn.id)).toHaveLength(0);

    const movedEffect = Effect.create({
      stateChanges: newReadonlyArray({
        pieceMoved: { pieceId: pawn.id, to: { row: 2, column: 3 } },
      }),
    });
    const turnHistory = [mkExecutedTurn({ effects: [movedEffect] })];
    const movedSnapshot = mkSnapshot({ pieces: [pawn], turnHistory });

    expect(PawnTwoStepMoveResolver.validMoves(movedSnapshot, pawn.id)).toHaveLength(0);
  });

  it('resolves a legal two-step move into a pieceMoved state change', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 1, column: 3 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const move = mkPawnTwoStepMove(1, 3, 3, 3);

    const effects = PawnTwoStepMoveResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(1);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(pawn.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 3, column: 3 });
  });

  it('throws IllegalMoveError for an illegal two-step move', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 2, column: 3 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const illegal = mkPawnTwoStepMove(2, 3, 4, 3);

    expect(() => PawnTwoStepMoveResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });

  it('validates invariant checks for pawn two-step moves', () => {
    expect(() => PawnTwoStepMoveResolver.validMoves(mkSnapshot(), 'missing')).toThrow(
      "Piece with ID 'missing' does not exist",
    );

    const rook = mkPiece({ id: 'rook', kind: ChessPieceKind.ROOK, row: 1, column: 3 });
    const gsWrong = mkSnapshot({ pieces: [rook] });
    expect(() => PawnTwoStepMoveResolver.validMoves(gsWrong, rook.id)).toThrow('not a Pawn');

    const unplaced = ChessPiece.create({
      id: 'p1',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsUnplaced = mkSnapshot({ pieces: [unplaced] });
    expect(() => PawnTwoStepMoveResolver.validMoves(gsUnplaced, unplaced.id)).toThrow(
      'not on a board',
    );

    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 1, column: 1 });
    const gsPawn = mkSnapshot({ pieces: [pawn] });
    const badBoardMove = Move.create({
      classicMove: {
        pawn: {
          twoStep: {
            from: { boardId: 'unknown', boardPosition: { row: 1, column: 1 } },
            to: { boardId: 'unknown', boardPosition: { row: 3, column: 1 } },
          },
        },
      },
    });
    expect(() => PawnTwoStepMoveResolver.getMovedPieceIds(gsPawn, badBoardMove)).toThrow(
      "unknown board ID 'unknown'",
    );

    const missingBoardIdMove = Move.create({
      classicMove: {
        pawn: {
          twoStep: {
            from: { boardPosition: { row: 1, column: 1 } },
            to: { boardId: BOARD_ID, boardPosition: { row: 3, column: 1 } },
          },
        },
      },
    });
    expect(() => PawnTwoStepMoveResolver.getMovedPieceIds(gsPawn, missingBoardIdMove)).toThrow(
      "unknown board ID ''",
    );

    const emptyMove = mkPawnTwoStepMove(1, 1, 3, 1);
    expect(() => PawnTwoStepMoveResolver.getMovedPieceIds(mkSnapshot(), emptyMove)).toThrow(
      'no piece at position',
    );
  });

  it('returns no moves when not on the home row or two-step is blocked', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 2, column: 3 });
    const gsNotHome = mkSnapshot({ pieces: [pawn] });
    expect(PawnTwoStepMoveResolver.validMoves(gsNotHome, pawn.id)).toHaveLength(0);

    const pawnHome = mkPiece({ id: 'wp-home', color: ChessColor.WHITE, row: 1, column: 3 });
    const twoStepBlock = mkPiece({
      id: 'block-two',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.BLACK,
      row: 3,
      column: 3,
    });
    const gsBlocked = mkSnapshot({ pieces: [pawnHome, twoStepBlock] });
    expect(PawnTwoStepMoveResolver.validMoves(gsBlocked, pawnHome.id)).toHaveLength(0);
  });

  it('returns no moves when the two-step target is out of bounds', () => {
    const board = mkBoard({ rows: 3, columns: 8 });
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 1, column: 0 });
    const gs = mkSnapshot({ boards: [board], pieces: [pawn] });

    expect(PawnTwoStepMoveResolver.validMoves(gs, pawn.id)).toHaveLength(0);
  });

  it('rejects non-pawn two-step moves', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 1, column: 1 });
    const gs = mkSnapshot({ pieces: [pawn] });

    expect(() => PawnTwoStepMoveResolver.getMovedPieceIds(gs, Move.create({}))).toThrow(
      'not a Pawn two-step move',
    );
    expect(() => PawnTwoStepMoveResolver.resolveToEffects(gs, Move.create({}))).toThrow(
      'not a Pawn two-step move',
    );

    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 1, column: 1 });
    const gsWrong = mkSnapshot({ pieces: [rook] });
    const move = mkPawnTwoStepMove(1, 1, 3, 1);
    expect(() => PawnTwoStepMoveResolver.resolveToEffects(gsWrong, move)).toThrow(
      'piece at origin is not a Pawn',
    );
  });

  it('guards against inconsistent moved piece resolution', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 1, column: 1 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const move = mkPawnTwoStepMove(1, 1, 3, 1);

    const emptySpy = vi.spyOn(PawnTwoStepMoveResolver, 'getMovedPieceIds').mockReturnValue([]);
    expect(() => PawnTwoStepMoveResolver.resolveToEffects(gs, move)).toThrow(
      'Pawn two-step should move exactly one piece',
    );
    emptySpy.mockRestore();

    const missingSpy = vi
      .spyOn(PawnTwoStepMoveResolver, 'getMovedPieceIds')
      .mockReturnValue(['missing']);
    expect(() => PawnTwoStepMoveResolver.resolveToEffects(gs, move)).toThrow(
      "could not find pawn piece with ID 'missing'",
    );
    missingSpy.mockRestore();
  });
});
