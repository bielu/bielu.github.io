import type { IllustrationName } from './illustrations';
import type { Package, Registry } from './package';
import type { ProjectIconName } from './project-icons';
import { FEATURED, PROJECTS, type Feature, type Project } from './projects';

/** The bielu package catalogue, NuGet and npm (repo bielu/Bielu.EcoSystem). */
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

/** A featured card: the feature, its parts in declaration order, and their combined figures. */
export interface FeatureStats {
  feature: Feature;
  parts: ProjectStats[];
  packageCount: number;
  totalDownloads: number;
}

export interface Showcase {
  flagship: ProjectStats[];
  /** Features with at least one part, in {@link FEATURED} order. */
  featured: FeatureStats[];
  infrastructure: ProjectStats[];
  libraries: ProjectStats[];
  /** Most downloaded, non-deprecated packages across the whole ecosystem. */
  top: Package[];
  packageCount: number;
  /** Package count per registry. */
  registryCounts: Record<Registry, number>;
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

/** Attaches live NuGet and npm figures to every curated project. Projects keep their declaration order. */
export function buildShowcase(
  packages: Package[],
  projects: Project[] = PROJECTS,
  topCount = 6,
  features: Feature[] = FEATURED,
): Showcase {
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
  const featured = features
    .map((feature) => {
      const parts = inGroup('featured').filter((s) => s.project.feature === feature.slug);
      return { feature, parts, packageCount: countPackages(parts), totalDownloads: sum(parts) };
    })
    .filter((f) => f.parts.length > 0);

  const registryCounts: Record<Registry, number> = { nuget: 0, npm: 0 };
  for (const pkg of packages) registryCounts[pkg.registry]++;

  return {
    flagship,
    featured,
    infrastructure: inGroup('infrastructure'),
    libraries: inGroup('libraries'),
    top: packages.filter((p) => !p.deprecation).sort(byDownloads).slice(0, topCount),
    packageCount: packages.length,
    registryCounts,
    totalDownloads: sum(packages),
    flagshipPackageCount: countPackages(flagship),
    flagshipDownloads: sum(flagship),
  };
}

function sum(items: { totalDownloads: number }[]): number {
  return items.reduce((total, p) => total + p.totalDownloads, 0);
}

function countPackages(parts: ProjectStats[]): number {
  return parts.reduce((n, s) => n + s.packages.length, 0);
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

/** The package a card's install snippet shows: `id` from any part (case-insensitive), else the first part's lead. */
export function installPackage(parts: ProjectStats[], id: string): Package | undefined {
  const wanted = id.toLowerCase();
  return parts.flatMap((s) => s.packages).find((p) => p.id.toLowerCase() === wanted) ?? parts[0]?.lead;
}

/** Footer links of a feature card: documentation, source, then all its packages on packages.bielu.pl. */
export function featureLinks(feature: Feature, packageCount: number): { label: string; href: string }[] {
  return [
    { label: 'Documentation', href: feature.docs },
    { label: 'Source', href: feature.repo },
    { label: `All ${pluralize(packageCount, 'package')}`, href: ecosystemFamilyUrl(feature.slug) },
  ];
}

/** `dotnet add package` or `npm install` command, pinning the version only when it is a prerelease. */
export function installCommand(pkg: Package): string {
  const version = recommendedVersion(pkg);
  const prerelease = version.includes('-');
  if (pkg.registry === 'npm') return `npm install ${pkg.id}${prerelease ? `@${version}` : ''}`;
  return `dotnet add package ${pkg.id}${prerelease ? ` --version ${version}` : ''}`;
}

/** A project's family on packages.bielu.pl. */
export const ecosystemFamilyUrl = (slug: string): string => `${ECOSYSTEM_URL}/#${slug}`;

/**
 * A package's page on packages.bielu.pl. NuGet ids are case-insensitive, so they are lowercased; npm
 * packages live under `npm/` with the scope's `@` dropped. Mirrors `packagePath` in bielu/Bielu.EcoSystem.
 */
export const ecosystemPackageUrl = (pkg: Pick<Package, 'id' | 'registry'>): string =>
  `${ECOSYSTEM_URL}/packages/${pkg.registry === 'npm' ? `npm/${pkg.id.replace(/^@/, '')}` : pkg.id.toLowerCase()}/`;

export const githubUrl = (repo: string): string => `https://github.com/${repo}`;
