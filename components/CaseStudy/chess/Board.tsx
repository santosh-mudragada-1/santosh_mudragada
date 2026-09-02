'use client';

import { motion } from 'framer-motion';
import {
  boardFromFen,
  cellsForOrientation,
  moveOffset,
  pieceImage,
  pieceLabel,
  type PieceColor,
} from './fen';
import styles from './Board.module.scss';

interface BoardProps {
  fen: string;
  orientation?: PieceColor;
  /** Yellow move-highlight squares. */
  highlight?: string[];
  /** Teal ring on the piece(s) to find. */
  hint?: string[];
  /** Small move-dots on empty squares (a legal-move ladder). */
  dots?: string[];
  /** King-in-check square, painted red (breathing if `mated`). */
  danger?: string | null;
  mated?: boolean;
  /** The move that produced this position — its piece slides into place. */
  lastMove?: { from: string; to: string } | null;
  showCoordinates?: boolean;
  /** When set, squares are clickable (pointer cursor + this callback). */
  onSquareClick?: (square: string) => void;
  /** Overrides the default "Chess position" label. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Static Chess.com board (green/cream, real piece art), ported from the
 * prototype's <MiniBoard> + the single-move slide-in from <PuzzleBoard>.
 */
export function Board({
  fen,
  orientation = 'white',
  highlight = [],
  hint = [],
  dots = [],
  danger = null,
  mated = false,
  lastMove = null,
  showCoordinates = true,
  onSquareClick,
  ariaLabel,
  className,
}: BoardProps) {
  const cells = cellsForOrientation(boardFromFen(fen), orientation);
  const hi = new Set(highlight);
  const hn = new Set(hint);
  const dt = new Set(dots);

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? 'Chess position'}
      data-interactive={onSquareClick ? '' : undefined}
      className={`${styles.board}${className ? ` ${className}` : ''}`}
    >
      {cells.map((cell, i) => {
        const row = Math.floor(i / 8);
        const col = i % 8;
        const isMoved = !!lastMove && cell.square === lastMove.to;
        const off = isMoved ? moveOffset(lastMove!.from, lastMove!.to, orientation) : null;
        const isMatedKing = mated && danger === cell.square;

        return (
          <div
            key={cell.square}
            className={styles.sq}
            data-dark={!cell.light || undefined}
            onClick={onSquareClick ? () => onSquareClick(cell.square) : undefined}
          >
            {danger === cell.square && (
              <span
                className={styles.danger}
                data-pulse={isMatedKing || undefined}
              />
            )}
            {hi.has(cell.square) && <span className={styles.hl} />}
            {hn.has(cell.square) && <span className={styles.hint} />}
            {dt.has(cell.square) && !cell.piece && <span className={styles.dot} aria-hidden />}

            {cell.piece && (
              <motion.span
                key={isMoved ? `mv-${lastMove!.from}${lastMove!.to}` : 'pc'}
                className={styles.piece}
                initial={off ? { x: `${off.x}%`, y: `${off.y}%` } : false}
                animate={{ x: '0%', y: '0%' }}
                transition={{ type: 'spring', stiffness: 700, damping: 42, mass: 0.7 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pieceImage(cell.piece)} alt={pieceLabel(cell.piece)} draggable={false} />
              </motion.span>
            )}

            {showCoordinates && row === 7 && (
              <span className={styles.coord} data-pos="file" data-on={cell.light ? 'light' : 'dark'}>
                {cell.square[0]}
              </span>
            )}
            {showCoordinates && col === 0 && (
              <span className={styles.coord} data-pos="rank" data-on={cell.light ? 'light' : 'dark'}>
                {cell.square[1]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
