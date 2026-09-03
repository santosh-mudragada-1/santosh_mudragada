'use client';

import { useMemo, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './InsightAnim.module.scss';

const W = 520;
const H = 300;

const SIZE = { map: { w: 70, h: 50 }, note: { w: 60, h: 44 }, booking: { w: 64, h: 40 } };

// scattered, independent systems
const FRAGMENTED = {
  map: { x: 44, y: 44, r: -9 },
  note: { x: 300, y: 216, r: 10 },
  booking: { x: 404, y: 56, r: -7 },
};

// one clean horizontal row
const ALIGNED = {
  map: { x: 54, y: 148, r: 0 },
  note: { x: 224, y: 148, r: 0 },
  booking: { x: 398, y: 148, r: 0 },
};

function center(pos: { x: number; y: number }, size: { w: number; h: number }) {
  return { x: pos.x + size.w / 2, y: pos.y + size.h / 2 };
}

/**
 * ANIMATION 03 — CONNECTION. Three independent systems — a map, saved
 * notes, a booking — sit fragmented and unrelated. An orange route finds
 * its way through the map, the systems draw together into one aligned
 * horizontal journey, the route travels the whole connected line, holds —
 * then the systems separate back into fragments and the cycle begins again.
 *
 * One shared seamless timeline, same reasoning as InsightAccumulate: the
 * end state (FRAGMENTED) matches the start state, so repeat never jumps.
 */
export function InsightConnect() {
  const rootRef = useRef<SVGSVGElement>(null);
  const mapRef = useRef<SVGGElement>(null);
  const noteRef = useRef<SVGGElement>(null);
  const bookingRef = useRef<SVGGElement>(null);
  const lineMapNoteRef = useRef<SVGLineElement>(null);
  const lineNoteBookingRef = useRef<SVGLineElement>(null);
  const routeRef = useRef<SVGCircleElement>(null);
  const reduced = usePrefersReducedMotion();

  // Fixed aligned-state anchor points — the connecting lines only ever draw
  // between these, which is exactly where the icon groups sit once aligned.
  const anchors = useMemo(
    () => ({
      map: center(ALIGNED.map, SIZE.map),
      note: center(ALIGNED.note, SIZE.note),
      booking: center(ALIGNED.booking, SIZE.booking),
    }),
    [],
  );
  const lenMapNote = Math.hypot(anchors.note.x - anchors.map.x, anchors.note.y - anchors.map.y);
  const lenNoteBooking = Math.hypot(
    anchors.booking.x - anchors.note.x,
    anchors.booking.y - anchors.note.y,
  );

  useGSAP(
    () => {
      const groups = { map: mapRef.current, note: noteRef.current, booking: bookingRef.current };
      if (!groups.map || !groups.note || !groups.booking) return;

      const setPose = (pose: typeof FRAGMENTED) => {
        (Object.keys(groups) as Array<keyof typeof groups>).forEach((k) => {
          gsap.set(groups[k], { x: pose[k].x, y: pose[k].y, rotation: pose[k].r });
        });
      };

      if (reduced) {
        setPose(ALIGNED);
        gsap.set([lineMapNoteRef.current, lineNoteBookingRef.current], {
          opacity: 1,
          strokeDashoffset: 0,
        });
        gsap.set(routeRef.current, { x: anchors.booking.x, y: anchors.booking.y, opacity: 1 });
        return;
      }

      setPose(FRAGMENTED);
      gsap.set([lineMapNoteRef.current, lineNoteBookingRef.current], {
        opacity: 0,
        strokeDasharray: (i) => (i === 0 ? lenMapNote : lenNoteBooking),
        strokeDashoffset: (i) => (i === 0 ? lenMapNote : lenNoteBooking),
      });

      const mapCenterFrag = center(FRAGMENTED.map, SIZE.map);
      gsap.set(routeRef.current, {
        x: mapCenterFrag.x,
        y: mapCenterFrag.y,
        opacity: 0,
        transformOrigin: '50% 50%',
      });

      // explicit, positionally-matched lists — index i in these always means
      // [map, note, booking], same order the group elements are targeted in.
      const groupList = [groups.map, groups.note, groups.booking];
      const alignedList = [ALIGNED.map, ALIGNED.note, ALIGNED.booking];
      const fragmentedList = [FRAGMENTED.map, FRAGMENTED.note, FRAGMENTED.booking];

      gsap
        .timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } })
        // the route finds its way through the still-fragmented map
        .to(routeRef.current, { opacity: 1, duration: 0.3 })
        .to(routeRef.current, {
          x: mapCenterFrag.x - 10,
          y: mapCenterFrag.y + 7,
          duration: 0.5,
        })
        .to(routeRef.current, { x: mapCenterFrag.x + 9, y: mapCenterFrag.y - 8, duration: 0.55 })
        .to(routeRef.current, { x: mapCenterFrag.x, y: mapCenterFrag.y, duration: 0.4 })
        // the three systems draw together into one journey
        .to(
          groupList,
          {
            x: (i) => alignedList[i].x,
            y: (i) => alignedList[i].y,
            rotation: 0,
            duration: 1.5,
            stagger: 0.12,
          },
          '+=0.15',
        )
        .to(routeRef.current, { x: anchors.map.x, y: anchors.map.y, duration: 0.9 }, '<')
        .to(
          [lineMapNoteRef.current, lineNoteBookingRef.current],
          { opacity: 1, strokeDashoffset: 0, duration: 0.9, stagger: 0.15 },
          '<0.3',
        )
        // the route travels the whole connected journey
        .to(routeRef.current, { x: anchors.note.x, y: anchors.note.y, duration: 0.8 }, '+=0.1')
        .to(routeRef.current, { x: anchors.booking.x, y: anchors.booking.y, duration: 0.8 })
        .to({}, { duration: 1 }) // hold the completed journey
        // fragment apart again
        .to(routeRef.current, { opacity: 0, duration: 0.35 })
        .to(
          [lineMapNoteRef.current, lineNoteBookingRef.current],
          {
            opacity: 0,
            strokeDashoffset: (i) => (i === 0 ? lenMapNote : lenNoteBooking),
            duration: 0.7,
          },
          '<',
        )
        .to(
          groupList,
          {
            x: (i) => fragmentedList[i].x,
            y: (i) => fragmentedList[i].y,
            rotation: (i) => fragmentedList[i].r,
            duration: 1.5,
            stagger: 0.08,
          },
          '-=0.3',
        )
        .set(routeRef.current, { x: mapCenterFrag.x, y: mapCenterFrag.y })
        .to({}, { duration: 0.6 });
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <svg
      ref={rootRef}
      className={styles.canvas}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden
      focusable="false"
    >
      <line
        ref={lineMapNoteRef}
        x1={anchors.map.x}
        y1={anchors.map.y}
        x2={anchors.note.x}
        y2={anchors.note.y}
        className={styles.thinLine}
      />
      <line
        ref={lineNoteBookingRef}
        x1={anchors.note.x}
        y1={anchors.note.y}
        x2={anchors.booking.x}
        y2={anchors.booking.y}
        className={styles.thinLine}
      />

      <g ref={mapRef} className={styles.card}>
        <rect width={SIZE.map.w} height={SIZE.map.h} rx={4} className={styles.cardRect} />
        <path d="M8,38 C20,10 34,44 46,18 S60,10 64,26" className={styles.thinLine} />
        <circle cx={20} cy={30} r={2} className={styles.pinDot} />
        <circle cx={50} cy={16} r={2} className={styles.pinDot} />
      </g>

      <g ref={noteRef} className={styles.card}>
        <rect width={SIZE.note.w} height={SIZE.note.h} rx={4} className={styles.cardRect} />
        <line x1={9} y1={16} x2={48} y2={16} className={styles.cardLine} />
        <line x1={9} y1={26} x2={38} y2={26} className={styles.cardLine} />
        <circle cx={51} cy={9} r={2.2} className={styles.dot} />
      </g>

      <g ref={bookingRef} className={styles.card}>
        <rect width={SIZE.booking.w} height={SIZE.booking.h} rx={4} className={styles.cardRect} />
        <line x1={9} y1={13} x2={40} y2={13} className={styles.cardLine} />
        <rect x={9} y={21} width={26} height={9} rx={2} className={styles.bookingBar} />
      </g>

      <circle ref={routeRef} r={3.5} className={styles.dot} />
    </svg>
  );
}
