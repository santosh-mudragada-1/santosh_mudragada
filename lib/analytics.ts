/**
 * My Analytics (https://my-analytics-ruby.vercel.app/p/portfolio).
 *
 * The SDK loads as a script tag (see app/layout.tsx), so this is just a typed,
 * fail-silent bridge to `window.myAnalytics`. Page views, sessions, referrers
 * and uncaught errors are automatic; these helpers add the portfolio's events.
 * Never pass form contents or personal details here.
 */
type Props = Record<string, string | number | boolean | null | undefined>;
type Client = {
  track: (name: string, props?: Props) => void;
  captureError: (error: unknown, props?: Props) => void;
};

declare global {
  interface Window {
    myAnalytics?: Client;
  }
}

export const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || 'https://my-analytics-ruby.vercel.app';

// The SDK script loads after the page is interactive, so events fired on first render
// (e.g. case_study_opened) wait here briefly until window.myAnalytics exists.
const pending: [keyof Client, unknown[]][] = [];
let waiting = false;

function call(method: keyof Client, args: unknown[]) {
  try {
    const client = typeof window === 'undefined' ? undefined : window.myAnalytics;
    if (client) return void (client[method] as (...a: unknown[]) => void)(...args);
    if (typeof window === 'undefined' || pending.length >= 50) return;
    pending.push([method, args]);
    if (waiting) return;
    waiting = true;
    let tries = 0;
    const timer = window.setInterval(() => {
      const ready = window.myAnalytics;
      if (ready || ++tries > 60) {
        window.clearInterval(timer);
        waiting = false;
        for (const [m, a] of pending.splice(0)) if (ready) (ready[m] as (...x: unknown[]) => void)(...a);
      }
    }, 250);
  } catch {
    // analytics must never affect the site
  }
}

export function track(name: string, props?: Props) {
  call('track', [name, props]);
}

export function captureError(error: unknown, props?: Props) {
  call('captureError', [error, props]);
}
