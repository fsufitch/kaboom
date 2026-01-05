# Kaboom Chess Rules

Kaboom Chess is a family of chess variants that keep the familiar board and pieces, but replace classical _captures_ with _bumps_, add explosive special moves, and (in some variants) let you bring captured pieces back onto the board. It is designed to be playable with normal chess sets — no computer required.

This document explains the rules as a player would learn them: start from classic chess, then apply the Kaboom changes. It also describes three Kaboom subvariants:

1. **2‑Player Kaboom** — Kaboom rules on a single board.
2. **4‑Player Kaboom** — Bughouse‑shaped Kaboom across two boards and two teams.
3. **4‑Player Nukeboom** — Like 4‑Player Kaboom, but with unlimited pre‑move deployments.

---

## 1. Classic Chess (baseline)

Kaboom Chess uses the standard chessboard (8×8) and the usual pieces.

### 1.1 Board coordinates (for discussion)

Columns are **a–h** from left to right from White’s perspective. Rows are **1–8** from White’s side to Black’s.

### 1.2 Pieces and their normal movement

Kaboom starts with classic movement rules:

- **King:** 1 square in any direction.
- **Queen:** any number of squares in any direction.
- **Rook:** any number of squares orthogonally.
- **Bishop:** any number of squares diagonally.
- **Knight:** L‑shape (2 then 1), can jump over pieces.
- **Pawn:** 1 square forward (optionally 2 from its start), captures diagonally forward, promotes on last rank.

Now: Kaboom changes what “capture” means, removes some classic special rules, and adds new special moves.

---

## 2. The Big Kaboom Changes (shared by all Kaboom variants)

### 2.1 No normal captures

In Kaboom Chess, pieces **do not capture by moving onto an occupied square** the normal way.

Instead, Kaboom uses **bumps**.

### 2.2 Bumping

A **bump** happens when a piece tries to move into a square that already contains an opponent piece.

- The moving piece takes the destination square.
- The piece that was there is **pushed one square directly away** from the moving piece (same direction as the bump).
- If the pushed piece would be pushed **off the board**, it is **captured** (removed from the board).
- If the square the piece would be pushed into is occupied, see **Blocked Bumps** below.

#### Blocked bumps (chain bumps)

Kaboom uses **chain bumps**.

If a piece is bumped and the square it would be pushed into is occupied, then the piece in that square is also bumped in the same direction, and so on.

- Chain bumps can push multiple pieces.
- The chain stops when a piece is pushed into an empty square.
- If a piece is pushed off the board, it is captured.
- **Friendly fire is allowed:** you may bump your own pieces, and chain bumps can capture your own pieces.

Example: A pawn is bumped from a7 to a8, but a rook is on a8. The rook is bumped to a9 (off the board) and is captured. The pawn ends on a8.

### 2.3 No check, no checkmate

Kaboom Chess does **not** use check or checkmate. You may move into “check.”

### 2.4 No castling, no en passant

- **Castling is not allowed.**
- **En passant is not allowed.**

### 2.5 Captured pieces are not gone forever

In Kaboom variants, captured pieces typically go to a **bench** (a reserve/pocket). Depending on the subvariant, benched pieces can be placed back onto the board (“deployed/respawned”).

---

## 3. Kaboom Special Moves (piece abilities)

In addition to their classic movement, pieces gain special Kaboom actions.

These special moves are optional — you choose them on your turn like you would choose a normal move.

### 3.1 Pawn

Pawns still move forward normally. They also gain:

- **Bump (diagonal):** A pawn may bump **diagonally forward** into an occupied square (the same directions it captures in classic chess). The pawn moves into that diagonal square, and the bumped piece is pushed one square further along the same diagonal (using chain bumps).
  - Pawns **cannot** bump straight forward.
- **Explode:** The pawn destroys itself and all pieces on the **eight** surrounding squares (orthogonal + diagonal).

**Promotion:**

- A pawn that reaches the last rank by **its own move** may promote **immediately as part of that move**.
- A pawn that reaches the last rank by being moved _indirectly_ (for example via another piece’s effect, a forced move, or similar) does **not** promote immediately.
- If a pawn is on the last rank and did not promote immediately, it may promote later by using a **Promotion** move on a future turn.

(Practical table rule: if the pawn’s move is the thing that placed it onto the last rank, you may replace it with the promoted piece right then.)

### 3.2 Knight

Knights keep their normal L‑move and can jump. They also gain:

- **Jump‑and‑Bump:** After making an L‑move to a square that is occupied, the knight lands there and bumps the occupant. You choose the direction to bump the occupant (must be one of the eight directions). The bumped piece moves one square in that direction (or falls off the board).

### 3.3 Bishop

Bishops keep their diagonal sliding move. They also gain:

- **Bump (diagonal):** If the destination square is occupied, the bishop may bump the occupant one square further along the same diagonal.
- **Snipe:** Choose **any** piece on one of the bishop’s diagonals, even if other pieces are between you and the target.
  - The bishop **does not move**.
  - The target piece is pushed **one square farther away from the bishop** along that same diagonal (using chain bumps).

### 3.4 Rook

Rooks keep their orthogonal sliding move. They also gain:

- **Bump (orthogonal):** If the destination square is occupied, the rook may bump the occupant one square further along the same file/rank.
- **Double Bump:** The rook bumps a target piece **two squares** away in the bump direction.
  - This uses chain bumps as needed.
  - The target piece must end up exactly two squares farther away (or off the board).
  - Pieces in the path may be bumped as part of the chain.
  - In heavy congestion, this can result in **multiple captures**, including friendly pieces.

### 3.5 Queen

Queens keep their sliding move. They also gain:

- **Bump:** As rook/bishop bump.
- **Nova:** The queen detonates.
  - Remove the queen.
  - Remove all pieces on the eight surrounding squares (orthogonal + diagonal).
  - This affects friendly and enemy pieces alike.

### 3.6 King

Kings keep their one-step move. They also gain:

- **Bump:** The king may move into an adjacent occupied square and bump the occupant one square further in the same direction.
- **Mind Control:** The king may choose a piece within **Manhattan distance 2** (count squares like a rook: up to two squares away orthogonally, total distance ≤ 2) and force it to make a Kaboom move immediately.
  - **Kings and queens are immune** to mind control.
  - The controlled piece may be friendly or enemy.
  - The controlled move resolves immediately as part of your turn.

---

## 4. 2‑Player Kaboom

### 4.1 Setup

Set up a normal chess game.

### 4.2 Objective

There is no checkmate. The goal is to **capture the opponent’s king** by bumping it off the board.

### 4.3 Turn sequence

On your turn, do **one** of the following:

1. **Make one move** with one of your pieces (classic move or Kaboom special move), or
2. **Deploy (respawn) one of your benched pieces** onto the board (see below).

Then it becomes your opponent’s turn.

### 4.4 Bench and deployment (respawn)

When a piece is captured (pushed off the board), it goes to the **bench** belonging to the piece’s original owner.

**Deploying a benched piece:**

- Instead of making a normal move, you may place one benched piece onto an empty square on **your half** of the board.
- Your half is ranks **1–4** for White and **5–8** for Black.
- The deployed piece is now active and may be moved on later turns.

**Restrictions (default):**

- You may not deploy a pawn onto the last rank (no instant promotion).
- You may not deploy onto an occupied square.

---

## 5. 4‑Player Kaboom (two boards, teams)

This variant is shaped like bughouse:

- Two boards: **Board A** and **Board B**.
- Two teams of two players.
- Each board has one player playing White and one playing Black.

### 5.1 Setup

Set up both boards as normal chess games.

Assign teams so that teammates sit on opposite boards (classic bughouse arrangement):

- Team 1: White on Board A + Black on Board B
- Team 2: Black on Board A + White on Board B

### 5.2 Captures pass to your partner

When you capture (bump off) an opponent piece on your board, that captured piece goes to **your partner’s bench** on the other board.

Example: You bump off an enemy rook on Board A. Your partner now has a rook available to deploy on Board B.

### 5.3 Kings are special (not immediate game over)

Capturing a king does **not** immediately end the game.

- If a king is captured, it goes to your partner’s bench like any other piece.
- A captured king must be **deployed immediately** by the owning team on that board’s next turn (see “Immediate king redeploy” below).

### 5.4 Win state: owning two kings on a board

A board is in a **win state** for a player if, at the start of that player’s turn, they have **two kings on the board**.

A team wins the match if **both boards** are simultaneously in a win state for players on the same team.

Informally: if your team manages to possess all four kings, and the opponents cannot immediately recapture the “extra” kings, you win.

### 5.5 Turn sequence (deployment + move)

On your turn you may:

1. **Optionally deploy one piece** from your bench onto your half of the board.
2. Then **make one normal move** with one piece.

Important: deployment happens **before** the move.

Your deployed piece does not have to be the piece you move.

### 5.6 Immediate king redeploy

If you start your turn with one of your kings in your bench (because it was captured), you must deploy it **before doing anything else**.

This **uses up** your usual optional deployment for the turn. You do not get an extra deploy that turn.

This means capturing a king at the wrong moment can disrupt the opponent team’s planned deployment.

---

## 6. 4‑Player Nukeboom

Nukeboom is the same as 4‑Player Kaboom except for one rule change:

### 6.1 Unlimited deployments before moving

On your turn, you may deploy **any number** of pieces from your bench, one at a time, onto legal squares on your half of the board.

After you are done deploying, you then make exactly **one normal move**.

Everything else — capture‑passing, king behavior, win condition — is the same as 4‑Player Kaboom.

---

## 7. Examples

### Example: A bump capture

A rook moves from a1 to a8 where an enemy bishop sits.

- The rook lands on a8.
- The bishop is bumped to a9 (off the board) and is captured.

### Example: A king capture in 2‑Player Kaboom

A queen bumps the enemy king off the board. The king is captured. The game ends immediately.

### Example: Winning in 4‑Player Kaboom

Your teammate captures an enemy king on Board A and passes it to your bench on Board B.
You deploy that king so you now have two kings on Board B. If your teammate also has two kings on Board A at the start of their turn, your team wins.
