import { describe, expect, it } from 'vitest';
import { ILLUSTRATIONS } from '../src/lib/illustrations';
import { PROJECT_ICONS } from '../src/lib/project-icons';
import { CONTRIBUTIONS, FEATURED, PROJECTS } from '../src/lib/projects';
import {
  artFor,
  buildShowcase,
  ecosystemFamilyUrl,
  ecosystemPackageUrl,
  featureLinks,
  formatCount,
  formatHeadline,
  githubUrl,
  installCommand,
  installPackage,
  pluralize,
  projectFor,
  recommendedVersion,
} from '../src/lib/showcase';
import { features, makePackage, projects } from './fixtures';

describe('projectFor', () => {
  it('projectFor_MatchesPrefixCaseInsensitively', () => {
    // Arrange / Act
    const project = projectFor('acme.core.extras', projects);

    // Assert
    expect(project?.slug).toBe('core');
  });

  it('projectFor_PrefersLongestPrefixRegardlessOfOrder', () => {
    expect(projectFor('Acme.Core.Ui.Grid', projects)?.slug).toBe('core-ui');
    expect(projectFor('Acme.Core.Data', projects)?.slug).toBe('core');
  });

  it('projectFor_ReturnsUndefinedWhenNothingMatches', () => {
    expect(projectFor('Unknown.Pkg', projects)).toBeUndefined();
  });

  it('projectFor_DefaultProjectsClaimFlagshipPackages', () => {
    expect(projectFor('Bielu.AspNetCore.AsyncApi')?.slug).toBe('asyncapi');
    expect(projectFor('Bielu.AspNetCore.AsyncApi.Cli')?.slug).toBe('api-tooling');
    expect(projectFor('Bielu.AspNetCore.AsyncApi.Scalar.SignalR.Aspire')?.slug).toBe('scalar-consoles');
    expect(projectFor('Bielu.AspNetCore.Arazzo.Overlay')?.slug).toBe('overlay');
    expect(projectFor('Bielu.Arazzo.NET.Readers')?.slug).toBe('arazzo');
    expect(projectFor('Bielu.PersistentQueues.Storage.LMDB')?.slug).toBe('persistent-queues');
  });

  it('projectFor_DefaultProjectsClaimBetterSearchPackages', () => {
    expect(projectFor('Bielu.BetterSearch.Core')).toMatchObject({ slug: 'bettersearch', feature: 'bettersearch' });
    expect(projectFor('Bielu.BetterSearch.FluentApi')?.slug).toBe('bettersearch');
    expect(projectFor('Bielu.BetterSearch.ElasticSearch')?.slug).toBe('bettersearch-elasticsearch');
    expect(projectFor('Bielu.BetterSearch.OpenSearch')?.slug).toBe('bettersearch-opensearch');
    expect(projectFor('Bielu.BetterSearch.Meilisearch')?.slug).toBe('bettersearch-meilisearch');
    expect(projectFor('Bielu.BetterSearch.Lifti')?.slug).toBe('bettersearch-lifti');
  });
});

describe('PROJECTS', () => {
  it('PROJECTS_HaveUniqueSlugs', () => {
    const slugs = PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('PROJECTS_ReferenceExistingArt', () => {
    for (const project of PROJECTS) {
      if (project.icon) expect(PROJECT_ICONS).toContain(project.icon);
      if (project.illustration) expect(ILLUSTRATIONS).toHaveProperty(project.illustration);
    }
  });

  it('PROJECTS_StartWithTheFlagshipCore', () => {
    // The page treats the first flagship project as the flagship's lead.
    expect(PROJECTS[0]).toMatchObject({ slug: 'asyncapi', group: 'flagship' });
  });

  it('PROJECTS_OnlyFeaturedPartsNameAnExistingFeature', () => {
    const slugs = FEATURED.map((f) => f.slug);
    for (const project of PROJECTS) {
      if (project.group === 'featured') expect(slugs).toContain(project.feature);
      else expect(project.feature).toBeUndefined();
    }
  });

  it('CONTRIBUTIONS_UseOwnerSlashNameRepos', () => {
    for (const c of CONTRIBUTIONS) expect(c.repo).toMatch(/^[^/\s]+\/[^/\s]+$/);
  });
});

describe('artFor', () => {
  it('artFor_PrefersIconThenIllustrationThenNuGetIcon', () => {
    // Arrange
    const withIcon = makePackage({ id: 'A', iconUrl: 'https://img/a.png' });

    // Act / Assert
    expect(artFor(projects[1]!, [withIcon])).toEqual({ kind: 'icon', name: 'scalar-consoles' });
    expect(artFor(projects[2]!, [withIcon])).toEqual({ kind: 'illustration', name: 'containers' });
    expect(artFor(projects[0]!, [makePackage({ id: 'B' }), withIcon])).toEqual({ kind: 'image', src: 'https://img/a.png' });
  });

  it('artFor_FallsBackToGenericIllustration', () => {
    expect(artFor(projects[0]!, [makePackage({ id: 'B' })])).toEqual({ kind: 'illustration', name: 'package' });
  });
});

describe('buildShowcase', () => {
  const packages = [
    makePackage({ id: 'Acme.Core', totalDownloads: 100 }),
    makePackage({ id: 'Acme.Core.Extras', totalDownloads: 300 }),
    makePackage({ id: 'Acme.Core.Ui', totalDownloads: 50 }),
    makePackage({ id: 'Acme.Queues', totalDownloads: 500, deprecation: { reasons: ['Legacy'] } }),
    makePackage({ id: 'Acme.Queues.Lmdb', totalDownloads: 20 }),
    makePackage({ id: 'Other.Thing', totalDownloads: 1000 }),
  ];

  it('buildShowcase_AssignsPackagesToProjectsByLongestPrefix', () => {
    // Act
    const showcase = buildShowcase(packages, projects);

    // Assert
    expect(showcase.flagship.map((s) => s.packages.map((p) => p.id))).toEqual([
      ['Acme.Core.Extras', 'Acme.Core'],
      ['Acme.Core.Ui'],
    ]);
    expect(showcase.infrastructure[0]!.totalDownloads).toBe(520);
  });

  it('buildShowcase_LeadSkipsDeprecatedPackages', () => {
    // Act
    const showcase = buildShowcase(packages, projects);

    // Assert
    expect(showcase.infrastructure[0]!.lead?.id).toBe('Acme.Queues.Lmdb');
    expect(showcase.flagship[0]!.lead?.id).toBe('Acme.Core.Extras');
  });

  it('buildShowcase_KeepsProjectsWithoutPackages', () => {
    // Act
    const showcase = buildShowcase(packages, projects);

    // Assert
    expect(showcase.libraries).toHaveLength(1);
    expect(showcase.libraries[0]).toMatchObject({ packages: [], totalDownloads: 0, lead: undefined });
  });

  it('buildShowcase_TotalsCoverEveryPackage', () => {
    // Act
    const showcase = buildShowcase(packages, projects, 3);

    // Assert
    expect(showcase.packageCount).toBe(6);
    expect(showcase.registryCounts).toEqual({ nuget: 6, npm: 0 });
    expect(showcase.totalDownloads).toBe(1970);
    expect(showcase.flagshipPackageCount).toBe(3);
    expect(showcase.flagshipDownloads).toBe(450);
    expect(showcase.top.map((p) => p.id)).toEqual(['Other.Thing', 'Acme.Core.Extras', 'Acme.Core']);
  });

  it('buildShowcase_GroupsFeaturedPartsUnderTheirFeature', () => {
    // Arrange
    const withSearch = [
      ...packages,
      makePackage({ id: 'Acme.Search.Core', totalDownloads: 70 }),
      makePackage({ id: 'Acme.Search.Models', totalDownloads: 5 }),
      makePackage({ id: 'Acme.Search.Elastic', totalDownloads: 30 }),
    ];

    // Act
    const showcase = buildShowcase(withSearch, projects, 6, features);

    // Assert
    expect(showcase.featured).toHaveLength(1);
    const [search] = showcase.featured;
    expect(search!.feature.slug).toBe('search');
    expect(search!.parts.map((s) => s.project.slug)).toEqual(['search', 'search-elastic']);
    expect(search!.parts[0]!.packages.map((p) => p.id)).toEqual(['Acme.Search.Core', 'Acme.Search.Models']);
    expect(search!.packageCount).toBe(3);
    expect(search!.totalDownloads).toBe(105);
  });

  it('buildShowcase_KeepsFeaturedOutOfFlagshipTotals', () => {
    // Act
    const showcase = buildShowcase([...packages, makePackage({ id: 'Acme.Search.Core', totalDownloads: 70 })], projects, 6, features);

    // Assert
    expect(showcase.flagshipPackageCount).toBe(3);
    expect(showcase.flagshipDownloads).toBe(450);
  });

  it('buildShowcase_DropsFeaturesWithoutParts', () => {
    // Act
    const showcase = buildShowcase(packages, projects, 6, features);

    // Assert
    expect(showcase.featured.map((f) => f.feature.slug)).toEqual(['search']);
  });
});

describe('feature cards', () => {
  const [coreProject, elasticProject] = projects.filter((p) => p.feature === 'search');
  const core = makePackage({ id: 'Acme.Search.Core', totalDownloads: 10 });
  const models = makePackage({ id: 'Acme.Search.Models', totalDownloads: 90 });
  const elastic = makePackage({ id: 'Acme.Search.Elastic', totalDownloads: 40 });
  const parts = [
    { project: coreProject!, packages: [models, core], totalDownloads: 100, lead: models, art: artFor(coreProject!, []) },
    { project: elasticProject!, packages: [elastic], totalDownloads: 40, lead: elastic, art: artFor(elasticProject!, []) },
  ];

  it('installPackage_FindsTheIdInAnyPartCaseInsensitively', () => {
    // Act / Assert
    expect(installPackage(parts, 'acme.search.core')?.id).toBe('Acme.Search.Core');
    expect(installPackage(parts, 'ACME.SEARCH.ELASTIC')?.id).toBe('Acme.Search.Elastic');
  });

  it('installPackage_FallsBackToTheFirstPartsLead', () => {
    // Act / Assert
    expect(installPackage(parts, 'Acme.Search.Missing')?.id).toBe('Acme.Search.Models');
    expect(installPackage([], 'Acme.Search.Core')).toBeUndefined();
  });

  it('featureLinks_ListsDocsSourceAndPackages', () => {
    // Act
    const links = featureLinks(features[0]!, 3);

    // Assert
    expect(links).toEqual([
      { label: 'Documentation', href: 'https://search.acme.test/' },
      { label: 'Source', href: 'https://github.com/acme/search' },
      { label: 'All 3 packages', href: 'https://packages.bielu.pl/#search' },
    ]);
  });
});

describe('formatting', () => {
  it('formatCount_UsesCompactSuffixes', () => {
    expect(formatCount(999)).toBe('999');
    expect(formatCount(1234)).toBe('1.2k');
    expect(formatCount(190_000)).toBe('190k');
    expect(formatCount(1_500_000)).toBe('1.5M');
  });

  it('formatHeadline_RoundsDown', () => {
    expect(formatHeadline(7)).toBe('7');
    expect(formatHeadline(95)).toBe('90+');
    expect(formatHeadline(191_234)).toBe('190k+');
    expect(formatHeadline(4321)).toBe('4.3k+');
  });

  it('pluralize_HandlesSingular', () => {
    expect(pluralize(1, 'package')).toBe('1 package');
    expect(pluralize(3, 'package')).toBe('3 packages');
  });

  it('recommendedVersion_PrefersStable', () => {
    expect(recommendedVersion(makePackage({ id: 'A', version: '2.0.0-beta', stableVersion: '1.0.0' }))).toBe('1.0.0');
    expect(recommendedVersion(makePackage({ id: 'A', version: '2.0.0-beta', stableVersion: undefined }))).toBe('2.0.0-beta');
  });

  it('installCommand_PinsOnlyPrereleases', () => {
    expect(installCommand(makePackage({ id: 'A' }))).toBe('dotnet add package A');
    expect(installCommand(makePackage({ id: 'A', version: '2.0.0-beta', stableVersion: undefined }))).toBe(
      'dotnet add package A --version 2.0.0-beta',
    );
  });

  it('installCommand_NpmUsesNpmInstall', () => {
    expect(installCommand(makePackage({ id: '@acme/ui', registry: 'npm' }))).toBe('npm install @acme/ui');
    expect(installCommand(makePackage({ id: '@acme/ui', registry: 'npm', version: '2.0.0-beta', stableVersion: undefined }))).toBe(
      'npm install @acme/ui@2.0.0-beta',
    );
  });

  it('buildShowcase_CountsPackagesPerRegistry', () => {
    // Arrange
    const mixed = [makePackage({ id: 'Acme.Core' }), makePackage({ id: '@acme/core-ui', registry: 'npm' })];

    // Act
    const showcase = buildShowcase(mixed, projects);

    // Assert
    expect(showcase.registryCounts).toEqual({ nuget: 1, npm: 1 });
    expect(showcase.packageCount).toBe(2);
  });
});

describe('urls', () => {
  it('ecosystemUrls_PointAtPackagesBieluPl', () => {
    expect(ecosystemFamilyUrl('asyncapi')).toBe('https://packages.bielu.pl/#asyncapi');
    expect(ecosystemPackageUrl(makePackage({ id: 'Bielu.PersistentQueues' }))).toBe(
      'https://packages.bielu.pl/packages/bielu.persistentqueues/',
    );
    expect(ecosystemPackageUrl(makePackage({ id: '@bielu/scalar-grpc', registry: 'npm' }))).toBe(
      'https://packages.bielu.pl/packages/npm/bielu/scalar-grpc/',
    );
    expect(githubUrl('scalar/scalar')).toBe('https://github.com/scalar/scalar');
  });
});
