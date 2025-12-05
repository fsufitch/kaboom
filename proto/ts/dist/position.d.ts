import _m0 from "protobufjs/minimal";
export declare const protobufPackage = "kaboomproto";
/** ZoneKind represents different zones a piece can be in. */
export declare enum ZoneKind {
    ZONE_INVALID = 0,
    /** ZONE_BOARD - On the main chess board */
    ZONE_BOARD = 1,
    /** ZONE_GRAVEYARD - Captured */
    ZONE_GRAVEYARD = 2,
    /** ZONE_BENCH - Ready to be deployed */
    ZONE_BENCH = 3,
    /** ZONE_TEMPORARY - For transient states */
    ZONE_TEMPORARY = 4,
    UNRECOGNIZED = -1
}
export declare function zoneKindFromJSON(object: any): ZoneKind;
export declare function zoneKindToJSON(object: ZoneKind): string;
/** Position represents a location on the chess board. */
export interface Position {
    row: number;
    col: number;
}
/** Vector represents a directional offset on the chess board. */
export interface Vector {
    dRow: number;
    dCol: number;
}
export declare const Position: {
    encode(message: Position, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Position;
    fromJSON(object: any): Position;
    toJSON(message: Position): unknown;
    create<I extends Exact<DeepPartial<Position>, I>>(base?: I): Position;
    fromPartial<I extends Exact<DeepPartial<Position>, I>>(object: I): Position;
};
export declare const Vector: {
    encode(message: Vector, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Vector;
    fromJSON(object: any): Vector;
    toJSON(message: Vector): unknown;
    create<I extends Exact<DeepPartial<Vector>, I>>(base?: I): Vector;
    fromPartial<I extends Exact<DeepPartial<Vector>, I>>(object: I): Vector;
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
