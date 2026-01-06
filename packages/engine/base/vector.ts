import { type ChessBoard, ChessColor, type Vector } from '@kaboom/proto';

export class SmartVector {
  constructor(private readonly _vector: Vector) {}

  get row() {
    return this._vector.row;
  }
  get column() {
    return this._vector.column;
  }

  get vector(): Vector {
    return { row: this.row, column: this.column };
  }

  toString = () => {
    return `(${this.row}, ${this.column})`;
  };

  add = (other: Vector | SmartVector): SmartVector => {
    return new SmartVector({
      row: this.row + other.row,
      column: this.column + other.column,
    });
  };

  scale = (scalar: number): SmartVector => {
    return new SmartVector({
      row: this.row * scalar,
      column: this.column * scalar,
    });
  };

  toUnitVector = (): SmartVector => {
    const unitRow = this.row === 0 ? 0 : this.row / Math.abs(this.row);
    const unitColumn = this.column === 0 ? 0 : this.column / Math.abs(this.column);
    const vec = new SmartVector({ row: unitRow, column: unitColumn });
    if (!vec.isUnitVector()) {
      throw new Error(`Cannot convert to unit vector: ${this.toString()}`);
    }
    return vec;
  };

  isUnitVector = (): boolean => {
    const isRowUnit = this.row === 0 || this.row === 1 || this.row === -1;
    const isColumnUnit = this.column === 0 || this.column === 1 || this.column === -1;
    const isNotZeroVector = !(this.row === 0 && this.column === 0);
    return isRowUnit && isColumnUnit && isNotZeroVector;
  };

  isWithinBoardBounds = (board: ChessBoard): boolean => {
    return (
      this.row >= 0 && this.row < board.rows && this.column >= 0 && this.column < board.columns
    );
  };

  equals = (other?: Vector | SmartVector): boolean => {
    if (!other) {
      return false;
    }
    return this.row === other.row && this.column === other.column;
  };

  travel = (board: ChessBoard, direction: Vector | SmartVector, max?: number): SmartVector[] => {
    const unitDirection = SmartVector.of(direction).toUnitVector();
    const positions: SmartVector[] = [];
    let currentPosition = this.add(unitDirection);
    let steps = 0;
    while (currentPosition.isWithinBoardBounds(board) && (max === undefined || steps < max)) {
      positions.push(currentPosition);
      currentPosition = currentPosition.add(unitDirection);
      steps += 1;
    }
    return positions;
  };

  travelOneStep = (board: ChessBoard, direction: Vector | SmartVector): SmartVector | null => {
    const unitDirection = SmartVector.of(direction).toUnitVector();
    const nextPosition = this.add(unitDirection);
    if (nextPosition.isWithinBoardBounds(board)) {
      return nextPosition;
    }
    return null;
  };

  static of(vec: Vector | SmartVector): SmartVector {
    if (vec instanceof SmartVector) {
      return vec;
    }
    return new SmartVector(vec);
  }

  static pawnDirection(color: ChessColor): SmartVector {
    switch (color) {
      case ChessColor.WHITE:
        return new SmartVector({ row: 1, column: 0 });
      case ChessColor.BLACK:
        return new SmartVector({ row: -1, column: 0 });
      default:
        throw new Error(`Unknown color: ${color}`);
    }
  }
}

export const ChessDirectionVectors = {
  NORTH: new SmartVector({ row: 1, column: 0 }),
  SOUTH: new SmartVector({ row: -1, column: 0 }),
  EAST: new SmartVector({ row: 0, column: 1 }),
  WEST: new SmartVector({ row: 0, column: -1 }),
  NORTHEAST: new SmartVector({ row: 1, column: 1 }),
  NORTHWEST: new SmartVector({ row: 1, column: -1 }),
  SOUTHEAST: new SmartVector({ row: -1, column: 1 }),
  SOUTHWEST: new SmartVector({ row: -1, column: -1 }),
};

export const KnightDirectionVectors: SmartVector[] = [
  new SmartVector({ row: 2, column: 1 }),
  new SmartVector({ row: 2, column: -1 }),
  new SmartVector({ row: -2, column: 1 }),
  new SmartVector({ row: -2, column: -1 }),
  new SmartVector({ row: 1, column: 2 }),
  new SmartVector({ row: 1, column: -2 }),
  new SmartVector({ row: -1, column: 2 }),
  new SmartVector({ row: -1, column: -2 }),
];
