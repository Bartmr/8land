This repository is a monorepo containing all the projects that make 8Land.

8Land is an open pixel-art open-world game where players design and launch their own pixel-art worlds. The objective is to create an open-world game with the feel and nostalgia of Pokemon Gold and Silver, but where everybody pitches in with their own lands and games.

## Shared conventions

- Do not create generic directories like `utils`, `helpers`, etc.
- there should be the least amount of moving parts (state, variables, asynchronous logic, effects, etc.) to achieve something.
- do not create unnecessary functions, constants and variables. if code is not reused, just inline it.
- Avoid try/catch. Let errors bubble up, hit the global error handlers, and crash the thread. Use return values for expected failure paths - not exceptions. Reserve exceptions only for truly unexpected conditions that the code cannot reasonably recover from.
- do not type values with `any` or use unsafe type casts. Either validate the value at runtime with Zod, check the instance type and throw an explicit error, or type it as `unknown`.
- avoid referencing the app's name in the code.
    - example: `8Land` should be `App`
- Avoid ternaries inside other ternaries.

## Project `./backend`

### Tech Stack

- Typescript
- NodeJS
- NestJS
- TypeORM 0.3
- Zod

## Project `./web-app`

### Tech Stack

- Typescript
- React
- Gatsby
- Bootstrap
- Phaser.js
- Zod
- React Hook Form
