/**
 * Hand-drawn project icons, shared with packages.bielu.pl (`src/assets/family-icons/` in
 * bielu/Bielu.EcoSystem). Each name is a complete SVG in `src/assets/project-icons/<name>.svg`, frame included.
 */
export const PROJECT_ICONS = ['protocol-bindings', 'scalar-consoles', 'arazzo', 'overlay', 'api-tooling', 'analyzers', 'orchestrator'] as const;

export type ProjectIconName = (typeof PROJECT_ICONS)[number];
