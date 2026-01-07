import { describe, expect, it } from 'vitest';

import { BASE_MUTATORS, InvalidStateChangeError } from '@kaboom/engine/base/mutators';
import { writable } from '@kaboom/engine/base/types';
import { ChessColor, ChessPiece, ChessPieceKind, Effect_StateChange, Place } from '@kaboom/proto';

import { BOARD_ID, mkPiece, mkSnapshot } from './mutators_helpers';

const getPieceCapturedMutator = () => {
  const stateChange = Effect_StateChange.create({ pieceCaptured: { pieceId: 'p1' } });
  const mutator = BASE_MUTATORS.find((m) => m.applicable(stateChange));
  if (!mutator) {
    throw new Error('PieceCaptured mutator not found');
  }
  return mutator;
};

describe('PieceCapturedMutator', () => {
  it('matches only pieceCaptured state changes', () => {
    const captured = Effect_StateChange.create({ pieceCaptured: { pieceId: 'p1' } });
    const other = Effect_StateChange.create({ createFlag: {} });

    const mutator = getPieceCapturedMutator();
    expect(mutator.applicable(captured)).toBe(true);
    expect(mutator.applicable(other)).toBe(false);
  });

  it('marks the piece as captured and clears board position', () => {
    const mutator = getPieceCapturedMutator();
    const piece = mkPiece({ id: 'p1', row: 2, column: 2 });
    const gsw = writable(mkSnapshot({ pieces: [piece] }));
    const stateChange = Effect_StateChange.create({ pieceCaptured: { pieceId: 'p1' } });

    mutator.mutate(gsw, stateChange);

    const capturedPiece = gsw.pieces.find((p) => p.id === 'p1');
    expect(capturedPiece?.place?.boardPosition).toBeUndefined();
    expect(capturedPiece?.place?.captured).toBeDefined();
  });

  it('rejects missing piece IDs', () => {
    const mutator = getPieceCapturedMutator();
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({ pieceCaptured: {} });

    expect(() => mutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });

  it('rejects captures for missing pieces', () => {
    const mutator = getPieceCapturedMutator();
    const gsw = writable(mkSnapshot());
    const stateChange = Effect_StateChange.create({ pieceCaptured: { pieceId: 'missing' } });

    expect(() => mutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });

  it('rejects captures for pieces not on a board', () => {
    const mutator = getPieceCapturedMutator();
    const piece = ChessPiece.create({
      id: 'p1',
      kind: ChessPieceKind.PAWN,
      color: ChessColor.WHITE,
      place: Place.create({ boardId: BOARD_ID }),
    });
    const gsw = writable(mkSnapshot({ pieces: [piece] }));
    const stateChange = Effect_StateChange.create({ pieceCaptured: { pieceId: 'p1' } });

    expect(() => mutator.mutate(gsw, stateChange)).toThrow(InvalidStateChangeError);
  });
});
