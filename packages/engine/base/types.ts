import type { GameSnapshot } from '@kaboom/proto';

export type DeepWritable<T> = {
  -readonly [P in keyof T]: DeepWritable<T[P]>;
};

export type GameSnapshotWritable = DeepWritable<GameSnapshot>;

export const writable = <T>(obj: T): DeepWritable<T> => {
  return obj as DeepWritable<T>;
};

export const newReadOnlyArray = <T>(...elements: T[]): ReadonlyArray<T> => {
  return [...elements] as ReadonlyArray<T>;
};
