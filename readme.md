# @mkvlrn/ts-new

This is a _very_ _VERY_ **VERY** opinionated CLI tool for the setup of a TypeScript project in pure Node.js, NestJS, Vite (for a React SPA), and Next.js, with a focus on code quality and consistency.

It attempts to provide a minimalistic setup with modern tools and practices without bloat - but bloat means different things to different people, so your mileage may vary.

## requirements

- Node.js 20+ - don't use anything lower than that, it's 2024
- npm 10+ (npx should be used to run the CLI tool, but you can pick any package manager you want for the project itself)
- Git - you should have it installed, if not, you're doing it wrong
- A unix-like shell - if you're on Windows, you should use WSL2 or Git Bash

## usage

Usage is as follows: `npx --yes @mkvlrn/ts-new@latest`. The CLI is interactive.

The `--yes` flag is used to skip the npx confirmation prompt, and the `@latest` tag is used to ensure you are always getting the latest version of the tool.

## tools and configurations

Each project will be an ESM (`type: module`) project with the following tools and configurations:

- [editorconfig](https://editorconfig.org/) to maintain consistent coding styles between different editors and IDEs
- [git](https://git-scm.com/) with a standard `.gitignore` file
- [prettier](https://prettier.io/) with a opinionated configuration on top of editorconfig
- [eslint](https://eslint.org/) with a few plugins and a configuration that aims to be somewhat strict without being too annoying; based on the recommended eslint rules for typescript and the awesome [unicorn rules](https://github.com/sindresorhus/eslint-plugin-unicorn)
- [vitest](https://vitest.dev/) as a test runner, because Jest is _terrible_
- [lint-staged](https://github.com/lint-staged/lint-staged) to glue together the other tools that need to run on staged files
- [husky](https://github.com/typicode/husky) to run the lint-staged commands on pre-commit hooks
- [commitlint](https://commitlint.js.org/) to enforce conventional commit messages
- [swc](https://swc.rs/) as a TypeScript compiler and dev runner, because it's _fast_

## another cli, huh?

Each available CLI out there brings some opinions and tools that might not be what you want or need, and this one is no different. The main difference is that this one is _my_ opinion, and I'm sharing it with you.

Instead of using `create-vite`, `@nestjs/cli`, or `create-next-app` tools to initialize those projects, this CLI tool will do it from scratch, adding only the tools and configurations that I think are necessary for a good starting point (see above).

NestJs and Next.js have their own way of doing things, and both of them are okay, but I think they can be improved. Also they seem to be very resistant to moving to ESM, and that's a shame.

## no huge readme with exhaustive explanations

Just generate a project and see for yourself. If you have any questions, feel free to open an issue or a PR.

The defaults are opinionated, but very sane and easy to adapt to your needs.

## a note on vscode

The CLI tool copies a `.vscode` folder with extension recommendations and settings that go well with the tools and configurations provided. You should install the recommended extensions to get the most out of the setup.
