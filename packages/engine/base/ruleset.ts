import type { Effect_StateChange, GameSnapshot, IntendedTurn, ResolvedTurn } from '@kaboom/proto';

import type { GameSnapshotWritable } from './types';

export interface KaboomRuleset {
  id: string;
  name: string;

  gameSnapshotMutators: readonly GameSnapshotMutator[];

  newGame: () => GameSnapshot;
  parseTurn(snapshot: GameSnapshot, rawTurn: string): IntendedTurn;
  resolveTurn(snapshot: GameSnapshot, intendedTurn: IntendedTurn): ResolvedTurn;
}

// A mutator applies a specific kind of state change to a game snapshot.
// Mutators are used to modularize the logic for applying state changes.
export interface GameSnapshotMutator {
  applicable: (stateChange: Effect_StateChange) => boolean;
  mutate: (gs: GameSnapshotWritable, stateChange: Effect_StateChange) => void;
}
