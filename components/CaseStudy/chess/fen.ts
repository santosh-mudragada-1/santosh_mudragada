// FEN parsing + piece art lookup — ported from the Chess.com prototype
// (src/lib/chess.ts). No chess.js: placement parsing only, enough for a
// static / single-move board.

export type PieceColor = 'white' | 'black';

const PIECE_TO_IMAGE: Record<string, string> = {
  P: 'pawn-white',
  N: 'knight-white',
  B: 'bishop-white',
  R: 'rook-white',
  Q: 'queen-white',
  K: 'king-white',
  p: 'pawn-black',
  n: 'knight-black',
  b: 'bishop-black',
  r: 'rook-black',
  q: 'queen-black',
  k: 'king-black',
};

const PIECE_NAME: Record<string, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

export interface BoardCell {
  square: string;
  piece: string | null;
  /** light (cream) square */
  light: boolean;
}

export const pieceImage = (letter: string) =>
  `/case-study/chess-pieces/${PIECE_TO_IMAGE[letter]}.png`;

export function pieceLabel(letter: string): string {
  const color = letter === letter.toUpperCase() ? 'White' : 'Black';
  return `${color} ${PIECE_NAME[letter.toLowerCase()] ?? 'piece'}`;
}

function makeCell(fileIndex: number, rankNumber: number, piece: string | null): BoardCell {
  return {
    square: `${FILES[fileIndex]}${rankNumber}`,
    piece,
    light: (fileIndex + rankNumber) % 2 === 0,
  };
}

/** Parse the placement field of a FEN into an 8×8 grid (row 0 = rank 8). */
export function boardFromFen(fen: string): BoardCell[][] {
  const placement = fen.trim().split(/\s+/)[0] ?? '';
  const ranks = placement.split('/');
  const grid: BoardCell[][] = [];

  for (let r = 0; r < 8; r++) {
    const rankNumber = 8 - r;
    const row: BoardCell[] = [];
    for (const ch of ranks[r] ?? '8') {
      if (/\d/.test(ch)) {
        const empties = parseInt(ch, 10);
        for (let i = 0; i < empties; i++) row.push(makeCell(row.length, rankNumber, null));
      } else {
        row.push(makeCell(row.length, rankNumber, ch));
      }
    }
    while (row.length < 8) row.push(makeCell(row.length, rankNumber, null));
    grid.push(row.slice(0, 8));
  }
  return grid;
}

/** Flatten to display order for an orientation (white: rank 8→1, files a→h). */
export function cellsForOrientation(grid: BoardCell[][], orientation: PieceColor): BoardCell[] {
  const rows = orientation === 'white' ? grid : [...grid].reverse();
  return rows.flatMap((row) => (orientation === 'white' ? row : [...row].reverse()));
}

/** Display column/row (0–7) of a square, honouring orientation. */
export function squareColRow(square: string, orientation: PieceColor) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  const col = orientation === 'white' ? file : 7 - file;
  const row = orientation === 'white' ? 7 - rank : rank;
  return { col, row };
}

/** Start offset (in % of one square) so a moved piece begins on its from-square. */
export function moveOffset(from: string, to: string, orientation: PieceColor) {
  const f = squareColRow(from, orientation);
  const t = squareColRow(to, orientation);
  return { x: (f.col - t.col) * 100, y: (f.row - t.row) * 100 };
}
