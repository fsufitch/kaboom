import _m0 from "protobufjs/minimal";
import { ChessPiece } from "./piece";
import { Turn } from "./turn";
export declare const protobufPackage = "kaboomproto";
export interface Game {
    uuid: string;
    boards: ChessBoard[];
    players: Player[];
    pieces: ChessPiece[];
    turns: Turn[];
}
export interface Player {
    uuid: string;
    name: string;
}
export interface ChessBoard {
    uuid: string;
    whitePlayerUuid: string;
    blackPlayerUuid: string;
}
export declare const Game: {
    encode(message: Game, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Game;
    fromJSON(object: any): Game;
    toJSON(message: Game): unknown;
    create<I extends Exact<DeepPartial<Game>, I>>(base?: I): Game;
    fromPartial<I extends Exact<DeepPartial<Game>, I>>(object: I): Game;
};
export declare const Player: {
    encode(message: Player, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Player;
    fromJSON(object: any): Player;
    toJSON(message: Player): unknown;
    create<I extends Exact<DeepPartial<Player>, I>>(base?: I): Player;
    fromPartial<I extends Exact<DeepPartial<Player>, I>>(object: I): Player;
};
export declare const ChessBoard: {
    encode(message: ChessBoard, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ChessBoard;
    fromJSON(object: any): ChessBoard;
    toJSON(message: ChessBoard): unknown;
    create<I extends Exact<DeepPartial<ChessBoard>, I>>(base?: I): ChessBoard;
    fromPartial<I extends Exact<DeepPartial<ChessBoard>, I>>(object: I): ChessBoard;
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
