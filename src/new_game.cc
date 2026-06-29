#include "board.pb.h"
#include "piece.pb.h"
#include "game.pb.h"
#include "common.pb.h"

namespace kaboom
{

  kaboomproto::GameSnapshot *CreateTwoPlayerGame(
      uint32_t game_id,
      const kaboomproto::Variant variant,
      uint32_t white_player_id,
      uint32_t black_player_id)
  {
    auto const snap = new kaboomproto::GameSnapshot();
    snap->set_game_id(game_id);
    snap->set_variant(variant);

    // Create the board and players for the two-player game
    const uint32_t board_id = 0; // Two player game has a single board with ID 0
    auto const board = snap->add_boards();
    board->set_id(board_id);
    board->set_rows(8);
    board->set_cols(8);

    auto const white_player = snap->add_players();
    white_player->set_player_id(white_player_id);
    white_player->set_board_id(board_id);
    white_player->set_color(kaboomproto::ChessColor::COLOR_WHITE);

    auto const black_player = snap->add_players();
    black_player->set_player_id(black_player_id);
    black_player->set_board_id(board_id);
    black_player->set_color(kaboomproto::ChessColor::COLOR_BLACK);

    // Sequence of piece types for the back rows
    const kaboomproto::PieceType back_row_types[8] = {
        kaboomproto::PieceType::PIECE_ROOK,
        kaboomproto::PieceType::PIECE_KNIGHT,
        kaboomproto::PieceType::PIECE_BISHOP,
        kaboomproto::PieceType::PIECE_QUEEN,
        kaboomproto::PieceType::PIECE_KING,
        kaboomproto::PieceType::PIECE_BISHOP,
        kaboomproto::PieceType::PIECE_KNIGHT,
        kaboomproto::PieceType::PIECE_ROOK};

    for (int32_t col = 0; col < 8; ++col)
    {
      // Add white pawn
      auto const white_pawn = snap->add_pieces();
      white_pawn->set_type(kaboomproto::PieceType::PIECE_PAWN);
      white_pawn->set_color(kaboomproto::ChessColor::COLOR_WHITE);
      white_pawn->mutable_pos()->set_row(1);
      white_pawn->mutable_pos()->set_col(col);

      // Add white back piece
      auto const white_back_piece = snap->add_pieces();
      white_back_piece->set_type(back_row_types[col]);
      white_back_piece->set_color(kaboomproto::ChessColor::COLOR_WHITE);
      white_back_piece->mutable_pos()->set_row(0);
      white_back_piece->mutable_pos()->set_col(col);

      // Add black pawn
      auto const black_pawn = snap->add_pieces();
      black_pawn->set_type(kaboomproto::PieceType::PIECE_PAWN);
      black_pawn->set_color(kaboomproto::ChessColor::COLOR_BLACK);
      black_pawn->mutable_pos()->set_row(6);
      black_pawn->mutable_pos()->set_col(col);

      // Add black back piece
      auto const black_back_piece = snap->add_pieces();
      black_back_piece->set_type(back_row_types[col]);
      black_back_piece->set_color(kaboomproto::ChessColor::COLOR_BLACK);
      black_back_piece->mutable_pos()->set_row(7);
      black_back_piece->mutable_pos()->set_col(col);
    }

    return snap;
  }

} // namespace kaboom
