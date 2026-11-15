# 🚀 THE OVAL: A Space Governance Simulator
**An Interactive Survival dApp built for the EVE Frontier SUI Hackathon.**

![Network](https://img.shields.io/badge/Network-SUI%20Testnet-blueviolet?style=for-the-badge&logo=sui)
![Category](https://img.shields.io/badge/Category-Game%20%26%20Utility-cyan?style=for-the-badge)
![Grade](https://img.shields.io/badge/Developer-Grade%2011-orange?style=for-the-badge)

---

## 🌌 Overview
**The Oval** is a high-stakes governance simulator set in the brutal, beautiful universe of **EVE Frontier**. As the Commander of a deep-space station, you are faced with impossible choices: Will you prioritize the economy at the cost of your soul? Or will you maintain your integrity as the station's lights fade into the void?

Every decision you make ripples through the station's systems, leading to multiple branching paths and unique legacies.

---

## 🎮 Core Features

### 🛠️ The Decision Engine (Cards & Arcs)
A run lasts 20, 30 or 40 decisions (pick the length on the title screen, which also has a short How to play). Each choice moves five visible bars and your Energy Core:
* 📢 **Public Approval:** your standing with the citizens.
* 🌐 **International Tension:** how close the world is to conflict.
* 💰 **Economic State:** the financial health of your station.
* 🛡️ **State Control:** your authority over the state.
* 🤝 **Party Loyalty:** how firmly your own party stands behind you.
* ⚡ **Energy Core:** spent or restored by choices, +1 every turn, flashes red below 25.

Hidden traits (Empathy, Integrity, Courage, Ideology) build your Moral Profile. Four story arcs (Convergence Route, The Scandal, The Revolution, The Permanent Record) can take over the run, and it ends in one of 12 endings.

### ⚠️ The Lazarus Protocol
If your Energy Core hits zero, the station collapses and the run ends at once with **The Lazarus Protocol** ending. Keep an eye on Energy as well as the five bars.

### 🛰️ Fleet Council — team multiplayer (new)
A second mode where **every team is a world** (1–4 pilots per world, 2–4 worlds per room):
* **Council polls:** each turn your world draws a crisis with **3–4 option cards**. Every pilot has one vote; most votes wins, and an exact tie takes the **average** of the tied options' effects. Options on a card are balanced so each one has a real cost and a real gain. About a third of polls are **crises** where every option loses something: the crew picks the least bad. Votes last 45 seconds by default (30/45/75), the turn report 12 seconds.
* **Equal start:** every world begins with all stats at **50**, 50 gold, 50 ore and 3 ships.
* **Build your planet:** a Command Core caps seven upgradeable buildings (Gold Mine, Ore Refinery, Reactor, Shipyard, Shield Array, Habitat Ring); Core Lv2 costs 50 gold + 50 ore, so a 10-turn match usually reaches Lv2–3. Spending on construction is a crew decision: one build plan per turn, approved like a raid (more yes than no, and at least half the crew says yes).
* **Harvest:** buildings fill their storage every turn. Harvesting moves it to the treasury and gives the pilot **EXP** and a chance at a **special card** (Overclock, Shield Matrix, Sabotage, Trade Convoy, Veto, Rally, Recruit Crew) for their personal inventory. Every world starts with as many cards as the largest crew and can play about as many per turn, so a solo pilot against a crew of four holds and plays four times as many. Smaller crews also get +2% production per pilot fewer than the largest crew, and harvest and card EXP are scaled by crew size; in bot tests a crew of four beats a solo pilot about 51% of the time.
* **Combat & diplomacy online:** a winning raid takes half the rival's gold, 40% of their ore, half their unharvested storage and 30 gold + 30 ore in spoils; repelling one pays 15 gold. Aid sends 20 and arrives as 30, earns the giver Morale and Economy, and stops the receiver raiding the giver for 2 turns. Quick signals between worlds.
* **Catch-up:** worlds below 90% of the leader's power get +30% production and +25% defence; a raided world gets +30% attack against its raider for 2 turns.
* **Shared treasury, shared decisions:** everything that spends the world's resources or fleet (construction, ship orders of 1–3 ships, aid, raids) is a crew plan: one of each kind per turn, decided when the vote ends (more yes than no, and at least half the crew says yes).
* **Illustrated:** the planet is drawn from its state (buildings, orbiting ships, shields, blackouts, smoke after a lost raid); every crisis and battle has its own illustration.
* **Ranking:** a per-pilot EXP ranking in each match and an all-time pilot ranking on the server. An optional 4–8 digit **PIN** reserves a pilot name; only PIN-protected pilots enter the all-time ranking, and the PIN also lets you continue on another device.
* **Survives restarts:** rooms, accounts and the ranking are saved, so a server restart or free-tier spin-down resumes matches where they stopped.
* **Practice offline:** play against labelled bots without a server.

### 💠 Web3 Integration (Prototype Phase)
* **Wallet Connect:** Integrated mock-up for SUI Wallet connectivity.
* **Legacy Minting:** Record your reign on-chain. At the end of each run, players can "Mint their Legacy" as a unique NFT on the Sui Network (Mock).
* **Social Proof:** Integrated "Share to X" functionality to showcase your leadership stats.

---

## 🛠 Tech Stack
* **Frontend:** HTML5, CSS3 (Modern Glassmorphism), Vanilla JavaScript.
* **UI/UX:** Space-aesthetic HUD with real-time bar animations.
* **Blockchain Concept:** Move Language (Roadmap), Sui dApp Kit (Roadmap).

---

## 🗺 Strategic Roadmap (The Vision)
- [x] **Phase 1 (Hackathon):** Interactive UI/UX, core game loop, and simulated Web3 interactions.
- [ ] **Phase 2 (Post-Hackathon):** - Implement **Sui zkLogin** for seamless pilot onboarding.
    - Deploy **Move Smart Contracts** to store "Station Legacies" as Dynamic NFTs.
- [ ] **Phase 3:** Integration with **EVE Frontier Stillness SDK** for cross-platform resource trading.

---

## 🌐 Live links
| Link | What works |
| --- | --- |
| **https://fleet-council.onrender.com/** | Everything: the solo story (`/`) and Fleet Council (`/world.html`) with online rooms and practice. Free tier: after 15 minutes without visitors the first load takes 30–60 seconds. |

## 🏃 How to Play
Requires [Node.js](https://nodejs.org/) 18 or newer. There are no packages to install.

1. Clone the repository and open its folder in PowerShell or Command Prompt.
2. Run `npm start` (or `.\tools\start-online.cmd`).
3. Open `http://localhost:8080/` in a modern browser.
4. **Solo story:** choose Normal Mode (click 20, 30 or 40 for the run length) and make decisions. Wallet and NFT actions are demonstrations, not real Sui transactions.
5. **Fleet Council (team):** choose Fleet Council, enter a name and create a room. Friends join with the 4-letter code or the invite link. The host picks the world count, turns and vote time, adds bots if needed, and launches the match.

Stop the server with `Ctrl+C`. The solo mode and Fleet Council practice also work from any static host (`.\tools\start-local.cmd` serves them on port 8000); online rooms need the Node server.

### Deploying on Render
- **Web Service** (online rooms): Language `Node`, Build Command `npm install`, Start Command `npm start`, Health Check Path `/healthz`. Render provides `PORT`.
- **Storage:** set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (free Upstash Redis database, REST API section) so rooms, PIN accounts and the ranking survive restarts and deploys. Without them the server writes JSON files to `var/` (or `DATA_DIR`), which a free Render instance loses whenever it restarts. Changed rooms are saved every 15 seconds and on shutdown (SIGTERM).
- **Static Site**: publish the repository root; online rooms are switched off and the page offers practice plus a link to the online server.

## 🧩 Project Structure

```text
Hackathon/
├── app/                 # Browser UI, game rules, and audio (both modes)
├── data/                # Cards, story arcs, endings, Fleet Council content
├── server/              # Fleet Council online server (Node, no dependencies)
├── docs/PROJECT.md      # The project document: decisions, status, history, roadmap
├── old/                 # Archive: October 2026 planning docs and the hackathon slides/script
├── tests/               # Focused automated checks
├── tools/               # Local run and validation scripts
├── web/                 # Stylesheets and browser presentation assets
├── index.html           # Static-host entry point (kept at repository root)
├── world.html           # Fleet Council entry point
└── README.md
```

| Location | Responsibility |
| --- | --- |
| `index.html` | Stable entry point for static hosting; loads the browser assets in order. |
| `app/client.js` | Browser UI, rendering, and game flow. |
| `app/game-core.js` | DOM-independent initial state and choice rules. |
| `app/audio.js` | Generated soundtrack and sound effects. |
| `data/content.js` | Card, story-arc, and ending data, including dynamic callbacks. |
| `world.html` | Fleet Council page. |
| `data/world-content.js` | Fleet Council crises, buildings, special cards and signals. |
| `app/world-core.js` | Fleet Council rules: polls, effects, building, harvest, raids, turn resolution, EXP. Pure and seeded. |
| `app/world-room.js` | Fleet Council room: lobby, phases, timers, bots, per-player snapshots. Runs on the server and in the browser. |
| `app/world-art.js` | Generated SVG illustrations (planet, buildings, crises, battles, cards). |
| `app/world-client.js` | Fleet Council browser UI and online/offline transports. |
| `server/server.js` | Static files, JSON API, Server-Sent Events, PIN accounts, the all-time ranking and room saving. |
| `server/storage.js` | Key-value storage: Upstash Redis over HTTPS, or JSON files. |
| `web/styles.css` | Solo story presentation. |
| `web/world.css` | Fleet Council presentation (also used by the feedback page). |
| `docs/PROJECT.md` | Single living project document (Vietnamese): decisions, current status, PR history, open questions, roadmap. |
| `old/` | Read-only archive: earlier planning/review documents and the original hackathon script and slides. |
| `tests/` | Focused checks for game rules and content. |
| `tools/` | Repeatable local run and validation commands. |

Run checks with `.\tools\run-checks.cmd`. You can pass another port to the local server, for example `.\tools\start-local.cmd 8765`. The browser assets remain classic scripts so existing inline event handlers keep working; `window.TheOvalContent`, `window.TheOvalAudio`, and `window.TheOvalCore` are their explicit boundaries. Fleet Council scripts expose `window.FleetCouncilContent`, `FleetCouncilCore`, `FleetCouncilRoom` and `FleetCouncilArt`, and the same files are loaded by the Node server. Runtime data (`var/`) is git-ignored.

---

## 👤 About the Author
Created by Auraa, an 11th-grade group of students from Vietnam, passionate about the intersection of Space Lore and Blockchain technology.

---

## 📺 Demo Video
> **Watch the gameplay here:** https://www.youtube.com/watch?v=1O_4v6ecZNU