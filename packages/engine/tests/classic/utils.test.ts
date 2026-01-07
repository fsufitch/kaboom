import { describe, expect, it } from 'vitest';

import { newReadonlyArray } from '@kaboom/engine/base';
import { getClassicBoard, pieceMovedThisGame } from '@kaboom/engine/classic/utils';
import { Effect, Effect_StateChange } from '@kaboom/proto';

import { mkBoard, mkExecutedTurn, mkSnapshot } from './helpers';

describe('classic utils', () => {
  it('returns the single classic board', () => {
    const board = mkBoard();
    const gs = mkSnapshot({ boards: [board] });

    expect(getClassicBoard(gs).id).toBe(board.id);
  });

  it('throws when there is not exactly one board', () => {
    const boardA = mkBoard({ id: 'board-a' });
    const boardB = mkBoard({ id: 'board-b' });
    const gs = mkSnapshot({ boards: [boardA, boardB] });

    expect(() => getClassicBoard(gs)).toThrow('Expected exactly one board');
  });

  it('throws when there are no boards', () => {
    const gs = mkSnapshot({ boards: [] });

    expect(() => getClassicBoard(gs)).toThrow('Expected exactly one board');
  });

  it('detects when a piece moved earlier in the game', () => {
    const movedTurn = mkExecutedTurn({
      effects: [
        Effect.create({
          stateChanges: newReadonlyArray(
            Effect_StateChange.create({
              pieceMoved: { pieceId: 'p1', to: { row: 1, column: 2 } },
            }),
          ),
        }),
      ],
    });
    const gs = mkSnapshot({ turnHistory: [movedTurn] });

    expect(pieceMovedThisGame(gs, 'p1')).toBe(true);
    expect(pieceMovedThisGame(gs, 'p2')).toBe(false);
  });

  it('matches piece movement across multiple turns', () => {
    const firstTurn = mkExecutedTurn({
      id: 'turn-1',
      effects: [
        Effect.create({
          stateChanges: newReadonlyArray(
            Effect_StateChange.create({
              pieceMoved: { pieceId: 'p2', to: { row: 3, column: 3 } },
            }),
          ),
        }),
      ],
    });
    const secondTurn = mkExecutedTurn({
      id: 'turn-2',
      effects: [
        Effect.create({
          stateChanges: newReadonlyArray(
            Effect_StateChange.create({
              pieceMoved: { pieceId: 'p3', to: { row: 4, column: 4 } },
            }),
          ),
        }),
      ],
    });

    const gs = mkSnapshot({ turnHistory: [firstTurn, secondTurn] });

    expect(pieceMovedThisGame(gs, 'p2')).toBe(true);
    expect(pieceMovedThisGame(gs, 'p3')).toBe(true);
  });

  it('treats a captured piece as having moved this game', () => {
    const capturedTurn = mkExecutedTurn({
      effects: [
        Effect.create({
          stateChanges: newReadonlyArray(
            Effect_StateChange.create({
              pieceCaptured: { pieceId: 'p9' },
            }),
          ),
        }),
      ],
    });
    const gs = mkSnapshot({ turnHistory: [capturedTurn] });

    expect(pieceMovedThisGame(gs, 'p9')).toBe(true);
  });

  it('returns false when the piece never appears in history', () => {
    const gs = mkSnapshot();

    expect(pieceMovedThisGame(gs, 'missing')).toBe(false);
  });
});
