'use client';

import { useRef } from 'react';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { DestCard } from './DestCard';
import { DEST_CARDS, EXTRA_IMAGES } from './cards';
import styles from './FoundReveal.module.scss';

type Point = { n: string; statement: string; body: string };

const toRad = (deg: number) => (deg * Math.PI) / 180;

// A pre-parsed elastic-pop ease, reused as a plain function of a 0–1 input —
// no tween object needed since every scene here is pure scroll-position math.
const POP_EASE = gsap.parseEase('back.out(1.6)');

// Each scene resolves to its final, settled composition by this fraction of
// its point's own progress, then just holds — the "transitional gap" before
// the next point's trigger takes over starts here, not at progress 1.
// `makeSettle` takes that fraction per scene rather than sharing one value.
// Flow and scroll (scenes 1 and 2) settle almost at the very end (0.95): an
// earlier 0.6 finished the animation while the point was still centred,
// leaving a long, visibly empty hold before the point even started to
// leave — stretching it out means each is still actively animating right up
// until its point is nearly off-screen. Fan (scene 3) is unchanged at 0.6
// for now.
const makeSettle = (settleAt: number) => (raw: number) => gsap.utils.clamp(0, 1, raw / settleAt);

/**
 * "What we found" — one card stage on the right, pinned via CSS
 * `position: sticky` (the same mechanism Feed2FlyScroll's phone column
 * uses), while three plain text points scroll past normally on the left.
 *
 * Each point owns a fully independent `ScrollTrigger` — its own `top bottom`
 * → `top top` range (exactly one viewport-height, starting the instant the
 * point begins rising into view and ending the instant it arrives at the
 * top) and its own scene function. There is no shared timeline: point 1's
 * trigger is the only thing that can move card transforms while it's
 * active, and it goes fully idle (no more `onUpdate` calls) the moment
 * scroll passes its `end`, which is the exact scroll position point 2's
 * trigger starts at — so scene 1 has genuinely finished (see `SETTLE_AT`)
 * before scene 2 can begin, and there's never a moment where two scenes are
 * both driving the cards. Scrolling back up runs the same math backwards, so
 * every scene reverses exactly.
 *
 * madewithgsap.com's tutorial068 / 072 / 075 are member-gated, so this reads
 * their public written mechanism, not their source — each is a single,
 * finite pass (not a perpetual loop) so it has a real start and a real
 * resolved end:
 *  - flow (068) — each card makes one pass along the same path, bottom
 *    centre to top right, as a real 3D card flip: `rotationX` sweeps
 *    -90 (edge-on) → 0 (front-facing, at the path's midpoint) → 90 (edge-on),
 *    with a small `rotationY` wobble so it doesn't read as a flat mechanical
 *    flip. Cards are staggered along that sweep so only a handful are ever
 *    in flight; the stagger and total range are sized so the LAST card also
 *    reaches +90 (fully exited) by the settle point — the pass ends empty.
 *  - scroll (072) — cards and plain photos all travel the same right→left
 *    path, through a "hole" at the stage's right edge (zooming in from
 *    nothing) to one centre-left (zooming back out to nothing), peaking at
 *    full size at dead centre — no rotation, and kept to a tight band around
 *    the vertical centre rather than scattered top-to-bottom. Every item
 *    shares one window length (a per-item speed difference is what used to
 *    make the crossing read as two separate sets), staggered by a moderate
 *    spread around the same centre-point — offset enough that items are
 *    visibly at different stages of the crossing, but the window is wider
 *    than that spread, so several are always overlapping and a crowd is on
 *    screen at once, not everyone in dead unison. Depth still varies per
 *    item, but only for size now (small "back" vs. large "front") — not
 *    speed.
 *  - fan (075) — a deck waits stacked at the centre, only the first card
 *    showing (z-index keeps earlier cards on top while unentered ones still
 *    share that same stacked spot). `active = progress * N` is how many
 *    cards have started entering; a card's own entry (0–1, back-eased for
 *    the pop) blends it from the stacked pose to a slot on a real arc that
 *    pivots from below the deck — the centre card ends up highest, and the
 *    arc droops toward each edge, like a real hand of cards, not a rainbow
 *    bulging upward. Because the arc's angle-per-card is computed from the
 *    *current* (fractional) active count, every already-seated card keeps
 *    sliding to a wider slot as each new one joins — the fan reorganises
 *    itself live rather than revealing fixed final positions one by one.
 *
 * All three scenes run at every viewport size (down to small phones), not
 * just desktop — every distance in each scene's math is a fraction of the
 * *measured* stage box (`sceneBox`, re-read on every ScrollTrigger refresh)
 * rather than a fixed px/rem value, so the same code scales itself down on a
 * narrower stage instead of overlapping. The stage's own CSS size, and the
 * card/photo sizes, shrink at the `lg` breakpoint (see FoundReveal.module.scss)
 * so there's enough headroom in a narrower box for cards to keep clearing
 * each other mid-animation instead of merging together.
 */
export function FoundReveal({ points }: { points: Point[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reduced) return;
      const q = gsap.utils.selector(root);
      const pointEls = q<HTMLElement>(`.${styles.point}`);
      const cardEls = q<HTMLElement>('[data-card]');
      const extraEls = q<HTMLElement>('[data-extra-img]');
      if (!pointEls.length || !cardEls.length) return;

      const N = cardEls.length;

      // `.stage`'s own box (the actual visible, clipped viewport — not the
      // smaller centred `.scene` box inside it) defines the travel path in
      // real pixels, so "bottom"/"top"/"right" mean the real edges of the
      // visible stage. Re-measured on every ScrollTrigger refresh (see
      // below) so a resize doesn't leave the path pinned to a stale box.
      const sceneEl = q<HTMLElement>(`.${styles.stage}`)[0];
      let sceneBox = { w: 0, h: 0 };
      const measureScene = () => {
        const r = sceneEl.getBoundingClientRect();
        sceneBox = { w: r.width, h: r.height };
      };
      measureScene();

      // ---- scene 1: flow — each card makes one pass along the same path,
      // starting a little left of centre at the bottom and finishing top
      // right (5% clear of the top/bottom edges), and is a real 3D card flip
      // rather than an in-plane tilt: `rotationX` sweeps -90 (edge-on,
      // invisible) → 0 (front-facing, at the path's midpoint) → 90 (edge-on
      // again), so the "reveal" comes from actual foreshortening, not a
      // faked opacity window. A small `rotationY` wobble keeps it from
      // feeling like a flat mechanical flip. Cards are staggered by
      // `spacing` degrees along that same -90→90 sweep; `spacing` is wide
      // enough that only a handful are ever in flight together, and
      // `totalRange` is sized so the LAST card also reaches +90 (fully
      // exited) by the settle point — the pass finishes empty, not with a
      // card parked front-and-centre.
      const FLOW_PAD_V = 0.05; // 5% clearance from the top/bottom edges
      const FLOW_PAD_H = 0; // no clearance — ends flush with the right edge
      const FLOW_START_X = 0.25; // start well left of centre
      // Spaced wide enough (relative to the path's length vs. a card's own
      // size) that two cards' opaque, near-full-scale poses never overlap —
      // that overlap is what previously read as cards "merging".
      const FLOW_SPACING = 80; // degrees between each card's pass
      const FLOW_RANGE = 180 + FLOW_SPACING * (N - 1); // last card exits at p=1
      const settleFlow = makeSettle(0.95);
      function applyFlow(raw: number) {
        const p = settleFlow(raw);
        const startX = -FLOW_START_X * sceneBox.w;
        const startY = sceneBox.h / 2 - FLOW_PAD_V * sceneBox.h; // + = below centre
        const endX = sceneBox.w / 2 - FLOW_PAD_H * sceneBox.w; // + = right of centre
        const endY = -startY;
        cardEls.forEach((el, i) => {
          const rawDeg = -90 - i * FLOW_SPACING + p * FLOW_RANGE;
          const deg = gsap.utils.clamp(-90, 90, rawDeg);
          const t = gsap.utils.mapRange(-90, 90, 0, 1, deg);
          const front = Math.cos(toRad(deg)); // 1 at centre, 0 at either edge
          // Fades out over a wide 35°-55°→90° band (not a hard cut right at
          // the boundary) so the card is already nearly invisible by the
          // time it would otherwise be sliced by the stage's clipped edge.
          const opacity = gsap.utils.clamp(0, 1, gsap.utils.mapRange(90, 55, 0, 1, Math.abs(deg)));
          gsap.set(el, {
            x: gsap.utils.interpolate(startX, endX, t),
            y: gsap.utils.interpolate(startY, endY, t),
            // -50 is the card's own centering offset (replaces the CSS
            // translate(-50%,-50%) once GSAP owns the transform).
            xPercent: -50,
            yPercent: -50,
            rotationX: deg,
            rotationY: gsap.utils.mapRange(-90, 90, -5, 5, deg),
            rotation: 0,
            z: 0,
            scale: 0.7 + 0.3 * front,
            opacity,
          });
        });
      }

      // ---- scene 2: scroll — cards and plain photos travel right→left
      // through two fixed points: a "hole" just past the stage's right edge
      // (where each item zooms in from nothing) and one centre-left (where
      // it zooms back out to nothing). Every item takes that exact same
      // horizontal path — no rotation, no vertical drift beyond its own
      // random height — and hits its OWN peak size at dead centre, same as
      // every other item; what differs per item is a random depth, which
      // sets how big that peak is (small "back" items vs. large "front"
      // ones) and how fast it crosses the whole path (back = fast, front =
      // slow), so the crossing reads as real parallax, not everyone in
      // lockstep on one conveyor.
      const scrollEls = [...cardEls, ...extraEls];
      const SCROLL_RIGHT_X = 0.5; // the right-hand hole: flush with the stage's right edge
      const SCROLL_LEFT_X = -0.25; // the left-hand hole: centre-left, not the far edge
      // One shared window LENGTH for everyone — a per-item speed difference
      // is what previously made the crossing read as two separate sets
      // arriving at different times. But identical start times pancaked
      // everyone into one dead-unison stack. The middle ground: every item
      // gets the same-length window, staggered by a moderate, centred spread
      // — wide enough that items are visibly offset (some entering while
      // others are already at peak or exiting), but the window itself is
      // wider than that spread, so at any moment several items' windows are
      // still overlapping and a crowd is on screen together, the way the
      // reference board always has multiple photos in flight at once.
      const SCROLL_WINDOW = 0.5;
      const SCROLL_START = 0.5 - SCROLL_WINDOW / 2;
      const scrollMeta = scrollEls.map(() => {
        const depth = gsap.utils.random(0, 1); // 0 = small/"back", 1 = large/"front" — size only now
        return {
          windowLen: SCROLL_WINDOW,
          startTime: gsap.utils.clamp(
            0,
            1 - SCROLL_WINDOW,
            SCROLL_START + gsap.utils.random(-0.2, 0.2),
          ),
          peakScale: gsap.utils.mapRange(0, 1, 0.35, 1, depth),
          // Kept close to the vertical centre — a tight band, not scattered
          // top-to-bottom of the stage.
          targetYFrac: gsap.utils.random(-0.15, 0.15),
        };
      });
      const settleScroll = makeSettle(0.95);
      function applyScroll(raw: number) {
        const p = settleScroll(raw);
        scrollEls.forEach((el, i) => {
          const m = scrollMeta[i];
          const local = gsap.utils.clamp(0, 1, (p - m.startTime) / m.windowLen);
          const envelope = Math.sin(local * Math.PI); // 0 at both holes, 1 at dead centre
          gsap.set(el, {
            x: gsap.utils.interpolate(SCROLL_RIGHT_X, SCROLL_LEFT_X, local) * sceneBox.w,
            y: m.targetYFrac * sceneBox.h,
            xPercent: -50,
            yPercent: -50,
            rotationX: 0,
            rotationY: 0,
            rotation: 0,
            z: 0,
            scale: m.peakScale * envelope,
            opacity: envelope,
          });
        });
      }

      // ---- scene 3: fan — deck waits centred (just the first card showing),
      // pops open one at a time into a hand-of-cards arc: cards pivot from a
      // point below the deck, so the centre card sits highest and the arc
      // droops toward each edge, matching a real fanned hand rather than a
      // rainbow bulging upward.
      const settleFan = makeSettle(0.6);
      function applyFan(raw: number) {
        const progress = settleFan(raw);
        const active = gsap.utils.clamp(0.0001, N, progress * N);
        const slots = Math.max(active, 1);
        const denom = Math.max(slots - 1, 1);
        const spread = gsap.utils.mapRange(1, N, 20, 52, slots);
        // A fraction of the stage's own measured width/height rather than a
        // fixed rem value, so the fan's spread — and the small pre-entry
        // stack offset — scale down together with the stage on a narrower
        // (tablet/phone) box instead of overflowing it.
        const radius = sceneBox.w * 0.28;
        const stackOffset = sceneBox.h * 0.05;

        cardEls.forEach((el, i) => {
          const enter = POP_EASE(gsap.utils.clamp(0, 1, active - i));
          const angleDeg = gsap.utils.mapRange(0, denom, -spread / 2, spread / 2, i);
          const rad = toRad(angleDeg);

          const fanX = Math.sin(rad) * radius;
          const fanY = (1 - Math.cos(rad)) * radius * 0.9;

          const x = gsap.utils.interpolate(0, fanX, enter);
          const y = gsap.utils.interpolate(stackOffset, fanY, enter);
          const rotation = gsap.utils.interpolate(i * 1.4, angleDeg, enter);
          const scale = gsap.utils.interpolate(0.74, 1, enter);

          gsap.set(el, {
            x,
            y,
            rotation,
            scale,
            xPercent: -50,
            yPercent: -50,
            rotationY: 0,
            z: 0,
            opacity: 1,
            // While unentered cards still sit stacked at centre, earlier
            // cards (the ones already "dealt") stay on top of later ones —
            // otherwise document order would put the LAST card frontmost at
            // rest, hiding the first (red) card the deck is meant to open
            // from.
            zIndex: N - i,
          });
        });
      }

      const scenes = [applyFlow, applyScroll, applyFan];
      const triggers = pointEls.slice(0, scenes.length).map((pointEl, i) =>
        ScrollTrigger.create({
          trigger: pointEl,
          // A point's window is the viewport-height stretch while it's
          // rising into place: from the instant its top clears the bottom
          // of the viewport (it starts appearing) to the instant its top
          // reaches the top of the viewport (it arrives / the next point's
          // own window starts at that exact scroll position) — so the scene
          // starts the moment the point is first visible, not once it's
          // already centred, and adjacent points never both hold the cards.
          // TEMP: shifted +50vh later per debug-marker feedback.
          start: () => `top bottom-=${window.innerHeight * 0.5}`,
          end: () => `top top-=${window.innerHeight * 0.5}`,
          scrub: 0.3,
          onUpdate: (self) => scenes[i](self.progress),
          onEnter: () => scenes[i](0),
          onEnterBack: () => scenes[i](1),
          onLeave: () => scenes[i](1),
          onLeaveBack: () => scenes[i](0),
        }),
      );

      ScrollTrigger.addEventListener('refresh', measureScene);
      scenes[0](0);
      ScrollTrigger.refresh();

      // TEMP DEBUG — remove once trigger boundaries are settled. Draws a
      // green line at each point's trigger start and a red line at its end,
      // each labelled with the point number, so the exact scroll positions
      // can be called out and adjusted precisely.
      const debugEls: HTMLElement[] = [];
      const drawMarkers = () => {
        debugEls.forEach((el) => el.remove());
        debugEls.length = 0;
        triggers.forEach((st, i) => {
          ([
            ['start', st.start, '#22c55e'],
            ['end', st.end, '#ef4444'],
          ] as const).forEach(([kind, y, color]) => {
            const line = document.createElement('div');
            line.style.cssText = `position:absolute;left:0;right:0;top:${y}px;height:2px;background:${color};z-index:99999;pointer-events:none;`;
            const tag = document.createElement('span');
            tag.textContent = `0${i + 1} ${kind}`;
            tag.style.cssText = `position:absolute;left:12px;top:${kind === 'start' ? '-22px' : '4px'};background:${color};color:#fff;font:700 11px/1.4 monospace;padding:2px 8px;border-radius:3px;white-space:nowrap;`;
            line.appendChild(tag);
            document.body.appendChild(line);
            debugEls.push(line);
          });
        });
      };
      drawMarkers();
      ScrollTrigger.addEventListener('refresh', drawMarkers);

      return () => {
        ScrollTrigger.removeEventListener('refresh', drawMarkers);
        ScrollTrigger.removeEventListener('refresh', measureScene);
        debugEls.forEach((el) => el.remove());
        triggers.forEach((t) => t.kill());
        gsap.set(cardEls, { clearProps: 'all' });
        gsap.set(extraEls, { clearProps: 'all' });
      };
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <div ref={rootRef} className={styles.reveal}>
      <div className={styles.grid}>
        <div className={styles.track}>
          <div className={styles.leadIn} aria-hidden />
          {points.map((p) => (
            <div key={p.n} className={styles.point}>
              <div className={styles.pointInner}>
                <span className={styles.pointN}>{p.n}</span>
                <p className={styles.pointStatement}>{p.statement}</p>
                <p className={styles.pointBody}>{p.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.stage}>
          <div className={styles.scene}>
            {DEST_CARDS.map((c) => (
              <DestCard key={c.city} card={c} />
            ))}
            {EXTRA_IMAGES.map((img, i) => (
              <div
                key={`${img.src}-${i}`}
                data-extra-img
                className={styles.extraImg}
                style={{ aspectRatio: img.ratio }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt="" loading="lazy" decoding="async" draggable={false} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
