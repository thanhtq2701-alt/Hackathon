# CLAUDE.md

## Working guidelines

1. **Think before coding.** Analyze thoroughly. If requirements are unclear or ambiguous, ask questions first instead of guessing or making assumptions.
2. **Keep it simple.** Implement the simplest solution that works. Do not add unrequested features, over-engineer, or introduce unnecessary abstractions.
3. **Modify the right place.** Limit changes strictly to the relevant scope. Do not touch, refactor, or break unrelated code.
4. **Goal-driven execution.** Define explicit verification criteria and run tests or checks iteratively until the goal is fully achieved.

## Project

Two browser games sharing one repo, plain JavaScript, no build step and no npm dependencies.

- **The Oval** (`index.html`): solo card-based governance story. Rules in `app/game-core.js`, UI in `app/client.js`, content in `data/content.js`, styles in `web/styles.css`.
- **Fleet Council** (`world.html`): team multiplayer. Rules in `app/world-core.js` (pure, seeded), rooms/phases/bots in `app/world-room.js`, art in `app/world-art.js`, UI in `app/world-client.js`, content in `data/world-content.js`, styles in `web/world.css`, server in `server/server.js`.

Browser scripts are classic scripts that attach to `window` (`TheOval*`, `FleetCouncil*`) and also export with `module.exports`, so the same files run in Node tests and on the server.

## Commands

- Run everything: `npm start` → `http://localhost:8080/` (Node 18+).
- Static only (solo + Fleet Council practice): `.\tools\start-local.cmd` → port 8000.
- Checks: `.\tools\run-checks.cmd` (syntax checks + `tests/game-core.test.js` + `tests/world-core.test.js`). Run before every commit.

## Deployments (Render, auto-deploy from `main`)

- `https://fleet-council.onrender.com` — Web Service (`npm start`), full game including online rooms. Free tier: sleeps after 15 minutes idle, no persistent disk.
- `https://hackathon-gu8x.onrender.com` — Static Site, solo + practice only; links to the Web Service for online play (`ONLINE_URL` in `app/world-client.js`).

## Things to keep in mind

- Fleet Council card options must stay balanced: the test requires every option on a card to be within 1 point of the others (`optionValue` in `app/world-core.js`) and to have both a gain and a cost.
- Results shown to players must come from the change actually applied, not from the raw card numbers.
- Online rooms need the Node server; on static hosting the page falls back to offline practice. Rooms live in memory; the all-time ranking is `var/leaderboard.json` (git-ignored, `DATA_DIR` overrides the folder).
- Wallet and NFT features are demos and must be labelled as such.
- `docs/` holds Vietnamese planning and review documents; `deliverables/` holds the original hackathon files. Do not edit them unless asked.
- Workflow: work on a branch, open a pull request, merge only after the owner confirms.
