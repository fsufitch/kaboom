import _m0 from "protobufjs/minimal";
import { PieceType } from "./piece";
export declare const protobufPackage = "kaboomproto";
export interface PawnMove {
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
    /** optional promotion piece type */
    promotion: PieceType;
}
export interface PawnBump {
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
    /** optional promotion piece type */
    promotion: PieceType;
}
export interface PawnKaboom {
    row: number;
    col: number;
}
export declare const PawnMove: {
    encode(message: PawnMove, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PawnMove;
    fromJSON(object: any): PawnMove;
    toJSON(message: PawnMove): unknown;
    create<I extends Exact<DeepPartial<PawnMove>, I>>(base?: I): PawnMove;
    fromPartial<I extends Exact<DeepPartial<PawnMove>, I>>(object: I): PawnMove;
};
export declare const PawnBump: {
    encode(message: PawnBump, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PawnBump;
    fromJSON(object: any): PawnBump;
    toJSON(message: PawnBump): unknown;
    create<I extends Exact<DeepPartial<PawnBump>, I>>(base?: I): PawnBump;
    fromPartial<I extends Exact<DeepPartial<PawnBump>, I>>(object: I): PawnBump;
};
export declare const PawnKaboom: {
    encode(message: PawnKaboom, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PawnKaboom;
    fromJSON(object: any): PawnKaboom;
    toJSON(message: PawnKaboom): unknown;
    create<I extends Exact<DeepPartial<PawnKaboom>, I>>(base?: I): PawnKaboom;
    fromPartial<I extends Exact<DeepPartial<PawnKaboom>, I>>(object: I): PawnKaboom;
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
