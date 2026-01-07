import { describe, expect, it } from 'vitest';

import {
  ChessDirectionVectors,
  KnightDirectionVectors,
  SmartVector,
} from '@kaboom/engine/base/vector';
import { ChessColor } from '@kaboom/proto';

import { mkBoard } from './mutators_helpers';

describe('SmartVector', () => {
  it('exposes row/column and returns a cloned vector', () => {
    const base = { row: 2, column: 3 };
    const vec = new SmartVector(base);

    expect(vec.row).toBe(2);
    expect(vec.column).toBe(3);
    expect(vec.vector).toEqual({ row: 2, column: 3 });
    expect(vec.vector).not.toBe(base);
  });

  it('formats a string representation', () => {
    const vec = new SmartVector({ row: -1, column: 4 });

    expect(vec.toString()).toBe('(-1, 4)');
  });

  it('adds vectors from either raw vectors or SmartVector inputs', () => {
    const base = new SmartVector({ row: 1, column: 2 });

    expect(base.add({ row: 2, column: -1 }).vector).toEqual({ row: 3, column: 1 });
    expect(base.add(new SmartVector({ row: -1, column: 5 })).vector).toEqual({ row: 0, column: 7 });
  });

  it('scales a vector by a scalar', () => {
    const vec = new SmartVector({ row: -2, column: 3 });

    expect(vec.scale(3).vector).toEqual({ row: -6, column: 9 });
  });

  it('converts to a unit vector and throws for a zero vector', () => {
    const vec = new SmartVector({ row: 3, column: -2 });

    expect(vec.toUnitVector().vector).toEqual({ row: 1, column: -1 });
    expect(new SmartVector({ row: -1, column: 0 }).toUnitVector().vector).toEqual({
      row: -1,
      column: 0,
    });
    expect(() => new SmartVector({ row: 0, column: 0 }).toUnitVector()).toThrow(
      'Cannot convert to unit vector',
    );
  });

  it('detects unit vectors', () => {
    expect(new SmartVector({ row: 1, column: 0 }).isUnitVector()).toBe(true);
    expect(new SmartVector({ row: 0, column: -1 }).isUnitVector()).toBe(true);
    expect(new SmartVector({ row: -1, column: -1 }).isUnitVector()).toBe(true);

    expect(new SmartVector({ row: 0, column: 0 }).isUnitVector()).toBe(false);
    expect(new SmartVector({ row: 2, column: 0 }).isUnitVector()).toBe(false);
    expect(new SmartVector({ row: 0, column: 2 }).isUnitVector()).toBe(false);
    expect(new SmartVector({ row: 1, column: 2 }).isUnitVector()).toBe(false);
  });

  it('checks board bounds', () => {
    const board = mkBoard({ rows: 8, columns: 8 });

    expect(new SmartVector({ row: 0, column: 0 }).isWithinBoardBounds(board)).toBe(true);
    expect(new SmartVector({ row: 7, column: 7 }).isWithinBoardBounds(board)).toBe(true);
    expect(new SmartVector({ row: -1, column: 0 }).isWithinBoardBounds(board)).toBe(false);
    expect(new SmartVector({ row: 8, column: 0 }).isWithinBoardBounds(board)).toBe(false);
    expect(new SmartVector({ row: 0, column: 8 }).isWithinBoardBounds(board)).toBe(false);
  });

  it('handles non-8x8 board dimensions', () => {
    const board = mkBoard({ rows: 3, columns: 5 });

    expect(new SmartVector({ row: 2, column: 4 }).isWithinBoardBounds(board)).toBe(true);
    expect(new SmartVector({ row: 3, column: 4 }).isWithinBoardBounds(board)).toBe(false);
    expect(new SmartVector({ row: 2, column: 5 }).isWithinBoardBounds(board)).toBe(false);

    const origin = new SmartVector({ row: 0, column: 0 });
    expect(origin.travel(board, { row: 0, column: 1 }).map((pos) => pos.vector)).toEqual([
      { row: 0, column: 1 },
      { row: 0, column: 2 },
      { row: 0, column: 3 },
      { row: 0, column: 4 },
    ]);
  });

  it('checks equality with vectors and SmartVector inputs', () => {
    const vec = new SmartVector({ row: 4, column: -3 });

    expect(vec.equals()).toBe(false);
    expect(vec.equals({ row: 4, column: -3 })).toBe(true);
    expect(vec.equals(new SmartVector({ row: 4, column: -3 }))).toBe(true);
    expect(vec.equals({ row: 4, column: -2 })).toBe(false);
  });

  it('travels across the board with unit-normalized directions', () => {
    const board = mkBoard({ rows: 8, columns: 8 });
    const origin = new SmartVector({ row: 0, column: 0 });

    const positions = origin.travel(board, { row: 0, column: 3 });
    const coords = positions.map((pos) => pos.vector);

    expect(coords).toEqual([
      { row: 0, column: 1 },
      { row: 0, column: 2 },
      { row: 0, column: 3 },
      { row: 0, column: 4 },
      { row: 0, column: 5 },
      { row: 0, column: 6 },
      { row: 0, column: 7 },
    ]);
  });

  it('limits travel by max steps and handles immediate out-of-bounds', () => {
    const board = mkBoard({ rows: 8, columns: 8 });
    const origin = new SmartVector({ row: 0, column: 0 });

    expect(origin.travel(board, { row: 0, column: 1 }, 3).map((pos) => pos.vector)).toEqual([
      { row: 0, column: 1 },
      { row: 0, column: 2 },
      { row: 0, column: 3 },
    ]);
    expect(origin.travel(board, { row: -1, column: 0 })).toEqual([]);
    expect(origin.travel(board, { row: 0, column: 1 }, 0)).toEqual([]);
  });

  it('travels one step or returns null when outside bounds', () => {
    const board = mkBoard({ rows: 8, columns: 8 });
    const origin = new SmartVector({ row: 0, column: 0 });

    expect(origin.travelOneStep(board, { row: 0, column: 5 })?.vector).toEqual({
      row: 0,
      column: 1,
    });
    expect(origin.travelOneStep(board, { row: -1, column: 0 })).toBeNull();
  });
});

describe('SmartVector.of', () => {
  it('returns the original instance when already a SmartVector', () => {
    const vec = new SmartVector({ row: 1, column: 2 });

    expect(SmartVector.of(vec)).toBe(vec);
  });

  it('wraps raw vectors in a SmartVector', () => {
    const vec = SmartVector.of({ row: -2, column: 5 });

    expect(vec).toBeInstanceOf(SmartVector);
    expect(vec.vector).toEqual({ row: -2, column: 5 });
  });
});

describe('SmartVector.pawnDirection', () => {
  it('returns the correct pawn direction for each color', () => {
    expect(SmartVector.pawnDirection(ChessColor.WHITE).vector).toEqual({ row: 1, column: 0 });
    expect(SmartVector.pawnDirection(ChessColor.BLACK).vector).toEqual({ row: -1, column: 0 });
  });

  it('throws for unknown colors', () => {
    expect(() => SmartVector.pawnDirection(ChessColor.COLOR_UNKNOWN)).toThrow('Unknown color');
  });
});

describe('ChessDirectionVectors', () => {
  it('exposes all cardinal and diagonal unit directions', () => {
    expect(ChessDirectionVectors.NORTH.vector).toEqual({ row: 1, column: 0 });
    expect(ChessDirectionVectors.SOUTH.vector).toEqual({ row: -1, column: 0 });
    expect(ChessDirectionVectors.EAST.vector).toEqual({ row: 0, column: 1 });
    expect(ChessDirectionVectors.WEST.vector).toEqual({ row: 0, column: -1 });
    expect(ChessDirectionVectors.NORTHEAST.vector).toEqual({ row: 1, column: 1 });
    expect(ChessDirectionVectors.NORTHWEST.vector).toEqual({ row: 1, column: -1 });
    expect(ChessDirectionVectors.SOUTHEAST.vector).toEqual({ row: -1, column: 1 });
    expect(ChessDirectionVectors.SOUTHWEST.vector).toEqual({ row: -1, column: -1 });
  });
});

describe('KnightDirectionVectors', () => {
  it('covers all eight knight offsets', () => {
    const asStrings = KnightDirectionVectors.map((vec) => `${vec.row},${vec.column}`);
    const expected = ['2,1', '2,-1', '-2,1', '-2,-1', '1,2', '1,-2', '-1,2', '-1,-2'];

    expect(KnightDirectionVectors).toHaveLength(8);
    expect(new Set(asStrings)).toEqual(new Set(expected));
  });

  it('uses non-unit vectors', () => {
    KnightDirectionVectors.forEach((vec) => {
      expect(vec.isUnitVector()).toBe(false);
    });
  });
});
