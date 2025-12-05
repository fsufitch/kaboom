import _m0 from "protobufjs/minimal";
import { KaboomMove } from "./move";
import { Position, ZoneKind } from "./position";
export declare const protobufPackage = "kaboomproto";
export interface Intent {
    uuid: string;
    actingPlayerUuid: string;
    pieceMove?: IntentPieceMove | undefined;
    pieceTransfer?: IntentPieceTransfer | undefined;
    resign?: IntentResign | undefined;
}
export interface IntentPieceMove {
    boardUuid: string;
    move?: KaboomMove | undefined;
}
export interface IntentPieceTransfer {
    pieceUuid: string;
    toBoardUuid: string;
    toZone: ZoneKind;
    toPosition?: Position | undefined;
}
export interface IntentResign {
    boardUuid: string;
    reason: string;
}
export declare const Intent: {
    encode(message: Intent, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Intent;
    fromJSON(object: any): Intent;
    toJSON(message: Intent): unknown;
    create<I extends Exact<DeepPartial<Intent>, I>>(base?: I): Intent;
    fromPartial<I extends Exact<DeepPartial<Intent>, I>>(object: I): Intent;
};
export declare const IntentPieceMove: {
    encode(message: IntentPieceMove, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): IntentPieceMove;
    fromJSON(object: any): IntentPieceMove;
    toJSON(message: IntentPieceMove): unknown;
    create<I extends Exact<DeepPartial<IntentPieceMove>, I>>(base?: I): IntentPieceMove;
    fromPartial<I extends Exact<DeepPartial<IntentPieceMove>, I>>(object: I): IntentPieceMove;
};
export declare const IntentPieceTransfer: {
    encode(message: IntentPieceTransfer, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): IntentPieceTransfer;
    fromJSON(object: any): IntentPieceTransfer;
    toJSON(message: IntentPieceTransfer): unknown;
    create<I extends Exact<DeepPartial<IntentPieceTransfer>, I>>(base?: I): IntentPieceTransfer;
    fromPartial<I extends Exact<DeepPartial<IntentPieceTransfer>, I>>(object: I): IntentPieceTransfer;
};
export declare const IntentResign: {
    encode(message: IntentResign, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): IntentResign;
    fromJSON(object: any): IntentResign;
    toJSON(message: IntentResign): unknown;
    create<I extends Exact<DeepPartial<IntentResign>, I>>(base?: I): IntentResign;
    fromPartial<I extends Exact<DeepPartial<IntentResign>, I>>(object: I): IntentResign;
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
