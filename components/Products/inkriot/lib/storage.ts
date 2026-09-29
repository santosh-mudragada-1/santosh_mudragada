const NAMESPACE = 'inkriot-showcase:v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${NAMESPACE}:${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${NAMESPACE}:${key}`, JSON.stringify(value));
  } catch {
    // localStorage unavailable (private mode / quota) — fail silently, it's an enhancement only
  }
}

export function getMuted(): boolean {
  return read<boolean>('muted', false);
}

export function setMuted(muted: boolean): void {
  write('muted', muted);
}
