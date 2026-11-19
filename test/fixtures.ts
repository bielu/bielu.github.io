import type { Package } from '../src/lib/package';
import type { Feature, Project } from '../src/lib/projects';

export function makePackage(overrides: Partial<Package> & { id: string }): Package {
  return {
    registry: 'nuget',
    version: '1.0.0',
    stableVersion: '1.0.0',
    description: `${overrides.id} description. More text.`,
    tags: [],
    totalDownloads: 0,
    verified: true,
    type: 'Dependency',
    versions: [{ version: '1.0.0', downloads: 0 }],
    ...overrides,
  };
}

export const projects: Project[] = [
  { slug: 'core', name: 'Core', group: 'flagship', tag: 'Core', summary: 'Core.', prefixes: ['Acme.Core'], hue: 10 },
  {
    slug: 'core-ui',
    name: 'Core UI',
    group: 'flagship',
    tag: 'UI',
    summary: 'UI.',
    prefixes: ['Acme.Core.Ui'],
    icon: 'scalar-consoles',
    hue: 20,
  },
  {
    slug: 'queues',
    name: 'Queues',
    group: 'infrastructure',
    tag: 'Queues',
    summary: 'Queues.',
    prefixes: ['Acme.Queues'],
    illustration: 'containers',
    hue: 30,
  },
  { slug: 'tools', name: 'Tools', group: 'libraries', tag: 'Tools', summary: 'Tools.', prefixes: ['Acme.Tools'], hue: 40 },
  { slug: 'search', name: 'Search', group: 'featured', feature: 'search', tag: 'Core', summary: 'Core.', prefixes: ['Acme.Search'], hue: 50 },
  {
    slug: 'search-elastic',
    name: 'Elastic',
    group: 'featured',
    feature: 'search',
    tag: 'Provider',
    summary: 'Elastic.',
    prefixes: ['Acme.Search.Elastic'],
    hue: 60,
  },
];

export const features: Feature[] = [
  {
    slug: 'search',
    name: 'Acme.Search',
    summary: 'Search.',
    install: 'Acme.Search.Core',
    repo: 'https://github.com/acme/search',
    docs: 'https://search.acme.test/',
  },
  { slug: 'empty', name: 'Empty', summary: 'No parts.', install: 'Acme.Empty', repo: 'https://r.test', docs: 'https://d.test' },
];
