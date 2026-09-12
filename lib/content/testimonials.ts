// Testimonials — five people who worked alongside Santosh at TML, each
// paired with a custom illustration (public/testimonials/*.svg). Rendered as
// alternating profile / testimonial card pairs riding an infinite marquee.
//
// `full` is an array of paragraphs (kept as given) so multi-paragraph notes
// (Dharma, Sachin, Tushar) render as real paragraphs, not one run-on block.

export type Testimonial = {
  id: string;
  number: string;
  name: string;
  role: string;
  company: string;
  /** the short line shown on the profile card */
  summary: string;
  full: string[];
  illustration: string;
  /** the illustration's own background colour, for the profile card scrim */
  tone: 'dark' | 'peach';
};

const T = '/testimonials';

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'vanshika',
    number: '01',
    name: 'Vanshika Kejriwal',
    role: 'Manager',
    company: 'TML',
    summary:
      'Went beyond UI/UX to understand the product logic, workflows and calculations.',
    full: [
      "I highly recommend Santosh for his exceptional work on the ClearHost project. He went beyond UI/UX design by thoroughly understanding the product, reviewing workflows and documentation to grasp the underlying logic and calculations. His research-oriented approach helped him identify an issue with our API provider, which he proactively pointed out. Combined with his ability to design clean, intuitive user experiences, his attention to detail and ownership made him a key contributor to the project's success.",
    ],
    illustration: `${T}/Vanshika.svg`,
    tone: 'dark',
  },
  {
    id: 'dharma',
    number: '02',
    name: 'Dharma Reddy',
    role: 'Co-Designer',
    company: 'TML',
    summary:
      'A supportive design lead who combines creativity, speed and attention to detail.',
    full: [
      'I had the opportunity to work with Santosh, and it was a great learning experience. He is a very supportive and friendly UX Lead who is always ready to help the team.',
      'He is very innovative and always comes up with smart solutions for design problems. He is also very fast in Figma and taught me many shortcuts and better ways to work, which helped me improve a lot. He took the time to train me, and I’m really thankful for that.',
      'He is also very good at UI animations and always pays attention to the small details that make a design better. I learned a lot from his feedback and guidance.',
      'I’m grateful to have worked with him and would highly recommend him to any team.',
    ],
    illustration: `${T}/Dharma.svg`,
    tone: 'peach',
  },
  {
    id: 'triasha',
    number: '03',
    name: 'Triasha Mazumder',
    role: 'Manager',
    company: 'TML',
    summary:
      'Brings rigor, product thinking and genuine care to every design decision.',
    full: [
      "Santosh is one of the most capable UX designers I've worked with. He brings rigor and care to user research, grounding his work in real user needs rather than assumptions and consistently translating those insights into thoughtful, well-crafted design.",
      'His attention to detail, strong product thinking and commitment to quality set a high standard for the team. Santosh is both a skilled designer and a dependable colleague, and he will be an asset to any team he joins. I recommend him without reservation.',
    ],
    illustration: `${T}/Triasha.svg`,
    tone: 'peach',
  },
  {
    id: 'sachin',
    number: '04',
    name: 'Sachin Singh Jagawat',
    role: 'Founder',
    company: 'TML',
    summary:
      'Started as a UI designer and kept expanding his craft across product, motion and visual design.',
    full: [
      'I’ve worked with Santosh for three years, and he’s an exceptional talent. His UI/UX design skills are outstanding, but what truly sets him apart is his commitment to constant upskilling. He joined me as a UI Designer and gradually expanded his expertise into motion graphics, logo design, and graphic design—always finding ways to contribute to any design or creative task that came his way. He consistently takes initiative and sees things through.',
      'Whenever he’s given a project, he begins by investing significant time in research, carefully considering the user experience, the flow, and every other aspect that might come into play. His focus is always on delivering a design that’s user-friendly first.',
    ],
    illustration: `${T}/Sachin.svg`,
    tone: 'dark',
  },
  {
    id: 'tushar',
    number: '05',
    name: 'Tushar Nagar',
    role: 'Co-Founder',
    company: 'TML',
    summary:
      "Doesn't just design screens—he genuinely cares about the experience behind them.",
    full: [
      'I’ve worked with him for over 3 years, and one thing that has always stood out is how passionate he is about design. He’s not someone who just creates screens—he genuinely cares about the user experience and puts a lot of thought into every detail.',
      'His UI skills are exceptional, with a great eye for aesthetics, consistency, and usability. Whether it’s refining a small interaction or designing an entire product flow, he always brings creativity and a high level of craftsmanship to the table.',
      'What I appreciate most is his willingness to keep learning and pushing himself to get better. He’s the kind of designer who takes ownership of his work and is always looking for ways to improve the final product.',
      'Any company looking for a talented, dedicated, and genuinely passionate UI/UX designer would be lucky to have him on their team.',
    ],
    illustration: `${T}/Tushar.svg`,
    tone: 'dark',
  },
];
