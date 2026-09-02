import styles from './CoachBubble.module.scss';

type MoveClass =
  | 'brilliant'
  | 'great'
  | 'best'
  | 'excellent'
  | 'good'
  | 'book'
  | 'inaccuracy'
  | 'mistake'
  | 'missed'
  | 'blunder';

interface CoachBubbleProps {
  text: string;
  evalText?: string;
  classification?: MoveClass;
  className?: string;
  /** Appends a blinking write-caret after the text (used in the component gallery). */
  caret?: boolean;
}

/**
 * Ported from the Chess.com prototype (src/components/review/coach-bubble.tsx):
 * square coach portrait + white bubble with a pointer tail, optional
 * classification badge and grey eval pill.
 */
export function CoachBubble({
  text,
  evalText,
  classification,
  className,
  caret,
}: CoachBubbleProps) {
  return (
    <div className={`${styles.wrap}${className ? ` ${className}` : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.coach} src="/case-study/coach.png" alt="Coach" width={96} height={96} />
      <div className={styles.body}>
        <span aria-hidden className={styles.tail} />
        <div className={styles.bubble}>
          {classification && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className={styles.badge}
              src={`/case-study/move-types/${classification}.png`}
              alt=""
              width={24}
              height={24}
            />
          )}
          <p className={styles.text}>
            {text}
            {caret && <span className={styles.caret} aria-hidden />}
          </p>
          {evalText && <span className={styles.pill}>{evalText}</span>}
        </div>
      </div>
    </div>
  );
}
