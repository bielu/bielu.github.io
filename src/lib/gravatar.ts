/**
 * Gravatar avatar, fetched at build time and inlined as a data URI. The page never links to Gravatar,
 * so neither the email nor its (easily reversed) hash is published. The email comes from the
 * `GRAVATAR_EMAIL` environment variable, a repo secret in CI.
 */

/** Gravatar URL for an email; `d=404` makes a missing avatar fail instead of returning a placeholder. */
export async function gravatarUrl(email: string, size: number): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.trim().toLowerCase()));
  const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `https://gravatar.com/avatar/${hash}?s=${size}&d=404`;
}

/**
 * Returns the avatar as a data URI, or `undefined` when no email is configured or Gravatar has no
 * avatar for it. Other HTTP failures throw so a broken build never silently drops the picture.
 */
export async function fetchAvatar(
  email: string | undefined,
  size = 192,
  fetchImpl: typeof fetch = fetch,
): Promise<string | undefined> {
  if (!email?.trim()) return undefined;

  const response = await fetchImpl(await gravatarUrl(email, size));
  if (response.status === 404) return undefined;
  if (!response.ok) {
    throw new Error(`Gravatar request failed: ${response.status} ${response.statusText}`);
  }

  const type = response.headers.get('content-type') ?? 'image/png';
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:${type};base64,${btoa(binary)}`;
}

/** `Arkadiusz Biel` → `AB`, the fallback when there is no avatar. */
export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase())
    .join('');
