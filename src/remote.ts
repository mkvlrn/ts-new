import { rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import AdmZip from 'adm-zip';
import { spinner } from '~/injection.ts';
import { GithubRepoResponse } from '~/types.ts';

async function templateList(): Promise<GithubRepoResponse[]> {
  try {
    spinner.start('fetching template list');
    const response = await fetch(
      'https://api.github.com/users/mkvlrn/repos?type=public',
    );
    const repos = (await response.json()) as GithubRepoResponse[];
    spinner.succeed();

    return repos.filter((repo) => repo.is_template);
  } catch (error) {
    spinner.fail();
    throw new Error(
      `failed to fetch template list (${(error as Error).message})`,
    );
  }
}

async function fetchRepo(
  templateName: string,
  projectName: string,
): Promise<void> {
  try {
    spinner.start('fetching template');
    const response = await fetch(
      `https://api.github.com/repos/mkvlrn/${templateName}/zipball`,
    );
    const buffer = await response.arrayBuffer();
    const zipPath = path.join(process.cwd(), `${projectName}.zip`);
    await writeFile(zipPath, Buffer.from(buffer));

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(process.cwd(), true);
    const unzippedName = zip.getEntries()[0].rawEntryName;

    await rename(unzippedName, projectName);
    await unlink(zipPath);

    spinner.succeed();
  } catch (error) {
    spinner.fail();
    throw new Error(`failed to fetch template (${(error as Error).message})`);
  }
}

export const remote = {
  templateList,
  fetchRepo,
};
