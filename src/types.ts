import { ExecOptions as _ExecOptions } from 'node:child_process';

export interface GithubRepoResponse {
  name: string;
  full_name: string;

  description: string;

  is_template: boolean;
}

export interface ExecOptions extends _ExecOptions {
  stdio?: 'pipe' | 'ignore' | 'inherit' | ('pipe' | 'ignore' | 'inherit' | null | number)[];
}

export type Exec = (
  command: string,
  options?: ExecOptions,
) => Promise<{
  stdout: string;
  stderr: string;
}>;

export type PackageManager = 'npm' | 'yarn' | 'pnpm';
