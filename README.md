# README #

## Set up and run

Clone the repo to your machine, checkout your desired branch and install dependencies with `yarn`.

**Important**: use [Yarn classic (v1.x)](https://classic.yarnpkg.com/en/docs/install)

Serve project:

```sh
yarn serve
```

## Issue workflow

1. Team members assign themself to as task (or are assigned tasks)
2. Create a new branch from staging with the same ID as the task and do all changes on that branch (CHW-XX on web and CM-XX on mobile)
3. Make required changes
4. Submit it for review and create a pull request to merge into staging - one of the senior team members gets assigned to review it
5. If it passes review, merge into staging and move the task into staging
6. If there are issues, request changes and move it back to in progress


## Git workflow

In order to avoid complex git conflicts, it's recommended to `rebase` instead `merge` when targeting `staging` or `master` branches. Example:

```sh
git checkout CHW-XXX
git rebase staging
```

## Editor plugins

You'll need to install some tools in your editor to get linting, syntax highlighting and formatting when saving files.

- Vetur (or the Vue syntax highlighting tool for you specific editor): [VSCode](https://marketplace.visualstudio.com/items?itemName=octref.vetur), [Atom](https://atom.io/packages/language-vue)
- Eslint (lint Javascript): [VSCode](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), [Atom](https://atom.io/packages/eslint)
- Prettier (autoformats CSS and HTML): [VSCode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), [Atom](https://atom.io/packages/prettier-atom)
