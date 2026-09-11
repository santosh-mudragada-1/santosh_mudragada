export type Role = {
  company: string;
  role: string;
  period: string;
  location: string;
  owned: string[];
};

// PLACEHOLDER — replace with real history. Names are intentionally generic.
export const EXPERIENCE: Role[] = [
  {
    company: 'Studio North',
    role: 'Lead Product Designer',
    period: '2023 — Now',
    location: 'Remote',
    owned: [
      'Design direction for two flagship products',
      'Design system and its rollout across web + mobile',
      'Hiring and mentoring a team of three',
    ],
  },
  {
    company: 'Fieldwork',
    role: 'Senior Product Designer',
    period: '2021 — 2023',
    location: 'Bengaluru',
    owned: [
      '0→1 onboarding and activation flows',
      'Research program with weekly customer sessions',
      'Motion and interaction guidelines',
    ],
  },
  {
    company: 'Northbound Labs',
    role: 'Product Designer',
    period: '2019 — 2021',
    location: 'Hyderabad',
    owned: [
      'End-to-end features across the core app',
      'Prototypes used to align engineering and PM',
      'Component library in Figma',
    ],
  },
];
