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

## 🏃 How to Play
1. Clone the repository and open its folder in a terminal.
2. Start a local HTTP server from the repository root with `python -m http.server 8000`.
3. Open `http://localhost:8000/` in a modern browser.
4. Choose Normal Mode and make decisions. Wallet and NFT actions are mock demonstrations, not real Sui transactions.

Stop the server with `Ctrl+C`.

## 🧩 Project Structure

* `index.html` — page structure and the ordered classic-script entry points.
* `styles.css` — presentation.
* `content.js` — card, story-arc, and ending data, including dynamic callbacks.
* `audio.js` — generated soundtrack and sound effects.
* `game-core.js` — DOM-independent initial state, choice effects, and reusable rules.
* `app.js` — browser UI, rendering, and game flow.
* `tests/game-core.test.js` — focused checks for the extracted game core.

Run the core checks with `node tests/game-core.test.js`. The browser assets are intentionally loaded as classic scripts for now so existing inline event handlers keep working; the `window.TheOvalContent`, `window.TheOvalAudio`, and `window.TheOvalCore` objects are their explicit boundaries.

---

## 👤 About the Author
Created by Auraa, an 11th-grade group of students from Vietnam, passionate about the intersection of Space Lore and Blockchain technology.

---

## 📺 Demo Video
> **Watch the gameplay here:** https://www.youtube.com/watch?v=1O_4v6ecZNU