Cleanup performed on 2025-10-24

What I changed

- Archived legacy `src/` folder (previous React Navigation / JS-based screens and components) to `archive/legacy-src-2025-10-24/`.
- Renamed `App.js` to `App.legacy.js` so the Expo Router entrypoint (`expo-router/entry`) is used as the main app and the legacy entry won't conflict.

Why

- The project uses Expo Router with the `app/` directory and TSX components. The legacy `src/` folder duplicated screens and components and cluttered the repo.

How to restore

- To restore the legacy files, move `archive/legacy-src-2025-10-24/src` back to `src` and rename `App.legacy.js` back to `App.js`:

```bash
mv archive/legacy-src-2025-10-24/src ./src
mv App.legacy.js App.js
```

Notes

- I used a safe archive approach (not permanent deletion). The codebase should continue using the `app/` folder and Expo Router.
- After this change I ran the project's linter. No fatal lint errors were reported in this session. If you want, I can also run a dev build or start the app and verify navigation flows interactively.
