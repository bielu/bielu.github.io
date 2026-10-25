import { fetchAvatar } from './gravatar';
import { fetchPackages } from './nuget';
import { buildShowcase, type Showcase } from './showcase';

let showcase: Promise<Showcase> | undefined;
let avatar: Promise<string | undefined> | undefined;

/** Build-time showcase, fetched from NuGet once per build. */
export function getShowcase(): Promise<Showcase> {
  showcase ??= fetchPackages().then((packages) => buildShowcase(packages));
  return showcase;
}

/** Build-time avatar data URI, or `undefined` when `GRAVATAR_EMAIL` is not set. */
export function getAvatar(): Promise<string | undefined> {
  avatar ??= fetchAvatar(import.meta.env.GRAVATAR_EMAIL);
  return avatar;
}
