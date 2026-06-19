This repository is a monorepo containing all the projects that make 8Land.

8Land is an open pixel-art open-world game where players design and launch their own pixel-art worlds. The objective is to create an open-world game with the feel and nostalgia of Pokemon Gold and Silver, but where everybody pitches in with their own lands and games.

## Shared conventions

- Files in each project are organized as a hierarchy of features, concerns and UI sections.
    - global, wider or more generic logic is placed higher in the directory tree, while local, narrower or more specific logic is placed deeper in the directory tree.
- Do not create generic directories like `utils`, `helpers`, etc.
- there should be the least amount of moving parts (state, variables, asynchronous logic, effects, etc.) to achieve something.
- do not create unnecessary functions and variables. if code is not reused, just inline it.
- Avoid try/catch. Let the error bubble up, hit the global loggers and crash the thread.

## `./web-app`

### Tech Stack

- Typescript
- React
- Gatsby
- Bootstrap
- Phaser.js