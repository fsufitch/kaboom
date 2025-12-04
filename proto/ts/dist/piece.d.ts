import _m0 from "protobufjs/minimal";
import { Position } from "./position";
export declare const protobufPackage = "kaboomproto";
export declare enum PieceType {
    INVALID_PIECE = 0,
    PAWN = 1,
    KNIGHT = 2,
    BISHOP = 3,
    ROOK = 4,
    QUEEN = 5,
    KING = 6,
    UNRECOGNIZED = -1
}
export declare function pieceTypeFromJSON(object: any): PieceType;
export declare function pieceTypeToJSON(object: PieceType): string;
export declare enum Color {
    INVALID_COLOR = 0,
    WHITE = 1,
    BLACK = 2,
    UNRECOGNIZED = -1
}
export declare function colorFromJSON(object: any): Color;
export declare function colorToJSON(object: Color): string;
export interface ChessPiece {
    type: PieceType;
    color: Color;
    position?: Position | undefined;
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
