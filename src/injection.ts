import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';
import ora from 'ora';
import { ExecOptions } from '~/types.ts';

export const exec: (
  command: string,
  options?: ExecOptions,
) => Promise<{ stdout: string; stderr: string }> = promisify(_exec);

export const spinner = ora();
