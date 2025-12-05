import _m0 from "protobufjs/minimal";
import { ChessPiece, PieceKind } from "./piece";
import { Position, Vector, ZoneKind } from "./position";
import { VisualHint } from "./visual_hint";
export declare const protobufPackage = "kaboomproto";
/**
 * Effect represents a single "thing that happens in the game".
 * Effects are "actionable" elements of the game "state machine".
 * Given a game state, you can apply an Effect to get the next state.
 */
export interface Effect {
    uuid: string;
    boardUuid: string;
    /** Human-readable reason for the effect; for logging/debugging. */
    why: string;
    nothingHappens?: EffectNothingHappens | undefined;
    pieceCreated?: EffectPieceCreated | undefined;
    pieceDeleted?: EffectPieceDeleted | undefined;
    pieceMoved?: EffectPieceMoved | undefined;
    pieceCaptured?: EffectPieceCaptured | undefined;
    pieceBumped?: EffectPieceBumped | undefined;
    piecePromoted?: EffectPiecePromoted | undefined;
    pieceDeployed?: EffectPieceDeployed | undefined;
    pieceTransfer?: EffectPieceTransfer | undefined;
    win?: EffectWin | undefined;
    /** Visual hints to help the frontend represent this effect. */
    visualHints: VisualHint[];
}
/** Effect__NothingHappens is a no-op effect; used for timing placeholders, or for visual hints that don't correspond to game state changes. */
export interface EffectNothingHappens {
}
/**
 * Effect__PieceCreated represents the creation of a new piece on the board.
 * This is NOT equivalent to deployment, only when an entirely new piece is instantiated.
 */
export interface EffectPieceCreated {
    piece?: ChessPiece | undefined;
}
/**
 * Effect__PieceDeleted represents the removal of a piece from the game entirely.
 * This is NOT equivalent to capture, only when a piece is destroyed utterly somehow.
 */
export interface EffectPieceDeleted {
    pieceUuid: string;
}
/**
 * Effect__PieceMoved represents a piece moving from one position to another on the same board.
 * If the piece's movement is due to a bump action, use PieceBumped instead.
 */
export interface EffectPieceMoved {
    pieceUuid: string;
    vector?: Vector | undefined;
}
/** Effect__PieceCaptured represents a piece being captured and moved to its board's graveyard zone. */
export interface EffectPieceCaptured {
    pieceUuid: string;
}
/**
 * Effect__PieceBumped represents a piece being bumped from one position to another on the same board.
 * It is similar to Effect__PieceMoved, but specifically indicates that the piece was forced to move by another piece's action.
 */
export interface EffectPieceBumped {
    pieceUuid: string;
    vector?: Vector | undefined;
}
/** Effect__PiecePromoted represents a piece being promoted to a different kind (e.g., pawn to queen). */
export interface EffectPiecePromoted {
    pieceUuid: string;
    toKind: PieceKind;
}
/** Effect__PieceDeployed represents a piece being placed from the bench zone onto the board. */
export interface EffectPieceDeployed {
    pieceUuid: string;
    toPosition?: Position | undefined;
}
/**
 * Effect__PieceTransfer represents a full mutation of a piece's location (potentially across position, zone, and board).
 * Do NOT use this for captures or deploys. Use it for handing off pieces between players' boards in bughouse, or similar.
 */
export interface EffectPieceTransfer {
    pieceUuid: string;
    toBoardUuid: string;
    toZone: ZoneKind;
    toPosition?: Position | undefined;
}
/** Effect__Win represents a player winning the game on a specific board. */
export interface EffectWin {
    winningPlayerUuid: string;
}
export declare const Effect: {
    encode(message: Effect, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Effect;
    fromJSON(object: any): Effect;
    toJSON(message: Effect): unknown;
    create<I extends Exact<DeepPartial<Effect>, I>>(base?: I): Effect;
    fromPartial<I extends Exact<DeepPartial<Effect>, I>>(object: I): Effect;
};
export declare const EffectNothingHappens: {
    encode(_: EffectNothingHappens, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EffectNothingHappens;
    fromJSON(_: any): EffectNothingHappens;
    toJSON(_: EffectNothingHappens): unknown;
    create<I extends Exact<DeepPartial<EffectNothingHappens>, I>>(base?: I): EffectNothingHappens;
    fromPartial<I extends Exact<DeepPartial<EffectNothingHappens>, I>>(_: I): EffectNothingHappens;
};
export declare const EffectPieceCreated: {
    encode(message: EffectPieceCreated, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EffectPieceCreated;
    fromJSON(object: any): EffectPieceCreated;
    toJSON(message: EffectPieceCreated): unknown;
    create<I extends Exact<DeepPartial<EffectPieceCreated>, I>>(base?: I): EffectPieceCreated;
    fromPartial<I extends Exact<DeepPartial<EffectPieceCreated>, I>>(object: I): EffectPieceCreated;
};
export declare const EffectPieceDeleted: {
    encode(message: EffectPieceDeleted, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EffectPieceDeleted;
    fromJSON(object: any): EffectPieceDeleted;
    toJSON(message: EffectPieceDeleted): unknown;
    create<I extends Exact<DeepPartial<EffectPieceDeleted>, I>>(base?: I): EffectPieceDeleted;
    fromPartial<I extends Exact<DeepPartial<EffectPieceDeleted>, I>>(object: I): EffectPieceDeleted;
};
export declare const EffectPieceMoved: {
    encode(message: EffectPieceMoved, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EffectPieceMoved;
    fromJSON(object: any): EffectPieceMoved;
    toJSON(message: EffectPieceMoved): unknown;
    create<I extends Exact<DeepPartial<EffectPieceMoved>, I>>(base?: I): EffectPieceMoved;
    fromPartial<I extends Exact<DeepPartial<EffectPieceMoved>, I>>(object: I): EffectPieceMoved;
};
export declare const EffectPieceCaptured: {
    encode(message: EffectPieceCaptured, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EffectPieceCaptured;
    fromJSON(object: any): EffectPieceCaptured;
    toJSON(message: EffectPieceCaptured): unknown;
    create<I extends Exact<DeepPartial<EffectPieceCaptured>, I>>(base?: I): EffectPieceCaptured;
    fromPartial<I extends Exact<DeepPartial<EffectPieceCaptured>, I>>(object: I): EffectPieceCaptured;
};
export declare const EffectPieceBumped: {
    encode(message: EffectPieceBumped, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EffectPieceBumped;
    fromJSON(object: any): EffectPieceBumped;
    toJSON(message: EffectPieceBumped): unknown;
    create<I extends Exact<DeepPartial<EffectPieceBumped>, I>>(base?: I): EffectPieceBumped;
    fromPartial<I extends Exact<DeepPartial<EffectPieceBumped>, I>>(object: I): EffectPieceBumped;
};
export declare const EffectPiecePromoted: {
    encode(message: EffectPiecePromoted, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EffectPiecePromoted;
    fromJSON(object: any): EffectPiecePromoted;
    toJSON(message: EffectPiecePromoted): unknown;
    create<I extends Exact<DeepPartial<EffectPiecePromoted>, I>>(base?: I): EffectPiecePromoted;
    fromPartial<I extends Exact<DeepPartial<EffectPiecePromoted>, I>>(object: I): EffectPiecePromoted;
};
export declare const EffectPieceDeployed: {
    encode(message: EffectPieceDeployed, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EffectPieceDeployed;
    fromJSON(object: any): EffectPieceDeployed;
    toJSON(message: EffectPieceDeployed): unknown;
    create<I extends Exact<DeepPartial<EffectPieceDeployed>, I>>(base?: I): EffectPieceDeployed;
    fromPartial<I extends Exact<DeepPartial<EffectPieceDeployed>, I>>(object: I): EffectPieceDeployed;
};
export declare const EffectPieceTransfer: {
    encode(message: EffectPieceTransfer, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EffectPieceTransfer;
    fromJSON(object: any): EffectPieceTransfer;
    toJSON(message: EffectPieceTransfer): unknown;
    create<I extends Exact<DeepPartial<EffectPieceTransfer>, I>>(base?: I): EffectPieceTransfer;
    fromPartial<I extends Exact<DeepPartial<EffectPieceTransfer>, I>>(object: I): EffectPieceTransfer;
};
export declare const EffectWin: {
    encode(message: EffectWin, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EffectWin;
    fromJSON(object: any): EffectWin;
    toJSON(message: EffectWin): unknown;
    create<I extends Exact<DeepPartial<EffectWin>, I>>(base?: I): EffectWin;
    fromPartial<I extends Exact<DeepPartial<EffectWin>, I>>(object: I): EffectWin;
};
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P : P & {
    [K in keyof P]: Exact<P[K], I[K]>;
} & {
    [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
};
export {};
