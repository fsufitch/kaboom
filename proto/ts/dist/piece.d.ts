import _m0 from "protobufjs/minimal";
import { Color } from "./color";
import { Position, ZoneKind } from "./position";
export declare const protobufPackage = "kaboomproto";
/** PieceKind represents the different kinds of chess pieces. */
export declare enum PieceKind {
    INVALID_PIECE = 0,
    PAWN = 1,
    KNIGHT = 2,
    BISHOP = 3,
    ROOK = 4,
    QUEEN = 5,
    KING = 6,
    UNRECOGNIZED = -1
}
export declare function pieceKindFromJSON(object: any): PieceKind;
export declare function pieceKindToJSON(object: PieceKind): string;
/**
 * ChessPiece represents a specific chess piece in the game.
 * It is "location-aware" and knows which board it is on, its position, and its zone.
 */
export interface ChessPiece {
    uuid: string;
    kind: PieceKind;
    color: Color;
    boardUuid: string;
    position?: Position | undefined;
    zone: ZoneKind;
}
export declare const ChessPiece: {
    encode(message: ChessPiece, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ChessPiece;
    fromJSON(object: any): ChessPiece;
    toJSON(message: ChessPiece): unknown;
    create<I extends Exact<DeepPartial<ChessPiece>, I>>(base?: I): ChessPiece;
    fromPartial<I extends Exact<DeepPartial<ChessPiece>, I>>(object: I): ChessPiece;
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
