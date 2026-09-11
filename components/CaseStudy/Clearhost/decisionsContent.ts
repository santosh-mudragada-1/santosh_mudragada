/**
 * §5 · "Product design & decisions" — content + config layer.
 *
 * Four rules the interface had to encode so a host lands on a valid rate-plan
 * configuration without reading a manual. Ported from four Framer prototypes and
 * re-voiced first-person (Santosh), in the portfolio's paper / ink / orange shell.
 *
 *   1. dorm      — Dormitory-specific pricing        · interactive
 *   2. rateplan  — Progressive rate-plan creation    · scroll story  (needs images)
 *   3. occupancy — Context-aware pricing             · scroll story  (needs images)
 *   4. stayrules — Preventing invalid configurations · interactive
 *
 * ── IMAGES ────────────────────────────────────────────────────────────────────
 * The two scroll stories fall back to a themed SVG mock until real screenshots
 * exist. To wire the real ones: drop files into
 *   /public/clearhost/decisions/
 * and set `problemImage` / `solutionImage` on `rateplanStory` / `occupancyStory`
 * below (16:10, ~1600×1000). Everything else — zoom targets, annotation copy and
 * placement — is already tuned against the mock and can be nudged after.
 */

export const decisionsIntro = {
  title: 'Designing the rules,',
  titleAccent: 'not just the screens.',
  lede: 'Rate plans are where hospitality software usually asks the host to already think like the software. Four moments where I pushed the rule into the interface instead. An invalid configuration is hard to reach, and obvious when you are near one.',
} as const;

export interface DecisionMeta {
  id: string;
  n: string;
  aspect: string;
  /** The call, in one line. */
  call: string;
}

export const decisionOrder: DecisionMeta[] = [
  {
    id: 'dorm',
    n: '01',
    aspect: 'Dormitory-specific pricing',
    call: 'A shared dorm is sold per bed, so “per room” pricing removes itself instead of erroring later.',
  },
  {
    id: 'rateplan',
    n: '02',
    aspect: 'Progressive rate-plan creation',
    call: 'A derived plan needs a base plan to exist first, so the first plan is always standalone: locked, not asked.',
  },
  {
    id: 'occupancy',
    n: '03',
    aspect: 'Context-aware pricing modes',
    call: 'Choose the occupancy first; the pricing modes that cannot apply are never offered.',
  },
  {
    id: 'stayrules',
    n: '04',
    aspect: 'Preventing invalid configurations',
    call: 'The system never rewrites what the host typed; it flags what is wrong, says why, and leaves the fix to them.',
  },
];

/* ── 1 · Dormitory-specific pricing (interactive) ───────────────────────────── */
export const dormRule = {
  story: [
    { k: 'Problem', v: 'Dormitories ran through the same pricing workflow as private rooms.' },
    { k: 'Insight', v: 'A shared dormitory is sold per bed, never per room.' },
    { k: 'Solution', v: 'Per-room pricing disables itself the moment room type becomes Dormitory.' },
    { k: 'Result', v: 'The host only ever sees a pricing option that can actually be saved.' },
  ],
  hint: 'Try switching',
  helperTitle: 'Business rule',
  helperBody: 'Dormitories are sold per bed, so only per-person pricing is supported.',
  autoCorrectLabel: 'Auto-corrected',
  roomTypes: [
    { value: 'private', label: 'Private room' },
    { value: 'dorm', label: 'Shared dormitory' },
  ],
  pricing: [
    { value: 'room', label: 'Per room' },
    { value: 'person', label: 'Per person' },
  ],
  compare: {
    private: { head: 'Private room', rows: [
      { label: 'Per room', allowed: true },
      { label: 'Per person', allowed: true },
    ] },
    dorm: { head: 'Dormitory', rows: [
      { label: 'Per room', allowed: false },
      { label: 'Per person', allowed: true },
    ] },
  },
} as const;

/* ── 4 · Preventing invalid configurations (interactive) ────────────────────── */
export const stayRules = {
  panelTitle: 'Stay rules',
  panelSubtitle: 'Booking constraints for this rate plan',
  fields: [
    {
      key: 'msa',
      title: 'Minimum stay on arrival',
      sub: 'Nights · applies on the arrival date',
      error: 'Minimum stay on arrival must be at least 1 night.',
    },
    {
      key: 'mst',
      title: 'Minimum stay through',
      sub: 'Nights · applies across the stay',
      error: 'Minimum stay through must be at least 1 night.',
    },
    {
      key: 'mxs',
      title: 'Maximum stay',
      sub: 'Nights · upper bound',
      error: 'Maximum stay must be greater than or equal to both minimum-stay values.',
    },
  ],
  noLimit: { title: 'No limit', sub: 'Skip maximum-stay validation' },
  success: 'Configuration ready',
  /** Starting values — maximumStay begins invalid on purpose, to show the story. */
  defaults: { msa: 2, mst: 3, mxs: 1 },
} as const;

/* ── SVG mock placeholders (paper / ink / orange) ──────────────────────────── */
const svgUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const RATEPLAN_PROBLEM = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">
  <rect width="1600" height="1000" fill="#efe9df"/>
  <rect x="40" y="40" width="1520" height="920" rx="22" fill="#f7f3ec" stroke="#d8cfbe" stroke-width="2"/>
  <line x1="40" y1="118" x2="1560" y2="118" stroke="#e3dccc" stroke-width="2"/>
  <circle cx="84" cy="79" r="7" fill="#e7b7a3"/><circle cx="112" cy="79" r="7" fill="#eecf9a"/><circle cx="140" cy="79" r="7" fill="#a9cbb0"/>
  <text x="188" y="88" font-family="Inter, sans-serif" font-size="26" fill="#7c7568">ClearHost · Rate plans</text>
  <rect x="40" y="118" width="250" height="842" fill="#f0ebe1"/>
  <line x1="290" y1="118" x2="290" y2="960" stroke="#e3dccc" stroke-width="2"/>
  <text x="340" y="196" font-family="Inter, sans-serif" font-size="42" font-weight="700" fill="#14110d">Create rate plan</text>
  <text x="340" y="300" font-family="Inter, sans-serif" font-size="24" fill="#7c7568">Plan name</text>
  <rect x="340" y="318" width="780" height="54" rx="10" fill="#fff" stroke="#cfc6b4" stroke-width="2"/>
  <rect x="320" y="410" width="560" height="196" rx="16" fill="#ffe6d9" stroke="#ff8a63" stroke-width="2"/>
  <text x="346" y="452" font-family="Inter, sans-serif" font-size="24" font-weight="600" fill="#d43a0b">Rate plan type</text>
  <circle cx="366" cy="506" r="13" fill="#ff4d1a"/><circle cx="366" cy="506" r="5" fill="#fff"/>
  <text x="398" y="515" font-family="Inter, sans-serif" font-size="26" fill="#14110d">Standalone</text>
  <circle cx="366" cy="556" r="13" fill="#fff" stroke="#b7afa1" stroke-width="2"/>
  <text x="398" y="565" font-family="Inter, sans-serif" font-size="26" fill="#4a453d">Derived</text>
</svg>`);

const RATEPLAN_SOLUTION = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">
  <rect width="1600" height="1000" fill="#efe9df"/>
  <rect x="40" y="40" width="1520" height="920" rx="22" fill="#f7f3ec" stroke="#d8cfbe" stroke-width="2"/>
  <line x1="40" y1="118" x2="1560" y2="118" stroke="#e3dccc" stroke-width="2"/>
  <text x="80" y="88" font-family="Inter, sans-serif" font-size="26" fill="#7c7568">Rate plans</text>
  <text x="80" y="196" font-family="Inter, sans-serif" font-size="36" font-weight="700" fill="#14110d">Rate plans</text>
  <rect x="80" y="240" width="900" height="56" rx="10" fill="#efe9df"/>
  <rect x="80" y="312" width="900" height="56" rx="10" fill="#fff" stroke="#e3dccc" stroke-width="2"/>
  <rect x="104" y="258" width="220" height="20" rx="6" fill="#cfc6b4"/>
  <rect x="1040" y="118" width="520" height="842" fill="#fbf8f2"/>
  <line x1="1040" y1="118" x2="1040" y2="960" stroke="#e3dccc" stroke-width="2"/>
  <text x="1084" y="188" font-family="Inter, sans-serif" font-size="34" font-weight="700" fill="#14110d">New rate plan</text>
  <text x="1084" y="256" font-family="Inter, sans-serif" font-size="22" fill="#7c7568">Type</text>
  <rect x="1084" y="274" width="420" height="58" rx="12" fill="#efe9df" stroke="#d8cfbe" stroke-width="2"/>
  <text x="1108" y="311" font-family="Inter, sans-serif" font-size="26" font-weight="600" fill="#14110d">Standalone</text>
  <rect x="1380" y="288" width="110" height="32" rx="16" fill="#ffe6d9"/>
  <text x="1400" y="310" font-family="Inter, sans-serif" font-size="18" fill="#d43a0b">Locked</text>
  <text x="1084" y="392" font-family="Inter, sans-serif" font-size="22" fill="#7c7568">Plan name</text>
  <rect x="1084" y="410" width="420" height="58" rx="12" fill="#fff" stroke="#cfc6b4" stroke-width="2"/>
</svg>`);

const OCCUPANCY_PROBLEM = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">
  <rect width="1600" height="1000" fill="#efe9df"/>
  <rect x="40" y="40" width="1520" height="920" rx="22" fill="#f7f3ec" stroke="#d8cfbe" stroke-width="2"/>
  <line x1="40" y1="126" x2="1560" y2="126" stroke="#e3dccc" stroke-width="2"/>
  <text x="80" y="94" font-family="Inter, sans-serif" font-size="30" font-weight="700" fill="#14110d">Create rate plan</text>
  <text x="80" y="210" font-family="Inter, sans-serif" font-size="24" fill="#7c7568">Occupancy</text>
  <rect x="80" y="230" width="440" height="60" rx="12" fill="#efe9df" stroke="#d8cfbe" stroke-width="2"/>
  <text x="104" y="268" font-family="Inter, sans-serif" font-size="26" font-weight="600" fill="#14110d">2 adults</text>
  <text x="490" y="268" font-family="Inter, sans-serif" font-size="22" fill="#b7afa1">▾</text>
  <text x="80" y="366" font-family="Inter, sans-serif" font-size="24" font-weight="600" fill="#4a453d">Pricing mode</text>
  <text x="80" y="398" font-family="Inter, sans-serif" font-size="18" fill="#b7afa1">All options shown regardless of occupancy</text>
  <g font-family="Inter, sans-serif" font-size="24" fill="#14110d">
    <rect x="80" y="426" width="720" height="66" rx="12" fill="#fff" stroke="#e3dccc" stroke-width="2"/><text x="108" y="467">Per person</text>
    <rect x="80" y="506" width="720" height="66" rx="12" fill="#fff" stroke="#e3dccc" stroke-width="2"/><text x="108" y="547">Per room</text>
    <rect x="80" y="586" width="720" height="66" rx="12" fill="#fff" stroke="#e3dccc" stroke-width="2"/><text x="108" y="627">Per occupancy tier</text>
    <rect x="80" y="666" width="720" height="66" rx="12" fill="#fff" stroke="#e3dccc" stroke-width="2"/><text x="108" y="707">Length-of-stay pricing</text>
    <rect x="80" y="746" width="720" height="66" rx="12" fill="#fff" stroke="#e3dccc" stroke-width="2"/><text x="108" y="787">Derived from base</text>
  </g>
  <rect x="860" y="426" width="660" height="386" rx="16" fill="#f0ebe1" stroke="#e3dccc" stroke-width="2"/>
  <text x="892" y="476" font-family="Inter, sans-serif" font-size="22" fill="#b7afa1">Preview</text>
</svg>`);

const OCCUPANCY_SOLUTION = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">
  <rect width="1600" height="1000" fill="#efe9df"/>
  <rect x="40" y="40" width="1520" height="920" rx="22" fill="#f7f3ec" stroke="#d8cfbe" stroke-width="2"/>
  <line x1="40" y1="126" x2="1560" y2="126" stroke="#e3dccc" stroke-width="2"/>
  <text x="80" y="94" font-family="Inter, sans-serif" font-size="30" font-weight="700" fill="#14110d">Create rate plan</text>
  <text x="80" y="210" font-family="Inter, sans-serif" font-size="24" fill="#7c7568">Occupancy</text>
  <rect x="80" y="230" width="440" height="60" rx="12" fill="#ffe6d9" stroke="#ff8a63" stroke-width="2"/>
  <text x="104" y="268" font-family="Inter, sans-serif" font-size="26" font-weight="600" fill="#d43a0b">2 adults</text>
  <text x="80" y="366" font-family="Inter, sans-serif" font-size="24" font-weight="600" fill="#4a453d">Pricing mode</text>
  <text x="80" y="398" font-family="Inter, sans-serif" font-size="18" fill="#3fa06b">Only valid options for this occupancy</text>
  <g font-family="Inter, sans-serif" font-size="24" fill="#14110d">
    <rect x="80" y="426" width="720" height="66" rx="12" fill="#fff" stroke="#bfe0c9" stroke-width="2"/><text x="108" y="467">Per person</text>
    <circle cx="760" cy="459" r="15" fill="#3fa06b"/>
    <rect x="80" y="506" width="720" height="66" rx="12" fill="#fff" stroke="#bfe0c9" stroke-width="2"/><text x="108" y="547">Per room</text>
    <circle cx="760" cy="539" r="15" fill="#3fa06b"/>
  </g>
  <rect x="80" y="606" width="720" height="120" rx="12" fill="#f0ebe1" stroke="#e3dccc" stroke-width="2" stroke-dasharray="6 6"/>
  <text x="108" y="674" font-family="Inter, sans-serif" font-size="20" fill="#b7afa1">Invalid options are not offered</text>
  <rect x="860" y="426" width="660" height="300" rx="16" fill="#f0ebe1" stroke="#e3dccc" stroke-width="2"/>
  <text x="892" y="476" font-family="Inter, sans-serif" font-size="22" fill="#b7afa1">Preview</text>
</svg>`);

/* ── 2 · Progressive rate-plan creation (scroll story) ──────────────────────────
   Real screenshots: Channex "Create Rate" (before) → ClearHost "Create Rate Plan"
   (after). The draw-on path rings the Manual / Derived toggle in the Channex form. */
export const rateplanStory = {
  id: 'decision-rateplan',
  problemImage: '/clearhost/decisions/rateplan-problem.webp',
  solutionImage: '/clearhost/decisions/rateplan-solution.webp',
  problemPlaceholder: RATEPLAN_PROBLEM,
  solutionPlaceholder: RATEPLAN_SOLUTION,
  problemLabel: 'Channex · Create rate',
  solutionLabel: 'ClearHost · Create rate plan',
  zoom: { x: 75, y: 28, scale: 2.0 },
  solutionZoom: { x: 75, y: 40, scale: 2.0 },
  paths: [
    {
      d:
        'M 1300 194 C 1457 194 1585 219 1585 250 C 1585 281 1457 306 1300 306 ' +
        'C 1143 306 1015 281 1015 250 C 1015 219 1143 194 1300 194 ' +
        'C 1370 194 1428 203 1476 217',
      strokeWidth: 6,
    },
  ],
  problemAnnotations: [
    {
      title: 'Problem',
      text: 'Users choose between Standalone and Derived before understanding the difference.',
      x: 50, y: 10, width: 300, placement: 'right' as const,
    },
    {
      title: 'Observation',
      text: 'Derived plans need a Standalone plan first.',
      x: 24, y: 76, width: 260, placement: 'bottom' as const,
    },
  ],
  solutionAnnotations: [
    {
      title: 'Solution',
      text: 'The first rate plan is automatically created as Standalone.',
      x: 5, y: 12, width: 290, placement: 'right' as const,
    },
    {
      title: 'Result',
      text: 'Reduced cognitive load and a more guided setup experience.',
      x: 5, y: 64, width: 290, placement: 'right' as const,
    },
  ],
  scrollLength: 3000,
} as const;

/* ── 3 · Context-aware pricing modes (scroll story) ─────────────────────────────
   Real screenshots: Channex "Rate Logic" with the Choose-Type dropdown open, every
   mode listed (before) → ClearHost "Adjust from primary occupancy" with only the
   valid modes per row (after). Strikes cross the two modes that cannot apply below
   primary occupancy. */
export const occupancyStory = {
  id: 'decision-occupancy',
  problemImage: '/clearhost/decisions/occupancy-problem.webp',
  solutionImage: '/clearhost/decisions/occupancy-solution.webp',
  problemPlaceholder: OCCUPANCY_PROBLEM,
  solutionPlaceholder: OCCUPANCY_SOLUTION,
  problemLabel: 'Channex · Rate logic',
  solutionLabel: 'ClearHost · Adjust from primary occupancy',
  zoom: { x: 72, y: 45, scale: 1.8 },
  solutionZoom: { x: 68, y: 54, scale: 1.6 },
  overlays: [
    // the Choose-Type dropdown opens under "Rate Logic for 1 person"
    {
      src: '/clearhost/decisions/occupancy-dd-all.webp',
      phase: 'problem' as const,
      x: 66,
      y: 40.5,
      width: 15,
    },
    // ClearHost's per-row dropdowns — only the modes valid for that guest count
    {
      src: '/clearhost/decisions/occupancy-dd-decrease.webp',
      phase: 'solution' as const,
      x: 74,
      y: 49,
      width: 14,
    },
    {
      src: '/clearhost/decisions/occupancy-dd-increase.webp',
      phase: 'solution' as const,
      x: 74,
      y: 74,
      width: 14,
    },
  ],
  strikes: [
    { x: 66, y: 40.5, width: 14, height: 4, delay: 0 },
    { x: 66, y: 48, width: 14, height: 4, delay: 0.35 },
  ],
  problemAnnotations: [
    {
      title: 'Problem',
      text: 'Every pricing mode is shown even when the selected occupancy makes it invalid.',
      x: 50, y: 10, width: 320, placement: 'right' as const,
    },
  ],
  solutionAnnotations: [
    {
      title: 'Solution',
      text: 'Only pricing modes valid for the chosen occupancy remain; the rest disappear.',
      x: 5, y: 12, width: 320, placement: 'right' as const,
    },
  ],
  scrollLength: 3200,
} as const;
