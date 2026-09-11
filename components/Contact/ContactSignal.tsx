import styles from './ContactSignal.module.scss';

/**
 * Replaces the old hero photo: an abstract "signal" in the brand's orange —
 * concentric rings (a satellite dot riding each one) and a centre glow,
 * rendered as a static composition. Reads as "sending something out"
 * without a stock photo.
 */

const CX = 350;
const CY = 350;
const RINGS = [
  { r: 88, dash: undefined, dotR: 5, opacity: 0.6 },
  { r: 152, dash: '1 11', dotR: 4, opacity: 0.4 },
  { r: 218, dash: '1 16', dotR: 3, opacity: 0.26 },
] as const;

export function ContactSignal() {
  return (
    <svg
      className={styles.signal}
      viewBox="0 0 700 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="signalGlow" cx="50%" cy="50%" r="50%">
          <stop className={styles.stopCore} offset="0%" />
          <stop className={styles.stopEdge} offset="100%" />
        </radialGradient>
      </defs>

      <circle className={styles.glow} cx={CX} cy={CY} r="150" />

      {RINGS.map((ring, i) => (
        <g key={i}>
          <circle
            className={styles.ring}
            style={{ opacity: ring.opacity }}
            cx={CX}
            cy={CY}
            r={ring.r}
            strokeDasharray={ring.dash}
          />
          <circle className={styles.dot} cx={CX + ring.r} cy={CY} r={ring.dotR} />
        </g>
      ))}

      <circle className={styles.core} cx={CX} cy={CY} r="9" />
    </svg>
  );
}
