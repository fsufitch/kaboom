import type { ChessBoard, GameSnapshot } from '@kaboom/proto';

// Utility function to get the main board from the game snapshot; classic chess assumes single board
export const getClassicBoard = (gs: GameSnapshot): ChessBoard => {
  if (gs.boards.length !== 1) {
    throw new Error('Expected exactly one board in the game snapshot');
  }
  const board = gs.boards[0];
  if (!board) {
    throw new Error('No board found in the game snapshot');
  }
  return board;
};

export const pieceMovedThisGame = (gs: GameSnapshot, pieceId: string): boolean =>
  (gs.turnHistory ?? []).some((turn) =>
    turn.effects.some((effect) =>
      effect.stateChanges.some(
        (sc) => sc.pieceMoved?.pieceId === pieceId || sc.pieceCaptured?.pieceId === pieceId,
      ),
    ),
  );
