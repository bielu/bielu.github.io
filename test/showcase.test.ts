import { describe, expect, it } from 'vitest';
import { ILLUSTRATIONS } from '../src/lib/illustrations';
import { PROJECT_ICONS } from '../src/lib/project-icons';
import { CONTRIBUTIONS, PROJECTS } from '../src/lib/projects';
import {
  artFor,
  buildShowcase,
  ecosystemFamilyUrl,
  ecosystemPackageUrl,
  formatCount,
  formatHeadline,
  githubUrl,
  installCommand,
  pluralize,
  projectFor,
  recommendedVersion,
} from '../src/lib/showcase';
import { makePackage, projects } from './fixtures';

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
    expect(showcase.totalDownloads).toBe(1970);
    expect(showcase.flagshipPackageCount).toBe(3);
    expect(showcase.flagshipDownloads).toBe(450);
    expect(showcase.top.map((p) => p.id)).toEqual(['Other.Thing', 'Acme.Core.Extras', 'Acme.Core']);
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
});

describe('urls', () => {
  it('ecosystemUrls_PointAtPackagesBieluPl', () => {
    expect(ecosystemFamilyUrl('asyncapi')).toBe('https://packages.bielu.pl/#asyncapi');
    expect(ecosystemPackageUrl('Bielu.PersistentQueues')).toBe('https://packages.bielu.pl/packages/bielu.persistentqueues/');
    expect(githubUrl('scalar/scalar')).toBe('https://github.com/scalar/scalar');
  });
});
