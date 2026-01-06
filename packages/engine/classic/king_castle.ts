import {
  ChessPieceKind,
  Effect,
  type Effect_StateChange,
  type GameSnapshot,
  Move,
} from '@kaboom/proto';

import { IllegalMoveError, type MoveResolver } from '../base/ruleset';
import {
  getBoardById,
  getPieceAtBoardPosition,
  getPieceById,
  movesEqual,
  truePieceKind,
} from '../base/state_utils';
import { SmartVector } from '../base/vector';
import { getClassicBoard, pieceMovedThisGame } from './utils';

// Simplified castling: does not currently check for check/through-check or prior moves.
export const KingCastleResolver: MoveResolver = {
  applicable: (move: Move) => move.classicMove?.king?.castle !== undefined,
  validMoves: (snapshot: GameSnapshot, pieceId: string): Move[] => {
    const king = getPieceById(snapshot, pieceId);
    if (!king) {
      throw new Error(`Piece with ID '${pieceId}' does not exist`);
    }
    if (truePieceKind(king) !== ChessPieceKind.KING) {
      throw new Error(`Piece with ID '${pieceId}' is not a King`);
    }
    if (!king.place?.boardPosition) {
      throw new Error(`Piece with ID '${pieceId}' is not on a board`);
    }

    const board = getClassicBoard(snapshot);
    const kingPos = SmartVector.of(king.place.boardPosition);
    const row = kingPos.row;

    const rookColumns = [0, board.columns - 1];
    const castles: {
      kingFrom: SmartVector;
      kingTo: SmartVector;
      rookFrom: SmartVector;
      rookTo: SmartVector;
    }[] = [];

    for (const rookCol of rookColumns) {
      const rookPos = new SmartVector({ row, column: rookCol });
      const rook = getPieceAtBoardPosition(snapshot, board.id, rookPos.vector);
      if (!rook || truePieceKind(rook) !== ChessPieceKind.ROOK || rook.color !== king.color) {
        continue;
      }

      if (pieceMovedThisGame(snapshot, king.id) || pieceMovedThisGame(snapshot, rook.id)) {
        continue;
      }

      const direction = Math.sign(rookPos.column - kingPos.column);
      if (direction === 0) {
        continue;
      }

      let pathClear = true;
      for (let col = kingPos.column + direction; col !== rookPos.column; col += direction) {
        const betweenPos = new SmartVector({ row, column: col });
        if (getPieceAtBoardPosition(snapshot, board.id, betweenPos.vector)) {
          pathClear = false;
          break;
        }
      }

      if (!pathClear) {
        continue;
      }

      const kingToColumn = direction > 0 ? kingPos.column + 2 : kingPos.column - 2;
      const rookToColumn = direction > 0 ? kingToColumn - 1 : kingToColumn + 1;
      const kingTo = new SmartVector({ row, column: kingToColumn });
      const rookTo = new SmartVector({ row, column: rookToColumn });

      if (!kingTo.isWithinBoardBounds(board) || !rookTo.isWithinBoardBounds(board)) {
        continue;
      }

      castles.push({
        kingFrom: kingPos,
        kingTo,
        rookFrom: rookPos,
        rookTo,
      });
    }

    return castles.map((castle) =>
      Move.create({
        classicMove: {
          king: {
            castle: {
              kingFrom: { boardId: board.id, boardPosition: castle.kingFrom.vector },
              kingTo: { boardId: board.id, boardPosition: castle.kingTo.vector },
              rookFrom: { boardId: board.id, boardPosition: castle.rookFrom.vector },
              rookTo: { boardId: board.id, boardPosition: castle.rookTo.vector },
            },
          },
        },
      }),
    );
  },

  resolveToEffects: (snapshot: GameSnapshot, move: Move) => {
    const castle = move.classicMove?.king?.castle;
    if (!castle) {
      throw new Error('Invalid move: not a King castle');
    }

    const board = getBoardById(snapshot, castle.kingFrom?.boardId || '');
    if (!board || castle.kingFrom?.boardId === undefined) {
      throw new Error(
        `Invalid move: King castle specified unknown board ID '${castle.kingFrom?.boardId}'`,
      );
    }

    const king = getPieceAtBoardPosition(snapshot, board.id, castle.kingFrom.boardPosition!);
    const rook = getPieceAtBoardPosition(snapshot, board.id, castle.rookFrom?.boardPosition!);
    if (!king) {
      throw new Error(
        `Invalid move: no king at position ${JSON.stringify(
          castle.kingFrom.boardPosition,
        )} on board '${board.id}'`,
      );
    }
    if (!rook) {
      throw new Error(
        `Invalid move: no rook at position ${JSON.stringify(
          castle.rookFrom?.boardPosition,
        )} on board '${board.id}'`,
      );
    }

    const validMoves = KingCastleResolver.validMoves(snapshot, king.id);
    const isValidMove = validMoves.some((validMove) => movesEqual(validMove, move));
    if (!isValidMove) {
      throw new IllegalMoveError(move, `Not a legal castle move`);
    }

    return [
      Effect.create({
        stateChanges: [
          {
            pieceMoved: {
              pieceId: king.id,
              to: castle.kingTo,
            },
          },
          {
            pieceMoved: {
              pieceId: rook.id,
              to: castle.rookTo,
            },
          },
        ] as readonly Effect_StateChange[],
      }),
    ];
  },
};
