import _m0 from "protobufjs/minimal";
import { PieceType } from "./piece";
import { Position } from "./position";
export declare const protobufPackage = "kaboomproto";
export interface KaboomMove {
    cPawnMove?: CPawnMove | undefined;
    cPawnCapture?: CPawnCapture | undefined;
    kPawnBump?: KPawnBump | undefined;
    kPawnExplosion?: KPawnExplosion | undefined;
    cKnightMove?: CKnightMove | undefined;
    cKnightCapture?: CKnightCapture | undefined;
    kKnightBump?: KKnightBump | undefined;
    kKnightStomp?: KKnightStomp | undefined;
    cBishopMove?: CBishopMove | undefined;
    cBishopCapture?: CBishopCapture | undefined;
    kBishopBump?: KBishopBump | undefined;
    kBishopSnipe?: KBishopSnipe | undefined;
    cRookMove?: CRookMove | undefined;
    cRookCapture?: CRookCapture | undefined;
    kRookBump?: KRookBump | undefined;
    kRookTackle?: KRookTackle | undefined;
    cQueenMove?: CQueenMove | undefined;
    cQueenCapture?: CQueenCapture | undefined;
    kQueenBump?: KQueenBump | undefined;
    kQueenNova?: KQueenNova | undefined;
    cKingMove?: CKingMove | undefined;
    cKingCapture?: CKingCapture | undefined;
    kKingBump?: KKingBump | undefined;
    kKingControl?: KKingControl | undefined;
}
/**
 * C_PawnMove is a normal pawn move in regular chess rules.
 * It encompasses single and double square advances.
 */
export interface CPawnMove {
    from?: Position | undefined;
    to?: Position | undefined;
    /** optional promotion piece type */
    promotion: PieceType;
}
/**
 * C_PawnCapture is a normal pawn capture move in regular chess rules.
 * It encompasses regular and en passant captures.
 */
export interface CPawnCapture {
    from?: Position | undefined;
    to?: Position | undefined;
    /** optional promotion piece type */
    promotion: PieceType;
}
/**
 * K_PawnBump is a Kaboom-specific move replacing the capture.
 * The pawn moves diagonally (as in regular capturing) but instead of removing the opponent's piece,
 * it "bumps" it to the square directly behind it (in the same direction as the pawn's movement).
 */
export interface KPawnBump {
    from?: Position | undefined;
    to?: Position | undefined;
    /** optional promotion piece type */
    promotion: PieceType;
}
/**
 * K_PawnExplosion is a Kaboom-specific move where the pawn detonates itself on its current position,
 * removing itself and bumping all adjacent pieces (horizontally, vertically, and diagonally).
 */
export interface KPawnExplosion {
    position?: Position | undefined;
}
/** C_KnightMove is a normal knight move in regular chess rules. */
export interface CKnightMove {
    from?: Position | undefined;
    to?: Position | undefined;
}
/** C_KnightCapture is a normal knight capture move in regular chess rules. */
export interface CKnightCapture {
    from?: Position | undefined;
    to?: Position | undefined;
}
/**
 * K_KnightBump is a Kaboom-specific move replacing the capture.
 * The knight moves to its target square (as in regular capturing) but instead of removing the opponent's piece,
 * it "bumps" it. The direction of the bump may be vertical or horizontal, depending on whether the knight's
 * "right angle" move is vertical-first or horizontal-first.
 */
export interface KKnightBump {
    from?: Position | undefined;
    to?: Position | undefined;
    bumpDirection: KKnightBump_BumpDirection;
}
export declare enum KKnightBump_BumpDirection {
    BUMP_DIRECTION_UNKNOWN = 0,
    /** BUMP_DIRECTION_HORIZONTAL - bump horizontally */
    BUMP_DIRECTION_HORIZONTAL = 1,
    /** BUMP_DIRECTION_VERTICAL - bump vertically */
    BUMP_DIRECTION_VERTICAL = 2,
    UNRECOGNIZED = -1
}
export declare function kKnightBump_BumpDirectionFromJSON(object: any): KKnightBump_BumpDirection;
export declare function kKnightBump_BumpDirectionToJSON(object: KKnightBump_BumpDirection): string;
/**
 * K_KnightStomp is a Kaboom-specific move where the knight moves to an *empty* target square, and bumps all adjacent pieces
 * (horizontally, vertically, and diagonally) away from the target square.
 */
export interface KKnightStomp {
    from?: Position | undefined;
    to?: Position | undefined;
}
/** C_BishopMove is a normal bishop move in regular chess rules. */
export interface CBishopMove {
    from?: Position | undefined;
    to?: Position | undefined;
}
/** C_BishopCapture is a normal bishop capture move in regular chess rules. */
export interface CBishopCapture {
    from?: Position | undefined;
    to?: Position | undefined;
}
/**
 * K_BishopBump is a Kaboom-specific move replacing the capture.
 * The bishop moves to its target square (as in regular capturing) but instead of removing the opponent's piece,
 * it "bumps" it along the same diagonal direction to the next square.
 */
export interface KBishopBump {
    from?: Position | undefined;
    to?: Position | undefined;
}
/**
 * K_BishopSnipe is a Kaboom-specific move. The bishop does not move from its current position,
 * but instead "snipes" an opponent's piece located anywhere along its diagonal lines of movement,
 * bumping the target piece to the next square along the same diagonal direction.
 */
export interface KBishopSnipe {
    /** bishop's current position */
    from?: Position | undefined;
    /** position of the opponent's piece to be sniped */
    target?: Position | undefined;
}
/** C_RookMove is a normal rook move in regular chess rules. */
export interface CRookMove {
    from?: Position | undefined;
    to?: Position | undefined;
}
/** C_RookCapture is a normal rook capture move in regular chess rules. */
export interface CRookCapture {
    from?: Position | undefined;
    to?: Position | undefined;
}
/**
 * K_RookBump is a Kaboom-specific move replacing the capture.
 * The rook moves to its target square (as in regular capturing) but instead of removing the opponent's piece,
 * it "bumps" it along the same rank or file to the next square.
 */
export interface KRookBump {
    from?: Position | undefined;
    to?: Position | undefined;
}
/**
 * K_RookTackle is a Kaboom-specific move variant of K_RookBump.
 * The rook moves to its target square (as in regular capturing) but instead of removing the opponent's piece,
 * it "tackles" it along the same rank or file, moving the bumped piece two squares away instead of one.
 */
export interface KRookTackle {
    from?: Position | undefined;
    to?: Position | undefined;
}
/** C_QueenMove is a normal queen move in regular chess rules. */
export interface CQueenMove {
    from?: Position | undefined;
    to?: Position | undefined;
}
/** C_QueenCapture is a normal queen capture move in regular chess rules. */
export interface CQueenCapture {
    from?: Position | undefined;
    to?: Position | undefined;
}
/**
 * K_QueenBump is a Kaboom-specific move replacing the capture.
 * The queen moves to its target square (as in regular capturing) but instead of removing the
 * opponent's piece, it "bumps" it along the same rank, file, or diagonal to the next square.
 */
export interface KQueenBump {
    from?: Position | undefined;
    to?: Position | undefined;
}
/**
 * K_QueenNova is a Kaboom-specific move where the queen detonates itself on its current position,
 * removing itself and all pieces (both friendly and opponent) located on the same rank, file, and diagonals.
 */
export interface KQueenNova {
    position?: Position | undefined;
}
/** C_KingMove is a normal king move in regular chess rules. */
export interface CKingMove {
    from?: Position | undefined;
    to?: Position | undefined;
}
/** C_KingCapture is a normal king capture move in regular chess rules. */
export interface CKingCapture {
    from?: Position | undefined;
    to?: Position | undefined;
}
/** C_KingCastle is a normal king castling move in regular chess rules. */
export interface CKingCastle {
    kingFrom?: Position | undefined;
    kingTo?: Position | undefined;
    rookFrom?: Position | undefined;
    rookTo?: Position | undefined;
}
/**
 * K_KingBump is a Kaboom-specific move replacing the capture.
 * The king moves to its target square (as in regular capturing) but instead of removing the opponent's piece,
 * it "bumps" it to an adjacent square in any direction (horizontally, vertically, or diagonally).
 */
export interface KKingBump {
    from?: Position | undefined;
    to?: Position | undefined;
}
/**
 * K_KingControl is a Kaboom-specific move where the king "mind-controls" a piece located within a distance of 2 squares
 * (New York distance) from its current position, forcing the target piece to perform any of its valid moves.
 * This can affect both friendly and opponent pieces. Queens are immune to mind control.
 */
export interface KKingControl {
    /** king's current position */
    position?: Position | undefined;
    /** The move that the target piece will perform as a result of mind control. */
    forcedMove?: KaboomMove | undefined;
}
export declare const KaboomMove: {
    encode(message: KaboomMove, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): KaboomMove;
    fromJSON(object: any): KaboomMove;
    toJSON(message: KaboomMove): unknown;
    create<I extends Exact<DeepPartial<KaboomMove>, I>>(base?: I): KaboomMove;
    fromPartial<I extends Exact<DeepPartial<KaboomMove>, I>>(object: I): KaboomMove;
};
export declare const CPawnMove: {
    encode(message: CPawnMove, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CPawnMove;
    fromJSON(object: any): CPawnMove;
    toJSON(message: CPawnMove): unknown;
    create<I extends Exact<DeepPartial<CPawnMove>, I>>(base?: I): CPawnMove;
    fromPartial<I extends Exact<DeepPartial<CPawnMove>, I>>(object: I): CPawnMove;
};
export declare const CPawnCapture: {
    encode(message: CPawnCapture, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CPawnCapture;
    fromJSON(object: any): CPawnCapture;
    toJSON(message: CPawnCapture): unknown;
    create<I extends Exact<DeepPartial<CPawnCapture>, I>>(base?: I): CPawnCapture;
    fromPartial<I extends Exact<DeepPartial<CPawnCapture>, I>>(object: I): CPawnCapture;
};
export declare const KPawnBump: {
    encode(message: KPawnBump, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): KPawnBump;
    fromJSON(object: any): KPawnBump;
    toJSON(message: KPawnBump): unknown;
    create<I extends Exact<DeepPartial<KPawnBump>, I>>(base?: I): KPawnBump;
    fromPartial<I extends Exact<DeepPartial<KPawnBump>, I>>(object: I): KPawnBump;
};
export declare const KPawnExplosion: {
    encode(message: KPawnExplosion, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): KPawnExplosion;
    fromJSON(object: any): KPawnExplosion;
    toJSON(message: KPawnExplosion): unknown;
    create<I extends Exact<DeepPartial<KPawnExplosion>, I>>(base?: I): KPawnExplosion;
    fromPartial<I extends Exact<DeepPartial<KPawnExplosion>, I>>(object: I): KPawnExplosion;
};
export declare const CKnightMove: {
    encode(message: CKnightMove, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CKnightMove;
    fromJSON(object: any): CKnightMove;
    toJSON(message: CKnightMove): unknown;
    create<I extends Exact<DeepPartial<CKnightMove>, I>>(base?: I): CKnightMove;
    fromPartial<I extends Exact<DeepPartial<CKnightMove>, I>>(object: I): CKnightMove;
};
export declare const CKnightCapture: {
    encode(message: CKnightCapture, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CKnightCapture;
    fromJSON(object: any): CKnightCapture;
    toJSON(message: CKnightCapture): unknown;
    create<I extends Exact<DeepPartial<CKnightCapture>, I>>(base?: I): CKnightCapture;
    fromPartial<I extends Exact<DeepPartial<CKnightCapture>, I>>(object: I): CKnightCapture;
};
export declare const KKnightBump: {
    encode(message: KKnightBump, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): KKnightBump;
    fromJSON(object: any): KKnightBump;
    toJSON(message: KKnightBump): unknown;
    create<I extends Exact<DeepPartial<KKnightBump>, I>>(base?: I): KKnightBump;
    fromPartial<I extends Exact<DeepPartial<KKnightBump>, I>>(object: I): KKnightBump;
};
export declare const KKnightStomp: {
    encode(message: KKnightStomp, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): KKnightStomp;
    fromJSON(object: any): KKnightStomp;
    toJSON(message: KKnightStomp): unknown;
    create<I extends Exact<DeepPartial<KKnightStomp>, I>>(base?: I): KKnightStomp;
    fromPartial<I extends Exact<DeepPartial<KKnightStomp>, I>>(object: I): KKnightStomp;
};
export declare const CBishopMove: {
    encode(message: CBishopMove, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CBishopMove;
    fromJSON(object: any): CBishopMove;
    toJSON(message: CBishopMove): unknown;
    create<I extends Exact<DeepPartial<CBishopMove>, I>>(base?: I): CBishopMove;
    fromPartial<I extends Exact<DeepPartial<CBishopMove>, I>>(object: I): CBishopMove;
};
export declare const CBishopCapture: {
    encode(message: CBishopCapture, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CBishopCapture;
    fromJSON(object: any): CBishopCapture;
    toJSON(message: CBishopCapture): unknown;
    create<I extends Exact<DeepPartial<CBishopCapture>, I>>(base?: I): CBishopCapture;
    fromPartial<I extends Exact<DeepPartial<CBishopCapture>, I>>(object: I): CBishopCapture;
};
export declare const KBishopBump: {
    encode(message: KBishopBump, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): KBishopBump;
    fromJSON(object: any): KBishopBump;
    toJSON(message: KBishopBump): unknown;
    create<I extends Exact<DeepPartial<KBishopBump>, I>>(base?: I): KBishopBump;
    fromPartial<I extends Exact<DeepPartial<KBishopBump>, I>>(object: I): KBishopBump;
};
export declare const KBishopSnipe: {
    encode(message: KBishopSnipe, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): KBishopSnipe;
    fromJSON(object: any): KBishopSnipe;
    toJSON(message: KBishopSnipe): unknown;
    create<I extends Exact<DeepPartial<KBishopSnipe>, I>>(base?: I): KBishopSnipe;
    fromPartial<I extends Exact<DeepPartial<KBishopSnipe>, I>>(object: I): KBishopSnipe;
};
export declare const CRookMove: {
    encode(message: CRookMove, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CRookMove;
    fromJSON(object: any): CRookMove;
    toJSON(message: CRookMove): unknown;
    create<I extends Exact<DeepPartial<CRookMove>, I>>(base?: I): CRookMove;
    fromPartial<I extends Exact<DeepPartial<CRookMove>, I>>(object: I): CRookMove;
};
export declare const CRookCapture: {
    encode(message: CRookCapture, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CRookCapture;
    fromJSON(object: any): CRookCapture;
    toJSON(message: CRookCapture): unknown;
    create<I extends Exact<DeepPartial<CRookCapture>, I>>(base?: I): CRookCapture;
    fromPartial<I extends Exact<DeepPartial<CRookCapture>, I>>(object: I): CRookCapture;
};
export declare const KRookBump: {
    encode(message: KRookBump, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): KRookBump;
    fromJSON(object: any): KRookBump;
    toJSON(message: KRookBump): unknown;
    create<I extends Exact<DeepPartial<KRookBump>, I>>(base?: I): KRookBump;
    fromPartial<I extends Exact<DeepPartial<KRookBump>, I>>(object: I): KRookBump;
};
export declare const KRookTackle: {
    encode(message: KRookTackle, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): KRookTackle;
    fromJSON(object: any): KRookTackle;
    toJSON(message: KRookTackle): unknown;
    create<I extends Exact<DeepPartial<KRookTackle>, I>>(base?: I): KRookTackle;
    fromPartial<I extends Exact<DeepPartial<KRookTackle>, I>>(object: I): KRookTackle;
};
export declare const CQueenMove: {
    encode(message: CQueenMove, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CQueenMove;
    fromJSON(object: any): CQueenMove;
    toJSON(message: CQueenMove): unknown;
    create<I extends Exact<DeepPartial<CQueenMove>, I>>(base?: I): CQueenMove;
    fromPartial<I extends Exact<DeepPartial<CQueenMove>, I>>(object: I): CQueenMove;
};
export declare const CQueenCapture: {
    encode(message: CQueenCapture, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CQueenCapture;
    fromJSON(object: any): CQueenCapture;
    toJSON(message: CQueenCapture): unknown;
    create<I extends Exact<DeepPartial<CQueenCapture>, I>>(base?: I): CQueenCapture;
    fromPartial<I extends Exact<DeepPartial<CQueenCapture>, I>>(object: I): CQueenCapture;
};
export declare const KQueenBump: {
    encode(message: KQueenBump, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): KQueenBump;
    fromJSON(object: any): KQueenBump;
    toJSON(message: KQueenBump): unknown;
    create<I extends Exact<DeepPartial<KQueenBump>, I>>(base?: I): KQueenBump;
    fromPartial<I extends Exact<DeepPartial<KQueenBump>, I>>(object: I): KQueenBump;
};
export declare const KQueenNova: {
    encode(message: KQueenNova, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): KQueenNova;
    fromJSON(object: any): KQueenNova;
    toJSON(message: KQueenNova): unknown;
    create<I extends Exact<DeepPartial<KQueenNova>, I>>(base?: I): KQueenNova;
    fromPartial<I extends Exact<DeepPartial<KQueenNova>, I>>(object: I): KQueenNova;
};
export declare const CKingMove: {
    encode(message: CKingMove, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CKingMove;
    fromJSON(object: any): CKingMove;
    toJSON(message: CKingMove): unknown;
    create<I extends Exact<DeepPartial<CKingMove>, I>>(base?: I): CKingMove;
    fromPartial<I extends Exact<DeepPartial<CKingMove>, I>>(object: I): CKingMove;
};
export declare const CKingCapture: {
    encode(message: CKingCapture, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CKingCapture;
    fromJSON(object: any): CKingCapture;
    toJSON(message: CKingCapture): unknown;
    create<I extends Exact<DeepPartial<CKingCapture>, I>>(base?: I): CKingCapture;
    fromPartial<I extends Exact<DeepPartial<CKingCapture>, I>>(object: I): CKingCapture;
};
export declare const CKingCastle: {
    encode(message: CKingCastle, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CKingCastle;
    fromJSON(object: any): CKingCastle;
    toJSON(message: CKingCastle): unknown;
    create<I extends Exact<DeepPartial<CKingCastle>, I>>(base?: I): CKingCastle;
    fromPartial<I extends Exact<DeepPartial<CKingCastle>, I>>(object: I): CKingCastle;
};
export declare const KKingBump: {
    encode(message: KKingBump, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): KKingBump;
    fromJSON(object: any): KKingBump;
    toJSON(message: KKingBump): unknown;
    create<I extends Exact<DeepPartial<KKingBump>, I>>(base?: I): KKingBump;
    fromPartial<I extends Exact<DeepPartial<KKingBump>, I>>(object: I): KKingBump;
};
export declare const KKingControl: {
    encode(message: KKingControl, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): KKingControl;
    fromJSON(object: any): KKingControl;
    toJSON(message: KKingControl): unknown;
    create<I extends Exact<DeepPartial<KKingControl>, I>>(base?: I): KKingControl;
    fromPartial<I extends Exact<DeepPartial<KKingControl>, I>>(object: I): KKingControl;
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
