import type {
  Effect,
  Effect_StateChange,
  GameSnapshot,
  IntendedTurn,
  Move,
  ResolvedTurn,
} from '@kaboom/proto';

import type { GameSnapshotWritable } from './types';

export interface KaboomRuleset {
  id: string;
  name: string;

  gameSnapshotMutators: GameSnapshotMutator[];
  moveResolvers: MoveResolver[];

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

export interface MoveResolver {
  applicable: (move: Move) => boolean;
  validMoves: (snapshot: GameSnapshot, pieceId: string) => Move[];
  resolveToEffects: (snapshot: GameSnapshot, move: Move) => Effect[];
}

export class IllegalMoveError extends Error {
  constructor(move: Move, message: string) {
    super(`Illegal move (${JSON.stringify(move)}): ${message}`);
  }
}
