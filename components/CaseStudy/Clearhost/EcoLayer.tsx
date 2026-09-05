'use client';

import { ecosystemModules } from './content';
import styles from './WorkspaceStory.module.scss';

/* -------------------------------------------------------------------------- */
/*  The ClearHost ecosystem — markup only.                                     */
/*                                                                            */
/*  Geometry and motion come from WorkspaceStory's GSAP context, because the   */
/*  ring has to resolve against the pinned stage's measured pixel box. Every   */
/*  chip is positioned at 0,0 and moved purely with transforms.               */
/*                                                                            */
/*  Two layouts, not one scaled down. Wide screens get the ring; phones get    */
/*  the same system as a stack.                                                */
/* -------------------------------------------------------------------------- */

export function EcoLayer() {
  return (
    <div data-eco-layer className={styles.ecoLayer}>
      <div data-eco-ring className={styles.ecoRing}>
        {/* connectors + travelling packets */}
        <svg
          data-eco-lines
          preserveAspectRatio="none"
          className={styles.ecoLines}
          fill="none"
          aria-hidden
        >
          {ecosystemModules.map((m) => (
            <g key={m.id}>
              {m.children.map((c) => (
                <path
                  key={c}
                  data-eco-twig={`${m.id}|${c}`}
                  className={styles.ecoTwig}
                  strokeWidth={1}
                  strokeLinecap="round"
                  style={{ opacity: 0 }}
                />
              ))}
              <path
                data-eco-link={m.id}
                className={styles.ecoLink}
                strokeWidth={1.4}
                strokeLinecap="round"
                style={{ opacity: 0 }}
              />
              <path
                data-eco-packet={m.id}
                className={styles.ecoPacket}
                strokeWidth={3}
                strokeLinecap="round"
                style={{ opacity: 0 }}
              />
            </g>
          ))}
        </svg>

        <div data-eco-orbit className={styles.ecoOrbit}>
          {ecosystemModules.map((m) => (
            <div key={m.id} style={{ display: 'contents' }}>
              {m.children.map((c) => (
                <div key={c} data-eco-node={`c|${m.id}|${c}`} className={styles.ecoNode}>
                  <span data-eco-float className={styles.ecoFloat}>
                    <span className={styles.ecoChip}>{c}</span>
                  </span>
                </div>
              ))}
              <div data-eco-node={`m|${m.id}`} className={styles.ecoNodeModule}>
                <span data-eco-float className={styles.ecoFloat}>
                  <span className={styles.ecoModule}>{m.label}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* phones: the same five modules, read top to bottom */}
      <div data-eco-stack className={styles.ecoStack}>
        <div className={styles.ecoStackInner}>
          {ecosystemModules.map((m) => (
            <div key={m.id} data-eco-row className={styles.ecoRow}>
              <p className={styles.ecoRowLabel}>{m.label}</p>
              <ul className={styles.ecoRowList}>
                {m.children.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
