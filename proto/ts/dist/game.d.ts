import _m0 from "protobufjs/minimal";
import { Color } from "./color";
import { Effect } from "./effect";
import { Intent } from "./intent";
import { ChessPiece } from "./piece";
export declare const protobufPackage = "kaboomproto";
export interface Game {
    uuid: string;
    rulesVariant: string;
    boards: Board[];
    players: Player[];
    pieces: ChessPiece[];
    turns: Turn[];
}
export interface Player {
    uuid: string;
    name: string;
}
export interface Board {
    uuid: string;
    winningPlayerUuid: string;
    playerColors: PlayerColor[];
}
export interface PlayerColor {
    playerUuid: string;
    color: Color;
}
/**
 * Turn represents a single turn taken by a player in the game.
 * It includes the player's intents (what they "do") and the resulting effects (what "happens").
 * Note: there can be multiple intents, to accommodate "bughouse" mechanics.
 */
export interface Turn {
    uuid: string;
    playerUuid: string;
    intents: Intent[];
    effects: Effect[];
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
export declare const Board: {
    encode(message: Board, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Board;
    fromJSON(object: any): Board;
    toJSON(message: Board): unknown;
    create<I extends Exact<DeepPartial<Board>, I>>(base?: I): Board;
    fromPartial<I extends Exact<DeepPartial<Board>, I>>(object: I): Board;
};
export declare const PlayerColor: {
    encode(message: PlayerColor, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PlayerColor;
    fromJSON(object: any): PlayerColor;
    toJSON(message: PlayerColor): unknown;
    create<I extends Exact<DeepPartial<PlayerColor>, I>>(base?: I): PlayerColor;
    fromPartial<I extends Exact<DeepPartial<PlayerColor>, I>>(object: I): PlayerColor;
};
export declare const Turn: {
    encode(message: Turn, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Turn;
    fromJSON(object: any): Turn;
    toJSON(message: Turn): unknown;
    create<I extends Exact<DeepPartial<Turn>, I>>(base?: I): Turn;
    fromPartial<I extends Exact<DeepPartial<Turn>, I>>(object: I): Turn;
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
