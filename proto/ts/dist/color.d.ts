export declare const protobufPackage = "kaboomproto";
/** Color represents the color of a chess piece or player. */
export declare enum Color {
    COLOR_INVALID = 0,
    COLOR_WHITE = 1,
    COLOR_BLACK = 2,
    UNRECOGNIZED = -1
}
export declare function colorFromJSON(object: any): Color;
export declare function colorToJSON(object: Color): string;
