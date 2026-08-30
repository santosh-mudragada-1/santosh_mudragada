export const SITE = {
  name: 'Design with Santosh',
  fullName: 'Santosh Mudragada',
  role: 'Product Designer & Builder',
  // TODO(stage-3): confirm the public contact address before the Contact section.
  email: 'hello@designwithsantosh.com',
  url: 'https://designwithsantosh.com',
  description:
    'Portfolio of Santosh Mudragada — product designer and builder. Design, motion, interaction and shipping real products.',
} as const;

export const NAV_LINKS = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export const SOCIALS = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/santosh-mudragada' },
  { label: 'Instagram', href: 'https://instagram.com/santosh_mudragada' },
  { label: 'Read.cv', href: '#' },
] as const;
