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
Navigate through unique scenarios. Each choice impacts four critical pillars:
* 📢 **Public Approval:** Your standing with the citizens.
* 💰 **Economic State:** The financial health of your station.
* ⚡ **Station Energy:** Your most precious resource for survival.
* ⚖️ **Integrity:** The moral compass of your administration.

### ⚠️ The Lazarus Protocol
When your energy hits zero, the **Lazarus Protocol** activates—a last-ditch survival mechanism that forces players into high-risk, high-reward scenarios to bring the station back from the brink of collapse.

### 🛰️ Fleet Council — team multiplayer (new)
A second mode where **every team is a world** (1–4 pilots per world, 2–4 worlds per room):
* **Council polls:** each turn your world draws a crisis with **3–4 option cards**. Every pilot has one vote; most votes wins, ties are settled by a fair draw. Options on a card are balanced so each one has a real cost and a real gain.
* **Equal start:** every world begins with all stats at **50**, 50 gold, 50 ore and 3 ships.
* **Build your planet:** a Command Core caps seven upgradeable buildings (Gold Mine, Ore Refinery, Reactor, Shipyard, Shield Array, Habitat Ring). Spending on construction is a crew decision: one build plan per turn, approved like a raid (more yes than no, and at least half the crew says yes).
* **Harvest:** buildings fill their storage every turn. Harvesting moves it to the treasury and gives the pilot **EXP** and a chance at a **special card** (Overclock, Shield Matrix, Sabotage, Trade Convoy, Veto, Rally, Recruit Crew) for their personal inventory.
* **Combat & diplomacy online:** propose a raid on a rival world — it launches only if your crew agrees — or send them supplies and quick signals.
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
| **https://fleet-council.onrender.com/** | Everything, including Fleet Council online rooms. Free tier: after 15 minutes without visitors the first load takes 30–60 seconds. |
| https://hackathon-gu8x.onrender.com/ | Solo story and Fleet Council practice with bots (static hosting, no online rooms). |

## 🏃 How to Play
Requires [Node.js](https://nodejs.org/) 18 or newer. There are no packages to install.

1. Clone the repository and open its folder in PowerShell or Command Prompt.
2. Run `npm start` (or `.\tools\start-online.cmd`).
3. Open `http://localhost:8080/` in a modern browser.
4. **The Oval (solo):** choose Normal Mode and make decisions. Wallet and NFT actions are demonstrations, not real Sui transactions.
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
├── deliverables/        # Original hackathon presentation files
├── docs/                # Handover, assessment, and planning documents
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
| `web/styles.css` | The Oval presentation. |
| `web/world.css` | Fleet Council presentation. |
| `docs/` | Project handover, assessment, and planning documents. |
| `deliverables/` | Original presentation files. |
| `tests/` | Focused checks for game rules and content. |
| `tools/` | Repeatable local run and validation commands. |

Run checks with `.\tools\run-checks.cmd`. You can pass another port to the local server, for example `.\tools\start-local.cmd 8765`. The browser assets remain classic scripts so existing inline event handlers keep working; `window.TheOvalContent`, `window.TheOvalAudio`, and `window.TheOvalCore` are their explicit boundaries. Fleet Council scripts expose `window.FleetCouncilContent`, `FleetCouncilCore`, `FleetCouncilRoom` and `FleetCouncilArt`, and the same files are loaded by the Node server. Runtime data (`var/`) is git-ignored.

---

## 👤 About the Author
Created by Auraa, an 11th-grade group of students from Vietnam, passionate about the intersection of Space Lore and Blockchain technology.

---

## 📺 Demo Video
> **Watch the gameplay here:** https://www.youtube.com/watch?v=1O_4v6ecZNU