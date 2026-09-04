'use client';

import { type CSSProperties, type RefObject } from 'react';
import { ImageCard } from './ImageCard';
import {
  type Card,
  GAP_FACTOR,
  LAYER_RATE,
  SPREAD_X,
  STOP_SY,
} from './data';
import styles from './AboutEditorial.module.scss';

type Props = {
  cards: Card[];
  /** the card layer — panned by GSAP */
  layerRef: RefObject<HTMLDivElement>;
  /** GSAP registers each card element here by id */
  registerCard: (id: string, el: HTMLElement | null) => void;
};

/**
 * The card layer. Every card is authored at its resting spot on the wide canvas
 * (stop cluster + per-card offset + the stop's vertical map offset). GSAP then
 * pans the whole layer and adds slow independent drift per card.
 */
export function Collage({ cards, layerRef, registerCard }: Props) {
  return (
    <div ref={layerRef} className={styles.cardLayer} aria-hidden>
      {cards.map((c) => {
        // cluster centre = clip centre + this stop's canvas offset (at card
        // rate); dx/dy scatter each card around that centre
        const left =
          50 + c.stop * GAP_FACTOR * 100 * LAYER_RATE.card + c.dx * SPREAD_X;
        const top = 50 + c.dy + STOP_SY[c.stop] * 100;
        return (
          <ImageCard
            key={c.id}
            ref={(el) => registerCard(c.id, el)}
            src={c.src}
            width={c.w}
            height={c.h}
            depth={c.depth}
            framed={c.framed}
            z={c.z}
            style={{ left: `${left}%`, top: `${top}%` } as CSSProperties}
          />
        );
      })}
    </div>
  );
}
