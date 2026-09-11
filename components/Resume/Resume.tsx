'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { DownloadResume } from './DownloadResume';
import {
  CERTIFICATIONS,
  CONTACT,
  EDUCATION,
  EXPERIENCE,
  PERSON,
  PROJECTS,
  SECTIONS,
  SKILLS,
  TOOLS,
} from './content';
import styles from './Resume.module.scss';

/**
 * /resume — a portfolio-native reading of Resume.pdf. Same paper / ink / orange
 * shell, type scale and motion language as the case studies. Layout: each block
 * is a two-column row — a big section title that sticks on the left while its
 * content scrolls past on the right. On small screens the columns stack and the
 * title is static. The PDF is the download (bottom-right, persistent).
 */
export function Resume() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const kill: Array<() => void> = [];

      // masthead: the name rides up inside its mask, line by line
      const nameLine = q<HTMLElement>(`.${styles.nameLine} > span`);
      if (nameLine.length) {
        if (reduced) {
          gsap.set(nameLine, { clearProps: 'transform' });
        } else {
          const tw = gsap.fromTo(
            nameLine,
            { yPercent: 115 },
            {
              yPercent: 0,
              duration: 1.05,
              ease: 'expo.out',
              stagger: 0.09,
              delay: 0.1,
            },
          );
          kill.push(() => {
            tw.kill();
            gsap.set(nameLine, { clearProps: 'transform' });
          });
        }
      }

      // one-shot reveals — transform + opacity only, no resting styles so the
      // page is readable before JS / under reduced motion / with JS off
      if (!reduced) {
        q<HTMLElement>(`.${styles.rise}`).forEach((el) => {
          const tw = gsap.from(el, {
            y: 24,
            autoAlpha: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          });
          kill.push(() => {
            tw.scrollTrigger?.kill();
            tw.kill();
          });
        });

        q<HTMLElement>(`.${styles.riseGroup}`).forEach((el) => {
          const items = Array.from(el.children) as HTMLElement[];
          if (!items.length) return;
          const tw = gsap.from(items, {
            y: 20,
            autoAlpha: 0,
            duration: 0.75,
            ease: 'power3.out',
            stagger: 0.06,
            scrollTrigger: { trigger: el, start: 'top 85%' },
          });
          kill.push(() => {
            tw.scrollTrigger?.kill();
            tw.kill();
          });
        });
      }

      ScrollTrigger.refresh();
      return () => kill.forEach((f) => f());
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <article ref={rootRef} className={styles.root}>
      {/* ================================================== MASTHEAD */}
      <header className={styles.masthead} data-nav-boundary>
        <div className={styles.shell}>
          <h1 className={styles.name} aria-label={PERSON.name}>
            {PERSON.nameLines.map((line) => (
              <span key={line} className={styles.nameLine}>
                <span>{line}</span>
              </span>
            ))}
          </h1>

          <div className={styles.grid}>
            <div className={styles.col1} aria-hidden />
            <div className={styles.col2}>
              <div className={`${styles.metaRow} ${styles.rise}`}>
                <span className={styles.metaLabel}>About</span>
                <ul className={styles.metaList}>
                  {PERSON.about.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <p className={`${styles.profile} ${styles.rise}`}>
                {PERSON.profile}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ================================================== EXPERIENCE */}
      <Section section={SECTIONS[0]}>
        {EXPERIENCE.map((job) => (
          <div key={job.company} className={`${styles.block} ${styles.rise}`}>
            <h3 className={styles.blockTitle}>{job.role}</h3>
            <p className={styles.factLine}>
              <span>{job.period}</span>
              <i aria-hidden />
              <span>{job.location}</span>
              <i aria-hidden />
              <span>
                {job.company}
                {job.companyNote ? (
                  <span className={styles.faded}> ({job.companyNote})</span>
                ) : null}
              </span>
            </p>
            <ul className={styles.notes}>
              {job.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      {/* ================================================== SELECTED WORK */}
      <Section section={SECTIONS[1]} emphasis>
        <div className={styles.projects}>
          {PROJECTS.map((project) => (
            <article
              key={project.name}
              className={`${styles.project} ${styles.rise}`}
            >
              <p className={styles.projectType}>{project.type}</p>
              <h3 className={styles.projectName}>{project.name}</h3>
              {project.descriptor ? (
                <p className={styles.projectDescriptor}>{project.descriptor}</p>
              ) : null}
              <ul className={styles.notes}>
                {project.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <Link
                href={project.caseStudyHref}
                className={styles.caseLink}
                data-cursor="link"
              >
                View Case Study
                <span className={styles.caseArrow} aria-hidden>
                  →
                </span>
              </Link>
            </article>
          ))}
        </div>
      </Section>

      {/* ================================================== EDUCATION */}
      <Section section={SECTIONS[2]}>
        <ul className={`${styles.entries} ${styles.riseGroup}`}>
          {EDUCATION.map((e) => (
            <li key={e.title} className={styles.entry}>
              <h3 className={styles.blockTitle}>{e.title}</h3>
              <p className={styles.factLine}>
                <span>{e.meta}</span>
                <i aria-hidden />
                <span>{e.subtitle}</span>
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ================================================== CERTIFICATIONS */}
      <Section section={SECTIONS[3]}>
        <ul className={`${styles.entries} ${styles.riseGroup}`}>
          {CERTIFICATIONS.map((e) => (
            <li key={e.title} className={styles.entry}>
              <h3 className={styles.blockTitle}>{e.title}</h3>
              <p className={styles.factLine}>
                <span>{e.subtitle}</span>
                <i aria-hidden />
                <span>{e.meta}</span>
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ================================================== SKILLS & TOOLS */}
      <Section section={SECTIONS[4]}>
        <div className={styles.subRows}>
          <div className={`${styles.subRow} ${styles.rise}`}>
            <span className={styles.metaLabel}>Skills</span>
            <ul className={styles.plainList}>
              {SKILLS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className={`${styles.subRow} ${styles.rise}`}>
            <span className={styles.metaLabel}>Tools</span>
            <ul className={styles.plainList}>
              {TOOLS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ================================================== CONTACT */}
      <Section section={SECTIONS[5]}>
        <ul className={`${styles.contactList} ${styles.riseGroup}`}>
          {CONTACT.map((c) => (
            <li key={c.label} className={styles.contactItem}>
              {c.href ? (
                <a
                  className={styles.contactValue}
                  href={c.href}
                  data-cursor="link"
                  {...(c.external
                    ? { target: '_blank', rel: 'noreferrer' }
                    : {})}
                >
                  {c.value}
                  <span className={styles.contactArrow} aria-hidden>
                    {c.external ? '↗' : '→'}
                  </span>
                </a>
              ) : (
                <span className={styles.contactValue}>{c.value}</span>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {/* pinned to the bottom-right of the résumé while it's on screen, then
          settles above the footer — it never rides over the footer */}
      <div className={styles.downloadDock}>
        <DownloadResume />
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section — sticky title on the left, content on the right; stacks on small  */
/*  screens (title static).                                                    */
/* -------------------------------------------------------------------------- */

function Section({
  section,
  children,
  emphasis,
}: {
  section: { id: string; label: string };
  children: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <section
      id={section.id}
      className={`${styles.section} ${emphasis ? styles.sectionEmphasis : ''}`}
      aria-labelledby={`${section.id}-title`}
    >
      <div className={styles.shell}>
        <div className={styles.grid}>
          <div className={styles.col1}>
            <h2 id={`${section.id}-title`} className={styles.sectionTitle}>
              {section.label}
            </h2>
          </div>
          <div className={styles.col2}>{children}</div>
        </div>
      </div>
    </section>
  );
}
