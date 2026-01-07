import { describe, expect, it, vi } from 'vitest';

import { IllegalMoveError, movesEqual } from '@kaboom/engine/base';
import { KnightMoveResolver } from '@kaboom/engine/classic/knight_move';
import { ChessColor, ChessPiece, ChessPieceKind, Move, Place } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './helpers';

const mkKnightMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Move =>
  Move.create({
    classicMove: {
      knight: {
        move: {
          from: { boardId: BOARD_ID, boardPosition: { row: fromRow, column: fromCol } },
          to: { boardId: BOARD_ID, boardPosition: { row: toRow, column: toCol } },
        },
      },
    },
  });

describe('KnightMoveResolver (classic)', () => {
  it('enumerates L-shaped moves to empty squares only', () => {
    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 3, column: 3 });
    const friendly = mkPiece({
      id: 'block',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      row: 5,
      column: 4,
    });
    const enemy = mkPiece({
      id: 'enemy',
      kind: ChessPieceKind.BISHOP,
      color: ChessColor.BLACK,
      row: 2,
      column: 1,
    });

    const gs = mkSnapshot({ pieces: [knight, friendly, enemy] });

    const moves = KnightMoveResolver.validMoves(gs, knight.id);

    const expected = [
      mkKnightMove(3, 3, 5, 2),
      mkKnightMove(3, 3, 1, 4),
      mkKnightMove(3, 3, 1, 2),
      mkKnightMove(3, 3, 4, 5),
      mkKnightMove(3, 3, 4, 1),
      mkKnightMove(3, 3, 2, 5),
    ];

    expect(moves).toHaveLength(6);
    for (const e of expected) {
      expect(moves.some((m) => movesEqual(m, e))).toBe(true);
    }

    expect(moves.some((m) => movesEqual(m, mkKnightMove(3, 3, 5, 4)))).toBe(false);
    expect(moves.some((m) => movesEqual(m, mkKnightMove(3, 3, 2, 1)))).toBe(false);
  });

  it('skips off-board destinations from a corner', () => {
    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 0, column: 0 });
    const gs = mkSnapshot({ pieces: [knight] });

    const moves = KnightMoveResolver.validMoves(gs, knight.id);

    const expected = [mkKnightMove(0, 0, 1, 2), mkKnightMove(0, 0, 2, 1)];
    expect(moves).toHaveLength(2);
    for (const e of expected) {
      expect(moves.some((m) => movesEqual(m, e))).toBe(true);
    }
  });

  it('resolves a legal knight move into pieceMoved', () => {
    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [knight] });
    const move = mkKnightMove(3, 3, 5, 2);

    const effects = KnightMoveResolver.resolveToEffects(gs, move);

    expect(effects).toHaveLength(1);
    const effect = effects[0];
    expect(effect?.stateChanges).toHaveLength(1);
    expect(effect?.stateChanges[0]?.pieceMoved?.pieceId).toBe(knight.id);
    expect(effect?.stateChanges[0]?.pieceMoved?.to).toEqual({ row: 5, column: 2 });
  });

  it('throws IllegalMoveError for an illegal knight move', () => {
    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 3, column: 3 });
    const gs = mkSnapshot({ pieces: [knight] });
    const illegal = mkKnightMove(3, 3, 3, 4);

    expect(() => KnightMoveResolver.resolveToEffects(gs, illegal)).toThrow(IllegalMoveError);
  });

  it('validates invariant checks for knight moves', () => {
    expect(() => KnightMoveResolver.validMoves(mkSnapshot(), 'missing')).toThrow(
      "Piece with ID 'missing' does not exist",
    );

    const unplaced = ChessPiece.create({
      id: 'wn-unplaced',
      kind: ChessPieceKind.KNIGHT,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsUnplaced = mkSnapshot({ pieces: [unplaced] });
    expect(() => KnightMoveResolver.validMoves(gsUnplaced, unplaced.id)).toThrow('not on a board');

    const pawn = mkPiece({ id: 'wp', kind: ChessPieceKind.PAWN, row: 3, column: 3 });
    const gsWrong = mkSnapshot({ pieces: [pawn] });
    expect(() => KnightMoveResolver.validMoves(gsWrong, pawn.id)).toThrow('not a Knight');

    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 2, column: 2 });
    const gsKnight = mkSnapshot({ pieces: [knight] });
    const badBoardMove = Move.create({
      classicMove: {
        knight: {
          move: {
            from: { boardId: 'unknown', boardPosition: { row: 2, column: 2 } },
            to: { boardId: 'unknown', boardPosition: { row: 3, column: 4 } },
          },
        },
      },
    });
    expect(() => KnightMoveResolver.getMovedPieceIds(gsKnight, badBoardMove)).toThrow(
      "unknown board ID 'unknown'",
    );

    const missingBoardIdMove = Move.create({
      classicMove: {
        knight: {
          move: {
            from: { boardPosition: { row: 2, column: 2 } },
            to: { boardId: BOARD_ID, boardPosition: { row: 3, column: 4 } },
          },
        },
      },
    });
    expect(() => KnightMoveResolver.getMovedPieceIds(gsKnight, missingBoardIdMove)).toThrow(
      "unknown board ID ''",
    );

    const emptyMove = mkKnightMove(2, 2, 3, 4);
    expect(() => KnightMoveResolver.getMovedPieceIds(mkSnapshot(), emptyMove)).toThrow(
      'no piece at position',
    );
  });

  it('rejects moves that are not knight moves', () => {
    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 2, column: 2 });
    const gs = mkSnapshot({ pieces: [knight] });

    expect(() => KnightMoveResolver.getMovedPieceIds(gs, Move.create({}))).toThrow(
      'not a Knight move',
    );
    expect(() => KnightMoveResolver.resolveToEffects(gs, Move.create({}))).toThrow(
      'not a Knight move',
    );

    const bishop = mkPiece({ id: 'wb', kind: ChessPieceKind.BISHOP, row: 2, column: 2 });
    const gsWrong = mkSnapshot({ pieces: [bishop] });
    const move = mkKnightMove(2, 2, 3, 4);
    expect(() => KnightMoveResolver.resolveToEffects(gsWrong, move)).toThrow('not a Knight');
  });

  it('guards against inconsistent moved piece resolution', () => {
    const knight = mkPiece({ id: 'wn', kind: ChessPieceKind.KNIGHT, row: 2, column: 2 });
    const gs = mkSnapshot({ pieces: [knight] });
    const move = mkKnightMove(2, 2, 3, 4);

    const emptySpy = vi.spyOn(KnightMoveResolver, 'getMovedPieceIds').mockReturnValue([]);
    expect(() => KnightMoveResolver.resolveToEffects(gs, move)).toThrow(
      'Knight move should move exactly one piece',
    );
    emptySpy.mockRestore();

    const missingSpy = vi.spyOn(KnightMoveResolver, 'getMovedPieceIds').mockReturnValue(['x']);
    expect(() => KnightMoveResolver.resolveToEffects(gs, move)).toThrow(
      "could not find knight piece with ID 'x'",
    );
    missingSpy.mockRestore();
  });
});
