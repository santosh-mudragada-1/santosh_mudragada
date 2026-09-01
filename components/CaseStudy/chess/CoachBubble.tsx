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
}

/**
 * Ported from the Chess.com prototype (src/components/review/coach-bubble.tsx):
 * square coach portrait + white bubble with a pointer tail, optional
 * classification badge and grey eval pill.
 */
export function CoachBubble({ text, evalText, classification, className }: CoachBubbleProps) {
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
              width={20}
              height={20}
            />
          )}
          <p className={styles.text}>{text}</p>
          {evalText && <span className={styles.pill}>{evalText}</span>}
        </div>
      </div>
    </div>
  );
}
