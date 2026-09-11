'use client';

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from '@/lib/gsap/gsap';
import { useContactModal } from '@/lib/contact-modal';
import { useSmoothScroll } from '@/lib/smooth-scroll';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { useIsomorphicLayoutEffect } from '@/lib/hooks/useIsomorphicLayoutEffect';
import { Magnetic } from '@/components/Magnetic';
import { EASE, DUR } from '@/lib/motion/config';
import { ROLE_OPTIONS, PROJECT_OPTIONS } from './data';
import styles from './ContactModal.module.scss';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  role: ROLE_OPTIONS[0] as string,
  project: PROJECT_OPTIONS[0] as string,
  company: '',
  message: '',
};

export function ContactModal() {
  const { isOpen, close } = useContactModal();
  const reduced = usePrefersReducedMotion();
  const { stop, start } = useSmoothScroll();

  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const timersRef = useRef<number[]>([]);

  const clearPendingTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const field =
    <K extends keyof typeof EMPTY>(key: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  // reset to a blank slate each time it opens — also drops any timers left
  // over from a submit that was still in flight when the modal last closed
  useEffect(() => {
    if (isOpen) {
      clearPendingTimers();
      setForm(EMPTY);
      setStatus('idle');
      setErrorMsg('');
    }
  }, [isOpen]);

  // scroll lock + Escape, matching <Menu>'s convention
  useEffect(() => {
    if (!isOpen) return;
    document.documentElement.classList.add('contact-modal-open');
    stop();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.documentElement.classList.remove('contact-modal-open');
      start();
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, close, start, stop]);

  // focus the first field once the panel is in, and trap Tab inside it
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'input, select, textarea, button, [href]',
        ),
      ).filter((el) => !el.hasAttribute('disabled'));

    const raf = requestAnimationFrame(() => firstFieldRef.current?.focus());

    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener('keydown', onTab);

    return () => {
      cancelAnimationFrame(raf);
      panel.removeEventListener('keydown', onTab);
    };
  }, [isOpen]);

  // GSAP: staggered content reveal — a distinct target from the Framer-driven
  // backdrop/panel wrapper, so the two never fight over the same element.
  // Layout effect (runs before paint) so `.reveal` pieces never flash visible
  // before the fromTo sets their starting state. Plain `opacity` (not
  // `autoAlpha`) deliberately — autoAlpha's `visibility:hidden` blocks the
  // Name field's autofocus below until the tween actually starts ticking.
  useIsomorphicLayoutEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const pieces = root.querySelectorAll(`.${styles.reveal}`);
    if (!isOpen) {
      gsap.set(pieces, { clearProps: 'opacity,transform' });
      return;
    }
    if (reduced) {
      gsap.set(pieces, { opacity: 1, y: 0 });
      return;
    }
    const tl = gsap.timeline({ delay: 0.18 });
    tl.fromTo(
      pieces,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'expo.out',
        stagger: 0.055,
      },
    );
    return () => {
      tl.progress(1).kill();
    };
  }, [isOpen, reduced]);

  // crossfade the button label on every status change (idle -> sending ->
  // sent/error) — a distinct target from the reveal timeline above, so this
  // can react independently to the async submit below.
  useEffect(() => {
    if (!labelTextRef.current) return;
    gsap.fromTo(
      labelTextRef.current,
      { autoAlpha: 0, y: 6 },
      { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power2.out' },
    );
  }, [status]);

  // success state: icon pop -> ring + check stroke-draw (measured via
  // getTotalLength, not guessed) -> a soft radiating pulse -> copy reveal.
  // Layout effect — same FOUC concern as the reveal timeline above: this runs
  // before paint so the success copy never flashes visible pre-animation.
  useIsomorphicLayoutEffect(() => {
    if (status !== 'sent') return;
    const root = successRef.current;
    if (!root) return;
    const icon = root.querySelector<SVGSVGElement>(`.${styles.successIcon}`);
    const ring = root.querySelector<SVGCircleElement>(`.${styles.successRing}`);
    const pulse = root.querySelector<SVGCircleElement>(`.${styles.successPulse}`);
    const check = root.querySelector<SVGPolylineElement>(`.${styles.successCheck}`);
    const pieces = root.querySelectorAll(`.${styles.successReveal}`);

    if (reduced) {
      gsap.set([icon, ring, check, pulse].filter(Boolean), { clearProps: 'all' });
      gsap.set(pieces, { opacity: 1, y: 0 });
      return;
    }

    const ringLen = ring?.getTotalLength() ?? 0;
    const checkLen = check?.getTotalLength() ?? 0;
    if (ring) gsap.set(ring, { strokeDasharray: ringLen, strokeDashoffset: ringLen });
    if (check) gsap.set(check, { strokeDasharray: checkLen, strokeDashoffset: checkLen });
    if (icon) gsap.set(icon, { scale: 0.6, autoAlpha: 0, transformOrigin: '50% 50%' });
    if (pulse) gsap.set(pulse, { autoAlpha: 0, scale: 1, transformOrigin: '50% 50%' });
    gsap.set(pieces, { opacity: 0, y: 14 });

    const tl = gsap.timeline();
    if (icon) {
      tl.to(icon, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.8)' });
    }
    if (ring) {
      tl.to(ring, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.out' }, 0.15);
    }
    if (check) {
      tl.to(check, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, 0.5);
    }
    if (pulse) {
      tl.fromTo(
        pulse,
        { autoAlpha: 0.55, scale: 1 },
        { autoAlpha: 0, scale: 1.8, duration: 0.75, ease: 'power2.out' },
        0.55,
      );
    }
    tl.to(
      pieces,
      { opacity: 1, y: 0, duration: 0.55, ease: 'expo.out', stagger: 0.08 },
      0.7,
    );

    return () => {
      tl.kill();
    };
  }, [status, reduced]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: boolean; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Could not send — please try again.');
      }
      setStatus('sent');
      timersRef.current.push(window.setTimeout(() => close(), 2600));
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Could not send — please try again.');
      timersRef.current.push(window.setTimeout(() => setStatus('idle'), 3200));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="contact-modal"
          className={styles.root}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-heading"
        >
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.base }}
            onClick={close}
          />

          <motion.div
            ref={panelRef}
            layout
            className={styles.panel}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.99 }}
            transition={{ duration: DUR.slow, ease: EASE.quartInOut }}
          >
            <button
              type="button"
              className={styles.close}
              onClick={close}
              aria-label="Close"
              data-cursor-reveal
              data-cursor-sticky
            >
              <span aria-hidden />
              <span aria-hidden />
            </button>

            <div ref={contentRef} className={styles.content}>
              <div className={styles.intro}>
                <p className={`${styles.eyebrow} ${styles.reveal}`}>
                  — New project
                </p>
                <h2 id="contact-modal-heading" className={`${styles.heading} ${styles.reveal}`}>
                  Let&rsquo;s make
                  <br />
                  something
                  <span className={styles.square} aria-hidden />
                </h2>
                <p className={`${styles.sub} ${styles.reveal}`}>
                  A new product, a redesign, or a hard interaction problem
                  worth talking through. Fill this in and it comes straight
                  to my inbox — I read everything myself.
                </p>
              </div>

              {status === 'sent' ? (
                <div ref={successRef} className={styles.success}>
                  <svg
                    className={styles.successIcon}
                    viewBox="0 0 120 120"
                    width="88"
                    height="88"
                    aria-hidden
                  >
                    <circle className={styles.successPulse} cx="60" cy="60" r="50" />
                    <circle className={styles.successRing} cx="60" cy="60" r="50" />
                    <polyline
                      className={styles.successCheck}
                      points="40,61 53,75 82,45"
                    />
                  </svg>
                  <h3 className={`${styles.successTitle} ${styles.successReveal}`}>
                    Message sent.
                  </h3>
                  <p className={`${styles.successSub} ${styles.successReveal}`}>
                    I&rsquo;ll get back to you within two working days.
                  </p>
                </div>
              ) : (
              <form className={styles.form} onSubmit={submit}>
                <div className={styles.row}>
                  <label className={`${styles.field} ${styles.reveal}`}>
                    <span className={styles.label}>Name</span>
                    <input
                      ref={firstFieldRef}
                      required
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={field('name')}
                      placeholder="Your name"
                    />
                  </label>
                  <label className={`${styles.field} ${styles.reveal}`}>
                    <span className={styles.label}>Email</span>
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={field('email')}
                      placeholder="you@company.com"
                    />
                  </label>
                </div>

                <div className={styles.row}>
                  <label className={`${styles.field} ${styles.reveal}`}>
                    <span className={styles.label}>Phone (optional)</span>
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={field('phone')}
                      placeholder="+91 …"
                    />
                  </label>
                  <label className={`${styles.field} ${styles.selectField} ${styles.reveal}`}>
                    <span className={styles.label}>You are a</span>
                    <select value={form.role} onChange={field('role')}>
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className={styles.row}>
                  <label className={`${styles.field} ${styles.selectField} ${styles.reveal}`}>
                    <span className={styles.label}>This is</span>
                    <select value={form.project} onChange={field('project')}>
                      {PROJECT_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={`${styles.field} ${styles.reveal}`}>
                    <span className={styles.label}>Company (optional)</span>
                    <input
                      type="text"
                      autoComplete="organization"
                      value={form.company}
                      onChange={field('company')}
                      placeholder="Where you work"
                    />
                  </label>
                </div>

                <label className={`${styles.field} ${styles.reveal}`}>
                  <span className={styles.label}>Message (optional)</span>
                  <textarea
                    rows={3}
                    spellCheck={false}
                    value={form.message}
                    onChange={field('message')}
                    placeholder="What are you building?"
                  />
                </label>

                <div className={`${styles.submitRow} ${styles.reveal}`}>
                  <Magnetic strength={0.12} max={10}>
                    <button
                      type="submit"
                      className={styles.submit}
                      data-status={status}
                      disabled={status === 'sending'}
                      data-cursor="hi"
                      data-cursor-sticky
                    >
                      <span ref={labelTextRef} className={styles.submitLabel}>
                        {status === 'idle' && 'Send message'}
                        {status === 'sending' && 'Sending…'}
                        {status === 'error' && 'Try again'}
                      </span>
                    </button>
                  </Magnetic>
                  <span className={styles.reply} data-error={status === 'error' || undefined}>
                    {status === 'error' ? errorMsg : 'Replies within two working days'}
                  </span>
                </div>
              </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
