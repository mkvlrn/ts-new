export const PROJECT_TYPES = ['node', 'nest', 'vite', 'next'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];
export const PACKAGE_MANAGERS = ['npm', 'yarn', 'pnpm'] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];
