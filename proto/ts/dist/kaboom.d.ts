import _m0 from "protobufjs/minimal";
import { KaboomMove } from "./move";
import { ChessPiece } from "./piece";
export declare const protobufPackage = "kaboomproto";
export interface GameState {
    boards: BoardState[];
}
export interface BoardState {
    whitePlayer?: Player | undefined;
    blackPlayer?: Player | undefined;
    chessBoard?: ChessBoard | undefined;
    /** Current turn, turn count, etc can be implied from the move history */
    moveHistory: KaboomMove[];
}
export interface Player {
    uuid: string;
    name: string;
    boardUuid: string[];
}
export interface ChessBoard {
    uuid: string;
    name: string;
    pieces: ChessPiece[];
}
export declare const GameState: {
    encode(message: GameState, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GameState;
    fromJSON(object: any): GameState;
    toJSON(message: GameState): unknown;
    create<I extends Exact<DeepPartial<GameState>, I>>(base?: I): GameState;
    fromPartial<I extends Exact<DeepPartial<GameState>, I>>(object: I): GameState;
};
export declare const BoardState: {
    encode(message: BoardState, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): BoardState;
    fromJSON(object: any): BoardState;
    toJSON(message: BoardState): unknown;
    create<I extends Exact<DeepPartial<BoardState>, I>>(base?: I): BoardState;
    fromPartial<I extends Exact<DeepPartial<BoardState>, I>>(object: I): BoardState;
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
