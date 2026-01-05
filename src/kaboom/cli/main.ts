import * as P from '@kaboom/proto';

export const main = () => {
  console.log('Hello, Kaboom CLI!');
  const game = P.GameSnapshot.create({
    properties: {
      variant: P.Variant.CLASSIC,
      id: 'game-123',
    },
    players: [] as ReadonlyArray<P.Player>,
    boards: [] as ReadonlyArray<P.ChessBoard>,
    pieces: [] as ReadonlyArray<P.ChessPiece>,
    turnHistory: [] as ReadonlyArray<P.ExecutedTurn>,
  });

  const outJson = P.GameSnapshot.toJSON(game);

  console.log('GameSnapshot JSON:', JSON.stringify(outJson, null, 2));
};

main();
