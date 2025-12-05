import _m0 from "protobufjs/minimal";
import { TurnEffect } from "./effect";
import { KaboomMove } from "./move";
export declare const protobufPackage = "kaboomproto";
/**
 * Turn represents a single turn taken by a player in the game.
 * It includes the player's intents (what they "do") and the resulting effects (what "happens").
 * Note: there can be multiple intents, to accommodate "bughouse" mechanics.
 */
export interface Turn {
    uuid: string;
    playerUuid: string;
    intents: TurnIntent[];
    effects: TurnEffect[];
}
/** TurnIntent represents a single action a player intends to take during their turn. */
export interface TurnIntent {
    uuid: string;
    boardUuid: string;
    /** A piece move, as defined in move.proto */
    actionMove?: IntentMove | undefined;
    /** Deploying a piece from the bench to the board */
    actionPieceDeploy?: IntentDeploy | undefined;
}
export interface IntentMove {
    move?: KaboomMove | undefined;
}
export interface IntentDeploy {
    pieceUuid: string;
}
export declare const Turn: {
    encode(message: Turn, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Turn;
    fromJSON(object: any): Turn;
    toJSON(message: Turn): unknown;
    create<I extends Exact<DeepPartial<Turn>, I>>(base?: I): Turn;
    fromPartial<I extends Exact<DeepPartial<Turn>, I>>(object: I): Turn;
};
export declare const TurnIntent: {
    encode(message: TurnIntent, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TurnIntent;
    fromJSON(object: any): TurnIntent;
    toJSON(message: TurnIntent): unknown;
    create<I extends Exact<DeepPartial<TurnIntent>, I>>(base?: I): TurnIntent;
    fromPartial<I extends Exact<DeepPartial<TurnIntent>, I>>(object: I): TurnIntent;
};
export declare const IntentMove: {
    encode(message: IntentMove, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): IntentMove;
    fromJSON(object: any): IntentMove;
    toJSON(message: IntentMove): unknown;
    create<I extends Exact<DeepPartial<IntentMove>, I>>(base?: I): IntentMove;
    fromPartial<I extends Exact<DeepPartial<IntentMove>, I>>(object: I): IntentMove;
};
export declare const IntentDeploy: {
    encode(message: IntentDeploy, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): IntentDeploy;
    fromJSON(object: any): IntentDeploy;
    toJSON(message: IntentDeploy): unknown;
    create<I extends Exact<DeepPartial<IntentDeploy>, I>>(base?: I): IntentDeploy;
    fromPartial<I extends Exact<DeepPartial<IntentDeploy>, I>>(object: I): IntentDeploy;
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
