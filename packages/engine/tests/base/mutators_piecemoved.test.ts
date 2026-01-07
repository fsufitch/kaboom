import { describe, expect, it } from 'vitest';

import { InvalidStateChangeError, PieceMovedMutator } from '@kaboom/engine/base/mutators';
import { writable } from '@kaboom/engine/base/types';
import { ChessColor, ChessPiece, ChessPieceKind, Effect_StateChange, Place } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './mutators_helpers';

describe('PieceMovedMutator', () => {
  it('matches only pieceMoved state changes', () => {
    const pieceMoved = Effect_StateChange.create({
      pieceMoved: { pieceId: 'p1', to: { row: 1, column: 2 } },
    });
    const other = Effect_StateChange.create({ pieceCaptured: { pieceId: 'p1' } });

    expect(PieceMovedMutator.applicable(pieceMoved)).toBe(true);
    expect(PieceMovedMutator.applicable(other)).toBe(false);
  });

  it('updates the piece board position', () => {
    const piece = mkPiece({ id: 'p1', row: 0, column: 0 });
    const gsw = writable(mkSnapshot({ pieces: [piece] }));
    const stateChange = Effect_StateChange.create({
      pieceMoved: { pieceId: 'p1', to: { row: 2, column: 3 } },
    });

    PieceMovedMutator.mutate(gsw, stateChange);

    const moved = gsw.pieces.find((p) => p.id === 'p1');
    expect(moved?.place?.boardPosition).toEqual({ row: 2, column: 3 });
  });

  it('rejects missing piece IDs', () => {
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({
      pieceMoved: { to: { row: 1, column: 1 } },
    });

    expect(() => PieceMovedMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });

  it('rejects missing destinations', () => {
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({ pieceMoved: { pieceId: 'p1' } });

    expect(() => PieceMovedMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });

  it('rejects moves for missing pieces', () => {
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({
      pieceMoved: { pieceId: 'missing', to: { row: 1, column: 1 } },
    });

    expect(() => PieceMovedMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });

  it('rejects moves for pieces not on a board', () => {
    const piece = ChessPiece.create({
      id: 'p1',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsw = writable(mkSnapshot({ pieces: [piece] }));
    const stateChange = Effect_StateChange.create({
      pieceMoved: { pieceId: 'p1', to: { row: 1, column: 1 } },
    });

    expect(() => PieceMovedMutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });
});
