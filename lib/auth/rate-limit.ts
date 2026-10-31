// Minimal in-memory rate limiter for login attempts. Good enough for a single-process
// hackathon deployment; a multi-instance production deployment would move this to
// Upstash Redis (see AGENTS.md section 12) without changing the call sites below.

const attempts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}

export function resetRateLimit(key: string) {
  attempts.delete(key);
}
