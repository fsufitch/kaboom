import type { GameSnapshotMutator } from '@kaboom/engine/base/ruleset';
import { type GameSnapshotWritable, writable } from '@kaboom/engine/base/types';
import {
  ChessPieceKind,
  type Effect_StateChange,
  type Effect_StateChange_PiecePromoted,
  Flag,
  Place_Captured,
} from '@kaboom/proto';

import { getFlagById, getPieceById, truePieceKind } from './state_utils';

export const NoOpMutator: GameSnapshotMutator = {
  applicable: (stateChange: Effect_StateChange) => !!stateChange.noOp,
  mutate: (gsw: GameSnapshotWritable, stateChange: Effect_StateChange) => {},
};

export const CreateFlagMutator: GameSnapshotMutator = {
  applicable: (stateChange: Effect_StateChange) => !!stateChange.createFlag,
  mutate: (gsw: GameSnapshotWritable, stateChange: Effect_StateChange) => {
    if (!CreateFlagMutator.applicable(stateChange)) {
      throw new InvalidStateChangeError('State change is not a CreateFlag');
    }
    const { flag } = stateChange.createFlag!;
    if (!flag) {
      throw new InvalidStateChangeError('(Create Flag) No new flag provided');
    }
    if (!flag.id) {
      throw new InvalidStateChangeError('(Create Flag) Flag to create must have an ID');
    }
    if (getFlagById(gsw, flag.id)) {
      throw new InvalidStateChangeError(`(Create Flag) Flag with ID '${flag.id}' already exists`);
    }

    gsw.flags.push(Flag.create(flag));
  },
};

export const DeleteFlagMutator: GameSnapshotMutator = {
  applicable: (stateChange: Effect_StateChange) => !!stateChange.deleteFlag,
  mutate: (gsw: GameSnapshotWritable, stateChange: Effect_StateChange) => {
    if (!DeleteFlagMutator.applicable(stateChange)) {
      throw new InvalidStateChangeError('State change is not a DeleteFlag');
    }

    const { flagId } = stateChange.deleteFlag!;
    if (!flagId) {
      throw new InvalidStateChangeError('(Delete Flag) Flag ID to delete is required');
    }
    if (!getFlagById(gsw, flagId)) {
      throw new InvalidStateChangeError(`(Delete Flag) Flag with ID '${flagId}' does not exist`);
    }

    gsw.flags = gsw.flags.filter((f) => f.id !== flagId);
  },
};

export const PieceMovedMutator: GameSnapshotMutator = {
  applicable: (stateChange: Effect_StateChange) => !!stateChange.pieceMoved,
  mutate: (gsw: GameSnapshotWritable, stateChange: Effect_StateChange) => {
    if (!PieceMovedMutator.applicable(stateChange)) {
      throw new InvalidStateChangeError('State change is not a PieceMoved');
    }
    const { pieceId, to: toBoardPosition } = stateChange.pieceMoved!;
    if (!pieceId) {
      throw new InvalidStateChangeError('(Piece Moved) pieceId is required');
    }
    if (!toBoardPosition) {
      throw new InvalidStateChangeError('(Piece Moved) destination "to" is required');
    }

    const pieceToMove = writable(getPieceById(gsw, pieceId));
    if (!pieceToMove) {
      throw new InvalidStateChangeError(`(Piece Moved) Piece with ID '${pieceId}' does not exist`);
    }
    if (!pieceToMove.place?.boardPosition) {
      throw new InvalidStateChangeError(
        `(Piece Moved) Piece with ID '${pieceId}' is not on a board`,
      );
    }
    pieceToMove.place.boardPosition = toBoardPosition;
  },
};

const PieceCapturedMutator: GameSnapshotMutator = {
  applicable: (stateChange: Effect_StateChange) => !!stateChange.pieceCaptured,
  mutate: (gsw: GameSnapshotWritable, stateChange: Effect_StateChange) => {
    if (!PieceCapturedMutator.applicable(stateChange)) {
      throw new InvalidStateChangeError('State change is not a PieceCaptured');
    }
    const { pieceId } = stateChange.pieceCaptured!;
    if (!pieceId) {
      throw new InvalidStateChangeError('(Piece Captured) pieceId is required');
    }

    const pieceToCapture = writable(getPieceById(gsw, pieceId));
    if (!pieceToCapture) {
      throw new InvalidStateChangeError(
        `(Piece Captured) Piece with ID '${pieceId}' does not exist`,
      );
    }
    if (!pieceToCapture.place?.boardPosition) {
      throw new InvalidStateChangeError(
        `(Piece Captured) Piece with ID '${pieceId}' is not on a board`,
      );
    }
    pieceToCapture.place.boardPosition = undefined;
    pieceToCapture.place.captured = Place_Captured.create({});
  },
};

export const PiecePromotedMutator: GameSnapshotMutator = {
  applicable: (stateChange: Effect_StateChange) => !!stateChange.piecePromoted,
  mutate: (gsw: GameSnapshotWritable, stateChange: Effect_StateChange) => {
    const promotion: Effect_StateChange_PiecePromoted | undefined = stateChange.piecePromoted;
    if (!promotion?.pieceId) {
      throw new InvalidStateChangeError('(Piece Promoted) pieceId is required');
    }
    if (promotion.newKind === undefined) {
      throw new InvalidStateChangeError('(Piece Promoted) promoteTo is required');
    }
    if (
      promotion.newKind === ChessPieceKind.KIND_UNKNOWN ||
      promotion.newKind === ChessPieceKind.UNRECOGNIZED
    ) {
      throw new InvalidStateChangeError(`(Piece Promoted) promoteTo must be a known piece kind`);
    }

    const pieceToPromote = writable(getPieceById(gsw, promotion.pieceId));
    if (!pieceToPromote) {
      throw new InvalidStateChangeError(
        `(Piece Promoted) Piece with ID '${promotion.pieceId}' does not exist`,
      );
    }
    if (truePieceKind(pieceToPromote) !== ChessPieceKind.PAWN) {
      throw new InvalidStateChangeError(
        `(Piece Promoted) Piece with ID '${promotion.pieceId}' is not a pawn`,
      );
    }

    pieceToPromote.promotedKind = promotion.newKind;
  },
};

export const SetBoardActiveColorMutator: GameSnapshotMutator = {
  applicable: (stateChange: Effect_StateChange) => !!stateChange.setBoardActiveColor,
  mutate: (gsw: GameSnapshotWritable, stateChange: Effect_StateChange) => {
    if (!SetBoardActiveColorMutator.applicable(stateChange)) {
      throw new InvalidStateChangeError('State change is not a SetBoardActiveColor');
    }

    const { boardId, activeColor } = stateChange.setBoardActiveColor!;
    if (!boardId) {
      throw new InvalidStateChangeError('(Set Board Active Color) boardId is required');
    }
    if (!activeColor) {
      throw new InvalidStateChangeError('(Set Board Active Color) activeColor is required');
    }

    const boardToUpdate = gsw.boards.find((b) => b.id === boardId);
    if (!boardToUpdate) {
      throw new InvalidStateChangeError(
        `(Set Board Active Color) Board with ID '${boardId}' does not exist`,
      );
    }
    boardToUpdate.activeColor = activeColor;
  },
};

export class InvalidStateChangeError extends Error {
  constructor(message: string) {
    super(`Invalid state change: ${message}`);
  }
}

export const BASE_MUTATORS: readonly GameSnapshotMutator[] = [
  NoOpMutator,
  CreateFlagMutator,
  DeleteFlagMutator,
  PieceMovedMutator,
  PieceCapturedMutator,
  PiecePromotedMutator,
  SetBoardActiveColorMutator,
];
