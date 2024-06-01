export class ProjectError extends Error {
  projectPath: string;
  constructor(message: string, projectPath: string) {
    super(message);
    this.name = 'ProjectError';
    this.projectPath = projectPath;
  }
}
