8Land is an open pixel-art open-world game where players design and launch their own pixel-art worlds. The objective is to create an open-world game with the feel and nostalgia of Pokemon Gold and Silver, but where everybody pitches in with their own lands and games.

## Shared conventions

- Files in each project are organized as a hierarchy of features, concerns and UI sections.
- Do not create generic directories like `utils`, `helpers`, etc.
- Use the `tree` command in the terminal to inspect the file structure. Invoke: `tree --gitignore -a -F [path]`
    - `--gitignore`: respect `.gitignore` so ignored files are omitted.
    - `-a`: include hidden files.
    - `-F`: append `/` to directories and `*` to executables for clarity.
    - Optionally add `-L [depth]` to limit depth in large trees.
- do not create unnecessary functions. if code is not reused, just inline it.
- Avoid try/catch. Let the error bubble up, hit the global loggers and crash the thread.