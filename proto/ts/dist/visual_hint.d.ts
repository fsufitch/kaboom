import _m0 from "protobufjs/minimal";
import { Position, Vector } from "./position";
export declare const protobufPackage = "kaboomproto";
/** VisualHint provides information for the frontend to create visual effects corresponding to game events. */
export interface VisualHint {
    uuid: string;
    boardUuid: string;
    /** Timing indicates when this visual hint should be displayed relative to other visual hints in the same TurnEffect. */
    timing: number;
    collision?: VisualHintCollision | undefined;
    explosion?: VisualHintExplosion | undefined;
    stomp?: VisualHintStomp | undefined;
    snipe?: VisualHintSnipe | undefined;
    nova?: VisualHintNova | undefined;
    mindControl?: VisualHintMindControl | undefined;
    disintegration?: VisualHintDisintegration | undefined;
    yeet?: VisualHintYeet | undefined;
}
/** VisualHint__Collision indicates a visual effect for two pieces colliding (e.g., during a bump). */
export interface VisualHintCollision {
    pieceAUuid: string;
    pieceBUuid: string;
}
/** VisualHint__Explosion indicates a visual effect for an explosion at a specific position (e.g. a pawn exploding). */
export interface VisualHintExplosion {
    position?: Position | undefined;
}
/** VisualHint__Stomp indicates a visual effect for a piece stomping on a position (e.g. knight stomp) */
export interface VisualHintStomp {
    position?: Position | undefined;
}
/** VisualHint__Snipe indicates a visual effect for a piece sniping another piece from a distance (e.g. bishop snipe). */
export interface VisualHintSnipe {
    from?: Position | undefined;
    to?: Position | undefined;
}
/** VisualHint__Nova indicates a visual effect for a nova explosion at a specific position (e.g. queen nova). */
export interface VisualHintNova {
    position?: Position | undefined;
}
/** VisualHint__MindControl indicates a visual effect for mind control between two pieces (e.g. king control). */
export interface VisualHintMindControl {
    pieceAUuid: string;
    pieceBUuid: string;
}
/** VisualHint__Disintegration indicates a visual effect for a piece disintegrating (e.g. classic chess capture, queen nova). */
export interface VisualHintDisintegration {
    pieceUuid: string;
}
/** VisualHint__Yeet indicates a visual effect for a piece being yeeted off the board (e.g. kaboom capture). */
export interface VisualHintYeet {
    pieceUuid: string;
    yeetVector?: Vector | undefined;
}
export declare const VisualHint: {
    encode(message: VisualHint, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): VisualHint;
    fromJSON(object: any): VisualHint;
    toJSON(message: VisualHint): unknown;
    create<I extends Exact<DeepPartial<VisualHint>, I>>(base?: I): VisualHint;
    fromPartial<I extends Exact<DeepPartial<VisualHint>, I>>(object: I): VisualHint;
};
export declare const VisualHintCollision: {
    encode(message: VisualHintCollision, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): VisualHintCollision;
    fromJSON(object: any): VisualHintCollision;
    toJSON(message: VisualHintCollision): unknown;
    create<I extends Exact<DeepPartial<VisualHintCollision>, I>>(base?: I): VisualHintCollision;
    fromPartial<I extends Exact<DeepPartial<VisualHintCollision>, I>>(object: I): VisualHintCollision;
};
export declare const VisualHintExplosion: {
    encode(message: VisualHintExplosion, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): VisualHintExplosion;
    fromJSON(object: any): VisualHintExplosion;
    toJSON(message: VisualHintExplosion): unknown;
    create<I extends Exact<DeepPartial<VisualHintExplosion>, I>>(base?: I): VisualHintExplosion;
    fromPartial<I extends Exact<DeepPartial<VisualHintExplosion>, I>>(object: I): VisualHintExplosion;
};
export declare const VisualHintStomp: {
    encode(message: VisualHintStomp, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): VisualHintStomp;
    fromJSON(object: any): VisualHintStomp;
    toJSON(message: VisualHintStomp): unknown;
    create<I extends Exact<DeepPartial<VisualHintStomp>, I>>(base?: I): VisualHintStomp;
    fromPartial<I extends Exact<DeepPartial<VisualHintStomp>, I>>(object: I): VisualHintStomp;
};
export declare const VisualHintSnipe: {
    encode(message: VisualHintSnipe, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): VisualHintSnipe;
    fromJSON(object: any): VisualHintSnipe;
    toJSON(message: VisualHintSnipe): unknown;
    create<I extends Exact<DeepPartial<VisualHintSnipe>, I>>(base?: I): VisualHintSnipe;
    fromPartial<I extends Exact<DeepPartial<VisualHintSnipe>, I>>(object: I): VisualHintSnipe;
};
export declare const VisualHintNova: {
    encode(message: VisualHintNova, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): VisualHintNova;
    fromJSON(object: any): VisualHintNova;
    toJSON(message: VisualHintNova): unknown;
    create<I extends Exact<DeepPartial<VisualHintNova>, I>>(base?: I): VisualHintNova;
    fromPartial<I extends Exact<DeepPartial<VisualHintNova>, I>>(object: I): VisualHintNova;
};
export declare const VisualHintMindControl: {
    encode(message: VisualHintMindControl, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): VisualHintMindControl;
    fromJSON(object: any): VisualHintMindControl;
    toJSON(message: VisualHintMindControl): unknown;
    create<I extends Exact<DeepPartial<VisualHintMindControl>, I>>(base?: I): VisualHintMindControl;
    fromPartial<I extends Exact<DeepPartial<VisualHintMindControl>, I>>(object: I): VisualHintMindControl;
};
export declare const VisualHintDisintegration: {
    encode(message: VisualHintDisintegration, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): VisualHintDisintegration;
    fromJSON(object: any): VisualHintDisintegration;
    toJSON(message: VisualHintDisintegration): unknown;
    create<I extends Exact<DeepPartial<VisualHintDisintegration>, I>>(base?: I): VisualHintDisintegration;
    fromPartial<I extends Exact<DeepPartial<VisualHintDisintegration>, I>>(object: I): VisualHintDisintegration;
};
export declare const VisualHintYeet: {
    encode(message: VisualHintYeet, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): VisualHintYeet;
    fromJSON(object: any): VisualHintYeet;
    toJSON(message: VisualHintYeet): unknown;
    create<I extends Exact<DeepPartial<VisualHintYeet>, I>>(base?: I): VisualHintYeet;
    fromPartial<I extends Exact<DeepPartial<VisualHintYeet>, I>>(object: I): VisualHintYeet;
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
