import { type Effect_StateChange, Place_Captured } from '@kaboom/proto';

import { BASE_MUTATORS, InvalidStateChangeError } from '../base/mutators';
import type { GameSnapshotMutator } from '../base/ruleset';
import { getPieceById } from '../base/state_utils';
import { type GameSnapshotWritable, writable } from '../base/types';

export const PieceCapturedMutator: GameSnapshotMutator = {
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

export const CLASSIC_CHESS_MUTATORS: readonly GameSnapshotMutator[] = [
  ...BASE_MUTATORS,
  PieceCapturedMutator,
];
