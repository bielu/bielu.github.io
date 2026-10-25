/**
 * Showcased projects — the hand-maintained layer on top of NuGet data. NuGet supplies package counts,
 * downloads and versions at build time; this file says which projects to feature and how.
 *
 * A package belongs to the project with the **longest** case-insensitive prefix matching its id, so a
 * specific project (`Bielu.AspNetCore.AsyncApi.Scalar`) wins over a broad one (`Bielu.AspNetCore.AsyncApi`)
 * regardless of declaration order. Declaration order is display order.
 *
 * Slugs match the family slugs of packages.bielu.pl (`src/lib/families.ts` in bielu/Bielu.EcoSystem),
 * so every project links straight to its family on the ecosystem catalogue.
 */

import type { IllustrationName } from './illustrations';
import type { ProjectIconName } from './project-icons';

export type ProjectGroup = 'flagship' | 'infrastructure' | 'libraries';

export interface Project {
  /** Family slug on packages.bielu.pl, used as the anchor of its ecosystem link. */
  slug: string;
  name: string;
  group: ProjectGroup;
  /** Short category label shown above the name. */
  tag: string;
  summary: string;
  prefixes: string[];
  repo?: string;
  docs?: string;
  /** Hand-drawn icon; takes precedence over {@link illustration}. */
  icon?: ProjectIconName;
  /** Tile artwork. When omitted the top package's NuGet icon is used, then a generic illustration. */
  illustration?: IllustrationName;
  /** Base hue (0–360) of the tile gradient. */
  hue: number;
}

/** The flagship as a whole: the parts are the `flagship` projects below. */
export const FLAGSHIP = {
  name: 'Bielu.AspNetCore.ApiDescriptions',
  summary:
    'Code-first AsyncAPI, Arazzo and Overlay document generation for ASP.NET Core, from minimal or controller-based APIs. The experience Microsoft.AspNetCore.OpenApi gives you for REST, applied to event-driven and workflow specifications.',
  install: 'Bielu.AspNetCore.AsyncApi',
  repo: 'https://github.com/bielu/Bielu.AspNetCore.AsyncApi',
  docs: 'https://apidescriptions.bielu.pl/',
};

const API_DESCRIPTIONS = { repo: FLAGSHIP.repo, docs: FLAGSHIP.docs };

export const PROJECTS: Project[] = [
  // ---- Flagship: API descriptions ----------------------------------------------------------
  {
    slug: 'asyncapi',
    name: 'AsyncAPI',
    group: 'flagship',
    tag: 'Core',
    summary: 'AsyncAPI 2.6 / 3.1 documents from attributes or a fluent API, with versioning, merging and Native AOT.',
    prefixes: ['Bielu.AspNetCore.AsyncApi'],
    hue: 255,
    ...API_DESCRIPTIONS,
  },
  {
    slug: 'protocol-bindings',
    name: 'Protocol bindings',
    group: 'flagship',
    tag: 'Bindings',
    summary: 'SignalR hubs, gRPC services, Server-Sent Events and WebRTC data channels.',
    prefixes: ['Bielu.AspNetCore.AsyncApi.Extensions.Protocols'],
    icon: 'protocol-bindings',
    hue: 190,
    ...API_DESCRIPTIONS,
  },
  {
    slug: 'scalar-consoles',
    name: 'Scalar consoles',
    group: 'flagship',
    tag: 'Interactive UI',
    summary: 'SignalR, gRPC-Web and broker consoles inside the Scalar API reference.',
    prefixes: ['Bielu.AspNetCore.AsyncApi.Scalar'],
    icon: 'scalar-consoles',
    hue: 160,
    ...API_DESCRIPTIONS,
  },
  {
    slug: 'arazzo',
    name: 'Arazzo',
    group: 'flagship',
    tag: 'Workflows',
    summary: 'Arazzo object model, readers and validation, wired to your live API documents.',
    prefixes: ['Bielu.Arazzo.', 'Bielu.AspNetCore.Arazzo'],
    icon: 'arazzo',
    hue: 320,
    ...API_DESCRIPTIONS,
  },
  {
    slug: 'overlay',
    name: 'Overlay',
    group: 'flagship',
    tag: 'Overlays',
    summary: 'Overlay 1.0 / 1.1 engine for OpenAPI, AsyncAPI and Arazzo documents alike.',
    prefixes: ['Bielu.Overlay.', 'Bielu.AspNetCore.AsyncApi.Overlay', 'Bielu.AspNetCore.Arazzo.Overlay'],
    icon: 'overlay',
    hue: 25,
    ...API_DESCRIPTIONS,
  },
  {
    slug: 'api-tooling',
    name: 'CLI & build tooling',
    group: 'flagship',
    tag: 'Tooling',
    summary: 'dotnet tools, dotnet new templates and build-time document generation.',
    prefixes: [
      'Bielu.AspNetCore.AsyncApi.Cli',
      'Bielu.AspNetCore.AsyncApi.Templates',
      'Bielu.AspNetCore.AsyncApi.ApiDescription.Server',
      'Bielu.AspNetCore.ApiDescriptions',
      'Bielu.Spec.Shared',
      'Bielu.Cli.Shared',
    ],
    icon: 'api-tooling',
    hue: 220,
    ...API_DESCRIPTIONS,
  },

  // ---- Messaging & infrastructure ----------------------------------------------------------
  {
    slug: 'persistent-queues',
    name: 'Persistent Queues',
    group: 'infrastructure',
    tag: 'Queues',
    summary: 'High-performance store-and-forward message queue with pluggable LMDB and ZoneTree storage and strongly-typed messages.',
    prefixes: ['Bielu.PersistentQueues'],
    repo: 'https://github.com/bielu/Bielu.PersistentQueues',
    hue: 215,
  },
  {
    slug: 'orchestrator',
    name: 'Microservices Orchestrator',
    group: 'infrastructure',
    tag: 'Containers',
    summary: 'One abstraction over Docker, Podman, containerd and Kubernetes. Swap the container runtime with a single line of config.',
    prefixes: ['Bielu.Microservices.Orchestrator'],
    repo: 'https://github.com/bielu/bielu.microservices.orchestrator',
    icon: 'orchestrator',
    hue: 200,
  },
  {
    slug: 'aspire',
    name: 'Aspire extensions',
    group: 'infrastructure',
    tag: 'Aspire',
    summary: '.NET Aspire file-store resources plus 1Password and Infisical secret integrations for local and CI topologies.',
    prefixes: ['Bielu.Aspire.'],
    repo: 'https://github.com/bielu/Bielu.Aspire.Common',
    illustration: 'spark',
    hue: 275,
  },
  {
    slug: 'onepassword',
    name: '1Password secrets',
    group: 'infrastructure',
    tag: 'Secrets',
    summary: '1Password Connect secrets provider for Microsoft.Extensions.Configuration.',
    prefixes: ['Bielu.OnePassword'],
    repo: 'https://github.com/bielu/Bielu.OnePassword.AspNetCore.Configuration.Secrets',
    illustration: 'key',
    hue: 45,
  },

  // ---- Libraries & developer tooling -------------------------------------------------------
  {
    slug: 'entityframework',
    name: 'EF Core versioning',
    group: 'libraries',
    tag: 'EF Core',
    summary: 'Provider-agnostic content versioning for EF Core. No temporal tables, triggers or provider-specific SQL.',
    prefixes: ['Bielu.EntityFramework.'],
    repo: 'https://github.com/bielu/bielu.entityframework.extensions',
    illustration: 'database',
    hue: 140,
  },
  {
    slug: 'identity',
    name: 'LDAP identity',
    group: 'libraries',
    tag: 'Identity',
    summary: 'Authenticate and resolve roles against OpenLDAP or Active Directory in ASP.NET Core, with no local database.',
    prefixes: ['Bielu.AspNetCore.Identity'],
    repo: 'https://github.com/bielu/bielu.aspnetcore.identity',
    illustration: 'badge',
    hue: 10,
  },
  {
    slug: 'analyzers',
    name: 'Static code analyzers',
    group: 'libraries',
    tag: 'Roslyn',
    summary: 'Roslyn analyzers enforcing decorator naming, primary constructors and other conventions across the ecosystem.',
    prefixes: ['Bielu.StaticCode.'],
    repo: 'https://github.com/bielu/bielu.staticcode.analyzers',
    icon: 'analyzers',
    hue: 290,
  },
  {
    slug: 'common',
    name: 'Common libraries',
    group: 'libraries',
    tag: 'Building blocks',
    summary: 'Priority-based decorator registration for Scrutor and Kiota client utilities.',
    prefixes: ['Bielu.Common.'],
    repo: 'https://github.com/bielu/Bielu.Common.Libraries',
    illustration: 'blocks',
    hue: 235,
  },
];

export const GROUPS: Record<Exclude<ProjectGroup, 'flagship'>, { title: string; sub: string }> = {
  infrastructure: {
    title: 'Messaging & infrastructure',
    sub: 'Durable delivery, orchestration and secrets: the plumbing under distributed .NET systems.',
  },
  libraries: {
    title: 'Libraries & developer tooling',
    sub: 'Smaller pieces that keep the rest of the ecosystem consistent.',
  },
};

export interface Contribution {
  /** `owner/name` on GitHub. */
  repo: string;
  summary: string;
}

/** Headline figure, counted by hand from merged upstream pull requests. */
export const UPSTREAM_PRS_MERGED = 19;

export const CONTRIBUTIONS: Contribution[] = [
  {
    repo: 'scalar/scalar',
    summary:
      'Drove AsyncAPI support into Scalar: document-wide auth rendering, protocol bindings, broker security schemes and AsyncAPI 3.1 mocking over WebSocket and SSE. Also the Azure Functions and AWS Lambda .NET integrations, a URL-loadable plugin system and repo-wide Central Package Management.',
  },
  {
    repo: 'ByteBardOrg/AsyncAPI.NET',
    summary: 'Deserialization validation and spec-conformance fixes to the official continuation of LEGO.AsyncAPI.NET.',
  },
  {
    repo: 'OAI/Overlay-Specification',
    summary: 'Proposed the target document format declaration (targetFormat) so Overlay can address non-OpenAPI documents.',
  },
];
