import type { GameSnapshot } from '@kaboom/proto';

import type { GameSnapshotWritable } from './types';

export const getFlagById = (gs: GameSnapshot | GameSnapshotWritable, flagId: string) =>
  gs.flags.find((f) => f.id === flagId);

export const getPieceById = (gs: GameSnapshot | GameSnapshotWritable, pieceId: string) =>
  gs.pieces.find((p) => p.id === pieceId);
