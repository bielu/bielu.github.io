import type { IllustrationName } from './illustrations';
import type { Package } from './nuget';
import type { ProjectIconName } from './project-icons';
import { PROJECTS, type Project } from './projects';

/** The bielu NuGet ecosystem catalogue (repo bielu/Bielu.EcoSystem). */
export const ECOSYSTEM_URL = 'https://packages.bielu.pl';

/** What a project tile shows: a hand-drawn icon, the curated illustration, or a package's own NuGet icon. */
export type ProjectArt =
  | { kind: 'icon'; name: ProjectIconName }
  | { kind: 'illustration'; name: IllustrationName }
  | { kind: 'image'; src: string };

export interface ProjectStats {
  project: Project;
  /** Most downloaded first. */
  packages: Package[];
  totalDownloads: number;
  /** The most downloaded package that is not deprecated, if any. */
  lead?: Package;
  art: ProjectArt;
}

export interface Showcase {
  flagship: ProjectStats[];
  infrastructure: ProjectStats[];
  libraries: ProjectStats[];
  /** Most downloaded, non-deprecated packages across the whole ecosystem. */
  top: Package[];
  packageCount: number;
  totalDownloads: number;
  /** Packages in the flagship projects combined. */
  flagshipPackageCount: number;
  flagshipDownloads: number;
}

/** Returns the project with the longest prefix matching `id` (case-insensitive). */
export function projectFor(id: string, projects: Project[] = PROJECTS): Project | undefined {
  const lower = id.toLowerCase();
  let best: Project | undefined;
  let bestLength = 0;
  for (const project of projects) {
    for (const prefix of project.prefixes) {
      if (prefix.length > bestLength && lower.startsWith(prefix.toLowerCase())) {
        best = project;
        bestLength = prefix.length;
      }
    }
  }
  return best;
}

const byDownloads = (a: { totalDownloads: number }, b: { totalDownloads: number }) =>
  b.totalDownloads - a.totalDownloads;

/** Hand-drawn icon first, then the curated illustration, then the top package's NuGet icon, then generic art. */
export function artFor(project: Project, packages: Package[]): ProjectArt {
  if (project.icon) return { kind: 'icon', name: project.icon };
  if (project.illustration) return { kind: 'illustration', name: project.illustration };
  const icon = packages.find((p) => p.iconUrl)?.iconUrl;
  return icon ? { kind: 'image', src: icon } : { kind: 'illustration', name: 'package' };
}

/** Attaches live NuGet figures to every curated project. Projects keep their declaration order. */
export function buildShowcase(packages: Package[], projects: Project[] = PROJECTS, topCount = 6): Showcase {
  const members = new Map<string, Package[]>(projects.map((p) => [p.slug, []]));
  for (const pkg of packages) {
    const project = projectFor(pkg.id, projects);
    if (project) members.get(project.slug)!.push(pkg);
  }

  const stats = projects.map((project): ProjectStats => {
    const sorted = [...members.get(project.slug)!].sort(byDownloads);
    return {
      project,
      packages: sorted,
      totalDownloads: sum(sorted),
      lead: sorted.find((p) => !p.deprecation),
      art: artFor(project, sorted),
    };
  });
  const inGroup = (group: Project['group']) => stats.filter((s) => s.project.group === group);
  const flagship = inGroup('flagship');

  return {
    flagship,
    infrastructure: inGroup('infrastructure'),
    libraries: inGroup('libraries'),
    top: packages.filter((p) => !p.deprecation).sort(byDownloads).slice(0, topCount),
    packageCount: packages.length,
    totalDownloads: sum(packages),
    flagshipPackageCount: flagship.reduce((n, s) => n + s.packages.length, 0),
    flagshipDownloads: flagship.reduce((n, s) => n + s.totalDownloads, 0),
  };
}

function sum(packages: Package[]): number {
  return packages.reduce((total, p) => total + p.totalDownloads, 0);
}

/** `1234` → `1.2k`, `190000` → `190k`, `1500000` → `1.5M`. */
export function formatCount(value: number): string {
  if (value < 1000) return String(value);
  const [divisor, suffix] = value < 1_000_000 ? [1000, 'k'] : [1_000_000, 'M'];
  const scaled = value / divisor;
  return `${scaled < 10 ? Math.floor(scaled * 10) / 10 : Math.floor(scaled)}${suffix}`;
}

/** Rounds down to a headline figure, e.g. `95` → `90+`, `191234` → `190k+`. */
export function formatHeadline(value: number): string {
  if (value < 10) return String(value);
  if (value < 1000) return `${Math.floor(value / 10) * 10}+`;
  return `${formatCount(Math.floor(value / 10_000) * 10_000 || value)}+`;
}

/** `1 package`, `3 packages`. */
export const pluralize = (count: number, noun: string): string => `${count} ${noun}${count === 1 ? '' : 's'}`;

/** The version a reader should install: latest stable if one exists, otherwise latest prerelease. */
export const recommendedVersion = (pkg: Package): string => pkg.stableVersion ?? pkg.version;

/** `dotnet add package` command, pinning the version only when it is a prerelease. */
export function installCommand(pkg: Package): string {
  const version = recommendedVersion(pkg);
  return `dotnet add package ${pkg.id}${version.includes('-') ? ` --version ${version}` : ''}`;
}

/** A project's family on packages.bielu.pl. */
export const ecosystemFamilyUrl = (slug: string): string => `${ECOSYSTEM_URL}/#${slug}`;

/** A package's page on packages.bielu.pl. NuGet ids are case-insensitive, so slugs are lowercase. */
export const ecosystemPackageUrl = (id: string): string => `${ECOSYSTEM_URL}/packages/${id.toLowerCase()}/`;

export const githubUrl = (repo: string): string => `https://github.com/${repo}`;
