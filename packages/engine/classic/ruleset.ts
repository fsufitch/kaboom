import type { KaboomRuleset } from '@kaboom/engine/base/ruleset';

import { BishopCaptureResolver } from './bishop_capture';
import { BishopMoveResolver } from './bishop_move';
import { CLASSIC_CHESS_MUTATORS } from './mutators';
import { newClassicChessGame } from './new_game';

export const ClassicChessRuleset = {
  id: 'classic-chess',
  name: 'Classic Chess',

  gameSnapshotMutators: CLASSIC_CHESS_MUTATORS,
  moveResolvers: [BishopMoveResolver, BishopCaptureResolver],

  newGame: newClassicChessGame,

  parseTurn: (snapshot, rawTurn) => {
    throw new Error('parseTurn is not implemented yet');
  },
} satisfies KaboomRuleset;
