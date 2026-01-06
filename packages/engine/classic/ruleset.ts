import {
  applyEffectInPlace,
  getPieceById,
  getPlayerColor,
  newReadonlyArray,
  writable,
} from '@kaboom/engine/base';
import type { KaboomRuleset } from '@kaboom/engine/base/ruleset';
import { ChessColor, Effect, GameSnapshot, ResolvedTurn } from '@kaboom/proto';

import { BishopCaptureResolver } from './bishop_capture';
import { BishopMoveResolver } from './bishop_move';
import { KingCaptureResolver } from './king_capture';
import { KingCastleResolver } from './king_castle';
import { KingMoveResolver } from './king_move';
import { KnightCaptureResolver } from './knight_capture';
import { KnightMoveResolver } from './knight_move';
import { CLASSIC_CHESS_MUTATORS } from './mutators';
import { newClassicChessGame } from './new_game';
import { PawnCaptureResolver } from './pawn_capture';
import { PawnEnPassantResolver } from './pawn_en_passant';
import { PawnOneStepMoveResolver } from './pawn_one_step';
import { PawnPromotionResolver } from './pawn_promotion';
import { PawnTwoStepMoveResolver } from './pawn_two_step';
import { QueenCaptureResolver } from './queen_capture';
import { QueenMoveResolver } from './queen_move';
import { RookCaptureResolver } from './rook_capture';
import { RookMoveResolver } from './rook_move';
import { getClassicBoard } from './utils';

export const ClassicChessRuleset = {
  id: 'classic-chess',
  name: 'Classic Chess',

  gameSnapshotMutators: CLASSIC_CHESS_MUTATORS,
  moveResolvers: [
    PawnOneStepMoveResolver,
    PawnTwoStepMoveResolver,
    PawnCaptureResolver,
    PawnEnPassantResolver,
    PawnPromotionResolver,
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

  parseTurn: (_snapshot, _rawTurn) => {
    throw new Error('parseTurn is not implemented yet');
  },

  resolveTurn: (snapshot, intendedTurn) => {
    const classicBoard = getClassicBoard(snapshot);
    const intendedTurnPlayerColor = getPlayerColor(
      snapshot,
      classicBoard.id,
      intendedTurn.playerId,
    );
    if (intendedTurnPlayerColor === undefined) {
      throw new Error(
        `Player with ID '${intendedTurn.playerId}' does not have a color on board '${classicBoard.id}'`,
      );
    }
    if (intendedTurnPlayerColor !== classicBoard.activeColor) {
      throw new Error(
        `It is not player '${intendedTurn.playerId}'s turn (active color is '${classicBoard.activeColor}')`,
      );
    }

    let intermediateSnapshot = writable(GameSnapshot.create(snapshot));

    const effects: Effect[] = [];

    // TODO: Legality checks beyond what is in resolvers
    // * turns should only have 1 move, *except* for turns involving promotion
    // * if turn involves promotion, the first move must be a pawn move that gets to the last rank, and the second move must be the promotion move, affecting that same pawn

    for (const move of intendedTurn.moves) {
      // TODO: Legality checks beyond what is in resolvers
      // * does the move put or leave own king in check?

      const applicableResolvers = ClassicChessRuleset.moveResolvers.filter((r) =>
        r.applicable(move),
      );
      if (applicableResolvers.length === 0) {
        throw new Error(`No resolver found for move: ${JSON.stringify(move)}`);
      }
      if (applicableResolvers.length > 1) {
        throw new Error(`Multiple resolvers found for move: ${JSON.stringify(move)}`);
      }
      const resolver = applicableResolvers[0];
      if (!resolver) {
        throw new Error(
          `Move found undefined resolver: ${JSON.stringify(move)} (this should be unreachable)`,
        );
      }

      const movedPieces = resolver.getMovedPieceIds(intermediateSnapshot as GameSnapshot, move);
      for (const pieceId of movedPieces) {
        const piece = getPieceById(intermediateSnapshot as GameSnapshot, pieceId);
        if (piece?.color !== intendedTurnPlayerColor) {
          throw new Error(
            `Player with ID '${intendedTurn.playerId}' cannot move piece with ID '${pieceId}' because it is color '${piece?.color}' but the player's color is '${intendedTurnPlayerColor}'`,
          );
        }
      }

      const moveEffects = resolver.resolveToEffects(intermediateSnapshot as GameSnapshot, move);
      for (const effect of moveEffects) {
        effects.push(effect);
        applyEffectInPlace(intermediateSnapshot, effect, ClassicChessRuleset.gameSnapshotMutators);
      }
    }

    effects.push(
      Effect.create({
        stateChanges: newReadonlyArray({
          setBoardActiveColor: {
            boardId: classicBoard.id,
            activeColor:
              classicBoard.activeColor === ChessColor.WHITE ? ChessColor.BLACK : ChessColor.WHITE,
          },
        }),
      }),
    );

    const resolvedTurn = ResolvedTurn.create({
      ...intendedTurn,
      effects: newReadonlyArray(...effects),
      resolvedAt: new Date(),
    });

    return resolvedTurn;
  },
} satisfies KaboomRuleset;
