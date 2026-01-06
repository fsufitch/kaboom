import type { KaboomRuleset } from '@kaboom/engine/base/ruleset';

import { BishopCaptureResolver } from './bishop_capture';
import { BishopMoveResolver } from './bishop_move';
import { KingCaptureResolver } from './king_capture';
import { KingCastleResolver } from './king_castle';
import { KingMoveResolver } from './king_move';
import { KnightCaptureResolver } from './knight_capture';
import { KnightMoveResolver } from './knight_move';
import { QueenCaptureResolver } from './queen_capture';
import { QueenMoveResolver } from './queen_move';
import { RookCaptureResolver } from './rook_capture';
import { RookMoveResolver } from './rook_move';
import { CLASSIC_CHESS_MUTATORS } from './mutators';
import { newClassicChessGame } from './new_game';

export const ClassicChessRuleset = {
  id: 'classic-chess',
  name: 'Classic Chess',

  gameSnapshotMutators: CLASSIC_CHESS_MUTATORS,
  moveResolvers: [
    BishopMoveResolver,
    BishopCaptureResolver,
    KnightMoveResolver,
    KnightCaptureResolver,
    RookMoveResolver,
    RookCaptureResolver,
    QueenMoveResolver,
    QueenCaptureResolver,
    KingMoveResolver,
    KingCaptureResolver,
    KingCastleResolver,
  ],

  newGame: newClassicChessGame,

  parseTurn: (snapshot, rawTurn) => {
    throw new Error('parseTurn is not implemented yet');
  },
} satisfies KaboomRuleset;
