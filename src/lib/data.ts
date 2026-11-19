import { fetchAvatar } from './gravatar';
import { fetchNpmPackages } from './npm';
import { fetchNugetPackages } from './nuget';
import { buildShowcase, type Showcase } from './showcase';

let showcase: Promise<Showcase> | undefined;
let avatar: Promise<string | undefined> | undefined;

/** Build-time showcase, fetched from NuGet and npm once per build. */
export function getShowcase(): Promise<Showcase> {
  showcase ??= Promise.all([fetchNugetPackages(), fetchNpmPackages()]).then(([nuget, npm]) =>
    buildShowcase([...nuget, ...npm]),
  );
  return showcase;
}

/** Build-time avatar data URI, or `undefined` when `GRAVATAR_EMAIL` is not set. */
export function getAvatar(): Promise<string | undefined> {
  avatar ??= fetchAvatar(import.meta.env.GRAVATAR_EMAIL);
  return avatar;
}
