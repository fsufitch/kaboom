import type { KaboomRuleset } from '@kaboom/engine/base/ruleset';

import { CLASSIC_CHESS_MUTATORS } from './mutators';
import { newClassicChessGame } from './new_game';

export const ClassicChessRuleset = {
  id: 'classic-chess',
  name: 'Classic Chess',

  gameSnapshotMutators: CLASSIC_CHESS_MUTATORS,

  newGame: newClassicChessGame,

  parseTurn: (snapshot, rawTurn) => {
    throw new Error('parseTurn is not implemented yet');
  },

  resolveTurn: (snapshot, intendedTurn) => {
    throw new Error('resolveTurn is not implemented yet');
  },
} satisfies KaboomRuleset;
