// Résumé content — the single source of truth is Resume.pdf. Nothing here is
// invented, reordered in meaning, or embellished; the page only re-sets it in
// the portfolio's own type and spacing. The PDF itself is the download
// (public/Santosh-Mudragada-Resume.pdf).

export const RESUME_PDF = '/Santosh-Mudragada-Resume.pdf';

export const PERSON = {
  name: 'Santosh Mudragada',
  nameLines: ['Santosh', 'Mudragada'],
  title: 'Product Designer',
  // small meta list shown next to the name (all from the PDF)
  about: [
    'Product Designer',
    'Rajahmundry, Andhra Pradesh',
    '3 years of experience',
  ],
  profile:
    'Product Designer with 3 years of experience creating B2B enterprise SaaS, AI, and Web3 products. Experienced in translating complex business requirements into intuitive digital experiences while collaborating closely with founders, product managers, and engineers.',
} as const;

export type ContactItem = {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
};

export const CONTACT: ContactItem[] = [
  { label: 'Phone', value: '+91 9291619999', href: 'tel:+919291619999' },
  {
    label: 'Email',
    value: 'santoshmudragada.uiux@gmail.com',
    href: 'mailto:santoshmudragada.uiux@gmail.com',
  },
  {
    label: 'Portfolio',
    value: 'santoshmudragada.framer.website',
    href: 'https://santoshmudragada.framer.website/',
    external: true,
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/santosh-mudragada',
    href: 'https://linkedin.com/in/santosh-mudragada/',
    external: true,
  },
];

export type Experience = {
  role: string;
  company: string;
  companyNote?: string;
  location: string;
  period: string;
  points: string[];
};

export const EXPERIENCE: Experience[] = [
  {
    role: 'Product Designer',
    company: 'Eth Elite',
    companyNote: 'formerly The Matrix Labs',
    location: 'Remote',
    period: 'Sept 2023 – Aug 2026',
    points: [
      'Delivered product experiences across enterprise SaaS, AI, and Web3 platforms from concept to implementation.',
      'Owned the product design of ClearHost, partnering with founders and engineers to define MVP scope, prioritize features, and improve complex hotel management workflows.',
      'Worked closely with founders and engineers to prioritize MVP features while balancing user needs, business goals, and technical feasibility.',
      'Collaborated with developers throughout implementation, refining interactions, validating technical feasibility, and reviewing production builds.',
      'Created reusable UI patterns and design systems in Figma to maintain consistency across multiple products.',
      'Contributed to product decisions by evaluating workflows and translating business requirements into intuitive user experiences.',
      'Supported the growth of the design team by interviewing, onboarding, reviewing work, and providing feedback to design interns.',
    ],
  },
];

export type Project = {
  name: string;
  descriptor?: string;
  type: string;
  points: string[];
  caseStudyHref: string;
};

export const PROJECTS: Project[] = [
  {
    name: 'ClearHost',
    descriptor: 'Property Management System and Channel Manager',
    type: 'Professional Project',
    points: [
      'Designed workflows for reservations, booking engine, room management, inventory, taxes, cancellation policies, reports, and channel management.',
      'Partnered with founders to prioritize MVP features and improve usability across complex operational workflows.',
      'Created user flows, wireframes, prototypes, and high-fidelity interfaces for an enterprise software platform.',
      'Worked with developers to refine interactions and ensure implementation quality.',
    ],
    caseStudyHref: '/work/clearhost',
  },
  {
    name: 'Nextrail',
    type: 'Mentorship Capstone Project',
    points: [
      'Led a team of 7 designers to build an AI-powered travel planning platform during a 4-month mentorship program.',
      'Defined the product vision and UX direction, including the AI-powered Feed2Fly trip planning experience.',
      'Conducted design reviews and maintained design consistency across the project.',
    ],
    caseStudyHref: '/work/nextrail',
  },
];

export type Entry = {
  title: string;
  subtitle: string;
  meta: string;
};

export const EDUCATION: Entry[] = [
  {
    title: 'Bachelor’s Degree in Aeronautical Engineering',
    subtitle: 'Hindustan Institute of Technology and Science',
    meta: '2017–2021',
  },
];

export const CERTIFICATIONS: Entry[] = [
  {
    title: 'UX Design Mentorship',
    subtitle: 'GrowthSchool',
    meta: '2025',
  },
  {
    title: 'Google UX Design Professional Certificate',
    subtitle: 'Coursera',
    meta: '2024',
  },
];

export const SKILLS = [
  'Product Design',
  'UX Design',
  'UI Design',
  'User Research',
  'Wireframing',
  'Prototyping',
  'Interaction Design',
  'Design Systems',
  'Responsive Design',
  'Accessibility',
];

export const TOOLS = [
  'Figma',
  'Framer',
  'Miro',
  'Rive',
  'Cursor',
  'Claude in VS Code',
  'Basics in Adobe Creative Suite',
  'After Effects',
];

export type Section = {
  id: string;
  label: string;
};

export const SECTIONS: Section[] = [
  { id: 'experience', label: 'Experience' },
  { id: 'selected-work', label: 'Selected Work' },
  { id: 'education', label: 'Education' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'skills-tools', label: 'Skills & Tools' },
  { id: 'contact', label: 'Contact' },
];
