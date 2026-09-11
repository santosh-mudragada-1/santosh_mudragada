export const SITE = {
  name: 'Design with Santosh',
  fullName: 'Santosh Mudragada',
  role: 'Product Designer & Builder',
  email: 'hello@designwithsantosh.in',
  url: 'https://www.designwithsantosh.in',
  description:
    'Portfolio of Santosh Mudragada — product designer and builder. Design, motion, interaction and shipping real products.',
} as const;

// pre-filled mailto for the "Start a project" / direct-email links — a
// template the sender edits rather than a blank compose window.
const MAILTO_SUBJECT = "Let's build something";
const MAILTO_BODY = `Hi Santosh,

I checked out your portfolio and loved the [case study name] — great product thinking.

I'm reaching out because I'm [your role, e.g. founder / hiring manager / fellow designer] at [company or team].

Would love to connect about [a project, a role, mentorship — pick one]. Does [day and time] work for a quick call?

Best,
[Your name]
[Your email]`;

export const MAILTO_HREF = `mailto:${SITE.email}?subject=${encodeURIComponent(
  MAILTO_SUBJECT,
)}&body=${encodeURIComponent(MAILTO_BODY)}`;

export const NAV_LINKS = [
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export const SOCIALS = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/santosh-mudragada' },
  { label: 'Instagram', href: 'https://instagram.com/santosh_mudragada' },
  { label: 'Resume', href: '/resume' },
] as const;
