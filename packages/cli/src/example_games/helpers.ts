import { ChessPieceKind } from '@kaboom/proto';

export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';

const fileToColumn: Record<File, number> = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 5,
  g: 6,
  h: 7,
};

export const createClassicMoveBuilders = (boardId: string) => {
  const square = (file: File, rank: number) => ({
    boardId,
    boardPosition: { row: rank - 1, column: fileToColumn[file] },
  });

  const pawnOneStep = (from: ReturnType<typeof square>, to: ReturnType<typeof square>) => ({
    classicMove: { pawn: { oneStep: { from, to } } },
  });
  const pawnTwoStep = (from: ReturnType<typeof square>, to: ReturnType<typeof square>) => ({
    classicMove: { pawn: { twoStep: { from, to } } },
  });
  const pawnCapture = (from: ReturnType<typeof square>, to: ReturnType<typeof square>) => ({
    classicMove: { pawn: { capture: { from, to } } },
  });
  const pawnEnPassant = (from: ReturnType<typeof square>, to: ReturnType<typeof square>) => ({
    classicMove: { pawn: { enPassant: { from, to } } },
  });
  const pawnPromotion = (from: ReturnType<typeof square>, promoteTo: ChessPieceKind) => ({
    classicMove: { pawn: { promotion: { from, promoteTo } } },
  });
  const rookMove = (from: ReturnType<typeof square>, to: ReturnType<typeof square>) => ({
    classicMove: { rook: { move: { from, to } } },
  });
  const rookCapture = (from: ReturnType<typeof square>, to: ReturnType<typeof square>) => ({
    classicMove: { rook: { capture: { from, to } } },
  });
  const knightMove = (from: ReturnType<typeof square>, to: ReturnType<typeof square>) => ({
    classicMove: { knight: { move: { from, to } } },
  });
  const knightCapture = (from: ReturnType<typeof square>, to: ReturnType<typeof square>) => ({
    classicMove: { knight: { capture: { from, to } } },
  });
  const bishopMove = (from: ReturnType<typeof square>, to: ReturnType<typeof square>) => ({
    classicMove: { bishop: { move: { from, to } } },
  });
  const bishopCapture = (from: ReturnType<typeof square>, to: ReturnType<typeof square>) => ({
    classicMove: { bishop: { capture: { from, to } } },
  });
  const queenMove = (from: ReturnType<typeof square>, to: ReturnType<typeof square>) => ({
    classicMove: { queen: { move: { from, to } } },
  });
  const queenCapture = (from: ReturnType<typeof square>, to: ReturnType<typeof square>) => ({
    classicMove: { queen: { capture: { from, to } } },
  });
  const kingMove = (from: ReturnType<typeof square>, to: ReturnType<typeof square>) => ({
    classicMove: { king: { move: { from, to } } },
  });
  const kingCapture = (from: ReturnType<typeof square>, to: ReturnType<typeof square>) => ({
    classicMove: { king: { capture: { from, to } } },
  });
  const kingCastle = (
    kingFrom: ReturnType<typeof square>,
    kingTo: ReturnType<typeof square>,
    rookFrom: ReturnType<typeof square>,
    rookTo: ReturnType<typeof square>,
  ) => ({
    classicMove: { king: { castle: { kingFrom, kingTo, rookFrom, rookTo } } },
  });

  return {
    square,
    pawnOneStep,
    pawnTwoStep,
    pawnCapture,
    pawnEnPassant,
    pawnPromotion,
    rookMove,
    rookCapture,
    knightMove,
    knightCapture,
    bishopMove,
    bishopCapture,
    queenMove,
    queenCapture,
    kingMove,
    kingCapture,
    kingCastle,
  };
};
