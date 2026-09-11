import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Nodemailer needs real sockets (SMTP over TCP) — the Edge runtime can't do
// that, so this route must run on Node.
export const runtime = 'nodejs';

const DESTINATION = 'santoshmudragada.uiux@gmail.com';
const FROM = '"Design with Santosh" <hello@designwithsantosh.in>';

type Payload = {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  project?: string;
  company?: string;
  message?: string;
};

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request body' },
      { status: 400 },
    );
  }

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim();
  const phone = (body.phone ?? '').trim();
  const role = (body.role ?? '').trim();
  const project = (body.project ?? '').trim();
  const company = (body.company ?? '').trim();
  const message = (body.message ?? '').trim();

  if (!name || !email || !isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: 'Name and a valid email are required.' },
      { status: 400 },
    );
  }

  const login = process.env.BREVO_SMTP_LOGIN;
  const key = process.env.BREVO_SMTP_KEY;
  if (!login || !key) {
    console.error('Missing BREVO_SMTP_LOGIN / BREVO_SMTP_KEY env vars');
    return NextResponse.json(
      { ok: false, error: 'Email sending is not configured.' },
      { status: 500 },
    );
  }

  // `null` marks a line to drop — keeps the intentional blank spacer ('')
  // from being stripped alongside the genuinely-empty optional fields.
  const lines = [
    message ||
      `Hi Santosh, I'd love to chat about ${project ? project.toLowerCase() : 'a project'}.`,
    '',
    '—',
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    role ? `Role: ${role}` : null,
    project ? `Project: ${project}` : null,
    company ? `Company: ${company}` : null,
  ].filter((l): l is string => l !== null);

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // STARTTLS on 587, not implicit TLS
    auth: { user: login, pass: key },
  });

  try {
    await transporter.sendMail({
      from: FROM,
      to: DESTINATION,
      replyTo: email,
      subject: `Let's build something — ${name}`,
      text: lines.join('\n'),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact form send failed', err);
    return NextResponse.json(
      { ok: false, error: 'Could not send — please try again.' },
      { status: 502 },
    );
  }
}
