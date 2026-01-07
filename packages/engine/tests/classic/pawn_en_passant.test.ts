import { describe, expect, it, vi } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { PawnEnPassantResolver } from '@kaboom/engine/classic/pawn_en_passant';
import { ChessColor, ChessPiece, ChessPieceKind, Move, Place } from '@kaboom/proto';

import { BOARD_ID, mkExecutedTurn, mkPiece, mkSnapshot } from './helpers';

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

const mkPawnEnPassantMove = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): Move =>
  Move.create({
    classicMove: {
      pawn: {
        enPassant: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('PawnEnPassantResolver (classic)', () => {
  it('enumerates en passant when the last move was an adjacent pawn two-step', () => {
    const whitePawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 4, column: 4 });
    const blackPawn = mkPiece({ id: 'bp', color: ChessColor.BLACK, row: 4, column: 5 });
    const lastMove = mkPawnTwoStepMove(6, 5, 4, 5);
    const lastTurn = mkExecutedTurn({ moves: [lastMove] });

    const gs = mkSnapshot({ pieces: [whitePawn, blackPawn], turnHistory: [lastTurn] });

    const moves = PawnEnPassantResolver.validMoves(gs, whitePawn.id);

    expect(moves).toHaveLength(1);
    const [move] = moves;
    if (!move) {
      throw new Error('Expected en passant move to be present');
    }
    expect(movesEqual(move, mkPawnEnPassantMove(4, 4, 5, 5))).toBe(true);
  });

  it('skips out-of-bounds en passant targets at the edge', () => {
    const whitePawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 4, column: 0 });
    const blackPawn = mkPiece({ id: 'bp', color: ChessColor.BLACK, row: 4, column: 1 });
    const lastMove = mkPawnTwoStepMove(6, 1, 4, 1);
    const lastTurn = mkExecutedTurn({ moves: [lastMove] });

    const gs = mkSnapshot({ pieces: [whitePawn, blackPawn], turnHistory: [lastTurn] });

    const moves = PawnEnPassantResolver.validMoves(gs, whitePawn.id);

    expect(moves).toHaveLength(1);
    expect(moves.some((m) => movesEqual(m, mkPawnEnPassantMove(4, 0, 5, 1)))).toBe(true);
  });

  it('resolves a legal en passant capture into pieceMoved + pieceCaptured', () => {
    const whitePawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 4, column: 4 });
    const blackPawn = mkPiece({ id: 'bp', color: ChessColor.BLACK, row: 4, column: 5 });
    const lastMove = mkPawnTwoStepMove(6, 5, 4, 5);
    const lastTurn = mkExecutedTurn({ moves: [lastMove] });

    const gs = mkSnapshot({ pieces: [whitePawn, blackPawn], turnHistory: [lastTurn] });
    const move = mkPawnEnPassantMove(4, 4, 5, 5);

    const effects = PawnEnPassantResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(2);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(whitePawn.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 5, column: 5 });
    expect(effect?.stateChanges[1]?.pieceCaptured?.pieceId).toBe(blackPawn.id);
  });

  it('throws IllegalMoveError when en passant is not legal', () => {
    const whitePawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 4, column: 4 });
    const blackPawn = mkPiece({
      id: 'bp',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.BLACK,
      row: 4,
      column: 5,
    });
    const lastTurn = mkExecutedTurn({ moves: [] });
    const gs = mkSnapshot({ pieces: [whitePawn, blackPawn], turnHistory: [lastTurn] });
    const illegal = mkPawnEnPassantMove(4, 4, 5, 5);

    expect(() => PawnEnPassantResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });

  it('validates invariant checks for en passant moves', () => {
    expect(() => PawnEnPassantResolver.validMoves(mkSnapshot(), 'missing')).toThrow(
      "Piece with ID 'missing' does not exist",
    );

    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 3, column: 3 });
    const gsWrongKind = mkSnapshot({ pieces: [rook] });
    expect(() => PawnEnPassantResolver.validMoves(gsWrongKind, rook.id)).toThrow('not a Pawn');

    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 3, column: 3 });
    const gsPawn = mkSnapshot({ pieces: [pawn] });
    const missingFrom = Move.create({
      classicMove: {
        pawn: {
          enPassant: {
            from: { boardId: BOARD_ID },
            to: { boardId: BOARD_ID, boardPosition: { row: 4, column: 4 } },
          },
        },
      },
    });
    expect(() => PawnEnPassantResolver.getMovedPieceIds(gsPawn, missingFrom)).toThrow(
      IllegalMoveError,
    );

    const missingTo = Move.create({
      classicMove: {
        pawn: {
          enPassant: {
            from: { boardId: BOARD_ID, boardPosition: { row: 3, column: 3 } },
            to: { boardId: BOARD_ID },
          },
        },
      },
    });
    expect(() => PawnEnPassantResolver.getMovedPieceIds(gsPawn, missingTo)).toThrow(
      IllegalMoveError,
    );

    const boardMismatch = Move.create({
      classicMove: {
        pawn: {
          enPassant: {
            from: { boardId: BOARD_ID, boardPosition: { row: 3, column: 3 } },
            to: { boardId: 'other', boardPosition: { row: 4, column: 4 } },
          },
        },
      },
    });
    expect(() => PawnEnPassantResolver.getMovedPieceIds(gsPawn, boardMismatch)).toThrow(
      IllegalMoveError,
    );

    const missingBoardIdMove = Move.create({
      classicMove: {
        pawn: {
          enPassant: {
            from: { boardPosition: { row: 3, column: 3 } },
            to: { boardPosition: { row: 4, column: 4 } },
          },
        },
      },
    });
    expect(() => PawnEnPassantResolver.getMovedPieceIds(gsPawn, missingBoardIdMove)).toThrow(
      "unknown board ID ''",
    );

    const emptyOrigin = mkPawnEnPassantMove(3, 3, 4, 4);
    expect(() => PawnEnPassantResolver.getMovedPieceIds(mkSnapshot(), emptyOrigin)).toThrow(
      'no piece at position',
    );

    const unplaced = ChessPiece.create({
      id: 'p1',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsUnplaced = mkSnapshot({ pieces: [unplaced] });
    expect(() => PawnEnPassantResolver.validMoves(gsUnplaced, unplaced.id)).toThrow(
      'not on a board',
    );
  });

  it('returns no en passant moves for ineligible board state', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 4, column: 4 });
    const enemy = mkPiece({ id: 'bp', color: ChessColor.BLACK, row: 4, column: 5 });

    const noHistory = mkSnapshot({ pieces: [pawn, enemy], turnHistory: [] });
    expect(PawnEnPassantResolver.validMoves(noHistory, pawn.id)).toHaveLength(0);

    const occupiedTarget = mkPiece({
      id: 'block',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.BLACK,
      row: 5,
      column: 5,
    });
    const lastMove = mkPawnTwoStepMove(6, 5, 4, 5);
    const lastTurn = mkExecutedTurn({ moves: [lastMove] });
    const blocked = mkSnapshot({ pieces: [pawn, enemy, occupiedTarget], turnHistory: [lastTurn] });
    expect(PawnEnPassantResolver.validMoves(blocked, pawn.id)).toHaveLength(0);

    const friendlyAdjacent = mkPiece({ id: 'wp2', color: ChessColor.WHITE, row: 4, column: 3 });
    const friendlySnapshot = mkSnapshot({
      pieces: [pawn, friendlyAdjacent],
      turnHistory: [lastTurn],
    });
    expect(PawnEnPassantResolver.validMoves(friendlySnapshot, pawn.id)).toHaveLength(0);

    const nonPawnAdjacent = mkPiece({
      id: 'block',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.BLACK,
      row: 4,
      column: 5,
    });
    const nonPawnSnapshot = mkSnapshot({
      pieces: [pawn, nonPawnAdjacent],
      turnHistory: [lastTurn],
    });
    expect(PawnEnPassantResolver.validMoves(nonPawnSnapshot, pawn.id)).toHaveLength(0);
  });

  it('handles missing origin positions after board lookup', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const move = Move.create({
      classicMove: {
        pawn: {
          enPassant: {
            from: { boardId: BOARD_ID },
            to: { boardId: BOARD_ID, boardPosition: { row: 4, column: 4 } },
          },
        },
      },
    });

    expect(() => PawnEnPassantResolver.getMovedPieceIds(gs, move)).toThrow(IllegalMoveError);
  });

  it('ignores last moves that are not valid two-step pawn moves', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 4, column: 4 });
    const enemy = mkPiece({ id: 'bp', color: ChessColor.BLACK, row: 4, column: 5 });

    const wrongBoardMove = Move.create({
      classicMove: {
        pawn: {
          twoStep: {
            from: { boardId: 'other', boardPosition: { row: 6, column: 5 } },
            to: { boardId: 'other', boardPosition: { row: 4, column: 5 } },
          },
        },
      },
    });
    const wrongBoardTurn = mkExecutedTurn({ moves: [wrongBoardMove] });
    const wrongBoardSnapshot = mkSnapshot({
      pieces: [pawn, enemy],
      turnHistory: [wrongBoardTurn],
    });
    expect(PawnEnPassantResolver.validMoves(wrongBoardSnapshot, pawn.id)).toHaveLength(0);

    const missingPositionsMove = Move.create({
      classicMove: {
        pawn: {
          twoStep: {
            from: { boardId: BOARD_ID },
            to: { boardId: BOARD_ID },
          },
        },
      },
    });
    const missingPositionsTurn = mkExecutedTurn({ moves: [missingPositionsMove] });
    const missingPositionsSnapshot = mkSnapshot({
      pieces: [pawn, enemy],
      turnHistory: [missingPositionsTurn],
    });
    expect(PawnEnPassantResolver.validMoves(missingPositionsSnapshot, pawn.id)).toHaveLength(0);

    const notTwoStep = Move.create({
      classicMove: {
        pawn: {
          oneStep: {
            from: { boardId: BOARD_ID, boardPosition: { row: 6, column: 5 } },
            to: { boardId: BOARD_ID, boardPosition: { row: 5, column: 5 } },
          },
        },
      },
    });
    const notTwoStepTurn = mkExecutedTurn({ moves: [notTwoStep] });
    const notTwoStepSnapshot = mkSnapshot({
      pieces: [pawn, enemy],
      turnHistory: [notTwoStepTurn],
    });
    expect(PawnEnPassantResolver.validMoves(notTwoStepSnapshot, pawn.id)).toHaveLength(0);
  });

  it('rejects moves that are not en passant captures', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 4, column: 4 });
    const gs = mkSnapshot({ pieces: [pawn] });

    expect(() => PawnEnPassantResolver.getMovedPieceIds(gs, Move.create({}))).toThrow(
      'not a Pawn en passant move',
    );
    expect(() => PawnEnPassantResolver.resolveToEffects(gs, Move.create({}))).toThrow(
      'not a Pawn en passant move',
    );
  });

  it('guards against inconsistent moved piece resolution and capture targets', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 4, column: 4 });
    const gs = mkSnapshot({ pieces: [pawn] });
    const move = mkPawnEnPassantMove(4, 4, 5, 5);

    const emptySpy = vi.spyOn(PawnEnPassantResolver, 'getMovedPieceIds').mockReturnValue([]);
    expect(() => PawnEnPassantResolver.resolveToEffects(gs, move)).toThrow(
      'Pawn en passant should move exactly one piece',
    );
    emptySpy.mockRestore();

    const missingSpy = vi.spyOn(PawnEnPassantResolver, 'getMovedPieceIds').mockReturnValue(['x']);
    expect(() => PawnEnPassantResolver.resolveToEffects(gs, move)).toThrow(
      "could not find pawn piece with ID 'x'",
    );
    missingSpy.mockRestore();

    const validSpy = vi.spyOn(PawnEnPassantResolver, 'validMoves').mockReturnValue([move]);
    const movedSpy = vi.spyOn(PawnEnPassantResolver, 'getMovedPieceIds').mockReturnValue([pawn.id]);
    expect(() => PawnEnPassantResolver.resolveToEffects(gs, move)).toThrow(
      'No pawn to capture en passant',
    );
    movedSpy.mockRestore();
    validSpy.mockRestore();

    const friendly = mkPiece({ id: 'wp2', color: ChessColor.WHITE, row: 4, column: 5 });
    const gsFriendly = mkSnapshot({ pieces: [pawn, friendly] });
    const validSpy2 = vi.spyOn(PawnEnPassantResolver, 'validMoves').mockReturnValue([move]);
    const movedSpy2 = vi
      .spyOn(PawnEnPassantResolver, 'getMovedPieceIds')
      .mockReturnValue([pawn.id]);
    expect(() => PawnEnPassantResolver.resolveToEffects(gsFriendly, move)).toThrow(
      'Cannot capture own piece en passant',
    );
    movedSpy2.mockRestore();
    validSpy2.mockRestore();
  });

  it('rejects malformed en passant moves in resolveToEffects', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 4, column: 4 });
    const gs = mkSnapshot({ pieces: [pawn] });

    const missingFrom = Move.create({
      classicMove: {
        pawn: {
          enPassant: {
            from: { boardId: BOARD_ID },
            to: { boardId: BOARD_ID, boardPosition: { row: 5, column: 5 } },
          },
        },
      },
    });
    expect(() => PawnEnPassantResolver.resolveToEffects(gs, missingFrom)).toThrow(IllegalMoveError);

    const missingTo = Move.create({
      classicMove: {
        pawn: {
          enPassant: {
            from: { boardId: BOARD_ID, boardPosition: { row: 4, column: 4 } },
            to: { boardId: BOARD_ID },
          },
        },
      },
    });
    expect(() => PawnEnPassantResolver.resolveToEffects(gs, missingTo)).toThrow(IllegalMoveError);

    const mismatch = Move.create({
      classicMove: {
        pawn: {
          enPassant: {
            from: { boardId: BOARD_ID, boardPosition: { row: 4, column: 4 } },
            to: { boardId: 'other', boardPosition: { row: 5, column: 5 } },
          },
        },
      },
    });
    expect(() => PawnEnPassantResolver.resolveToEffects(gs, mismatch)).toThrow(IllegalMoveError);
  });

  it('rejects en passant moves when the origin is not a pawn', () => {
    const rook = mkPiece({ id: 'wr', kind: ChessPieceKind.ROOK, row: 4, column: 4 });
    const gs = mkSnapshot({ pieces: [rook] });
    const move = mkPawnEnPassantMove(4, 4, 5, 5);

    expect(() => PawnEnPassantResolver.resolveToEffects(gs, move)).toThrow(
      'piece at origin is not a Pawn',
    );
  });

  it('handles snapshots with missing turnHistory and missing target board IDs', () => {
    const pawn = mkPiece({ id: 'wp', color: ChessColor.WHITE, row: 4, column: 4 });
    const gs = mkSnapshot({ pieces: [pawn] });
    (gs as { turnHistory?: unknown }).turnHistory = undefined;

    expect(PawnEnPassantResolver.validMoves(gs, pawn.id)).toHaveLength(0);

    const move = Move.create({
      classicMove: {
        pawn: {
          enPassant: {
            from: { boardPosition: { row: 4, column: 4 } },
            to: { boardPosition: { row: 5, column: 5 } },
          },
        },
      },
    });
    const validSpy = vi.spyOn(PawnEnPassantResolver, 'validMoves').mockReturnValue([move]);
    const movedSpy = vi.spyOn(PawnEnPassantResolver, 'getMovedPieceIds').mockReturnValue([pawn.id]);
    expect(() => PawnEnPassantResolver.resolveToEffects(gs, move)).toThrow(
      'No pawn to capture en passant',
    );
    movedSpy.mockRestore();
    validSpy.mockRestore();
  });
});
