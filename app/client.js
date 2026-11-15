const { CARDS, ARCS, ENDINGS } = window.TheOvalContent;
const Music = window.TheOvalAudio;
const TheOvalCore = window.TheOvalCore;

    // ═══════════════════════════════════════════════════════════
    // SETTINGS & CHEAT ENGINE
    // ═══════════════════════════════════════════════════════════
    function openSettings() {
      document.getElementById('settings-modal-overlay').classList.add('active');
    }

    function closeSettings() {
      document.getElementById('settings-modal-overlay').classList.remove('active');
    }

    function changeTrack(val) {
      Music.setTrack(val);
      showNotif("Soundtrack profile updated.");
    }

    function toggleCheatMode() {
      const console = document.getElementById('cheat-console');
      const btn = document.getElementById('cheat-toggle-btn');

      if (console.style.display === 'flex') {
        console.style.display = 'none';
        btn.textContent = 'Enable Console';
        gs.cheatMode = false;
      } else {
        console.style.display = 'flex';
        btn.textContent = 'Disable Console';
        gs.cheatMode = true;
        updateCheatUI();
        initDraggable(console, document.getElementById('cheat-handle'));
        showNotif("OVAL_CONSOLE_V1.0 ACTIVE");
      }
    }

    function initDraggable(el, handle) {
      let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      handle.onmousedown = dragMouseDown;

      function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
      }

      function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        el.style.top = (el.offsetTop - pos2) + "px";
        el.style.left = (el.offsetLeft - pos1) + "px";
        el.style.right = 'auto'; // Break fixed right anchor
      }

      function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }

    function updateCheatUI() {
      if (!gs.cheatMode) return;

      const varsWrap = document.getElementById('cheat-vars');
      const hiddenWrap = document.getElementById('cheat-hidden');

      // Main Stats
      const barKeys = {
        publicApproval: 'Approval',
        internationalTension: 'Tension',
        economicState: 'Economy',
        stateAuthority: 'Authority',
        partyLoyalty: 'Loyalty'
      };

      varsWrap.innerHTML = Object.entries(barKeys).map(([key, label]) => `
        <div class="cheat-stat-row">
          <span>${label}: <span class="cheat-val">${gs.bars[key]}</span></span>
          <div class="cheat-btn-group">
            <button class="cheat-btn" onclick="cheatModifyStat('${key}', -5)">-</button>
            <button class="cheat-btn" onclick="cheatModifyStat('${key}', 5)">+</button>
          </div>
        </div>
      `).join('');

      // Hidden Stats
      hiddenWrap.innerHTML = `
        <div>EMP: <span class="cheat-val">${gs.empathy}</span></div>
        <div>INT: <span class="cheat-val">${gs.integrity}</span></div>
        <div>COU: <span class="cheat-val">${gs.courage}</span></div>
        <div>IDEO: <span class="cheat-val">${gs.ideologyScore}</span></div>
      `;
    }

    function cheatModifyStat(key, delta) {
      gs.bars[key] = clamp(gs.bars[key] + delta, 0, 100);
      updateHUD(true);
      updateCheatUI();
    }

    function cheatAddTurn() {
      gs.turn = clamp(gs.turn + 1, 1, gs.maxTurns);
      updateHUD(true);
      updateCheatUI();
      showNotif("Executive Order: Time advanced.");
    }

    function cheatUnlockGallery() {
      gs.fullUnlock = true;
      showNotif("ALL FILES DECRYPTED. ACCESS GALLERY VIA MAIN MENU.");
    }

    // ═══════════════════════════════════════════════════════════
    // GAME STATE
    // ═══════════════════════════════════════════════════════════
    let gs;
    let galleryLastScreen = 'title-screen';
    let transitioning = false;
    let awaitingContinue = false;
    let pendingAdvance = null;

    function initState(turns) {
      gs = TheOvalCore.createInitialState(Math.random, turns);
      transitioning = false;
      awaitingContinue = false;
      pendingAdvance = null;
    }

    // ═══════════════════════════════════════════════════════════
    // HUD
    // ═══════════════════════════════════════════════════════════
    const clamp = TheOvalCore.clamp;

    function updateHUD(animate) {
      const td = document.getElementById('turn-display');
      td.textContent = gs.turn;
      if (animate) { td.classList.remove('pop'); void td.offsetWidth; td.classList.add('pop'); }
      document.getElementById('turn-total').textContent = ' / ' + gs.maxTurns;
      document.getElementById('progress-fill').style.width = ((gs.turn - 1) / gs.maxTurns * 100) + '%';

      const mapKeys = { approval: 'publicApproval', tension: 'internationalTension', eco: 'economicState', unrest: 'stateAuthority', party: 'partyLoyalty' };
      ['approval', 'tension', 'eco', 'unrest', 'party'].forEach(k => {
        const stateKey = mapKeys[k];
        const v = clamp(gs.bars[stateKey], 0, 100);
        document.getElementById('val-' + k).textContent = v;
        document.getElementById('bar-' + k).style.width = v + '%';
        const row = document.getElementById('brow-' + k);
        const danger = (k === 'approval' && v < 25) || (k === 'tension' && v > 80) || (k === 'eco' && v < 25) || (k === 'unrest' && v > 80) || (k === 'party' && v < 20);
        row.classList.toggle('danger', danger);
      });
      if (gs.energy !== undefined) {
        document.getElementById('val-energy').textContent = gs.energy;
        document.getElementById('bar-energy').style.width = gs.energy + '%';
        const erow = document.getElementById('brow-energy');
        erow.classList.toggle('danger', gs.energy < 25); // Under 25% will auto-flash red
      }
      
      const arcLbl = document.getElementById('arc-label-hud');
      if (gs.activeArc) { arcLbl.style.display = 'inline'; arcLbl.textContent = '⚡ ' + gs.activeArc.name.toUpperCase(); }
      else arcLbl.style.display = 'none';
    }

    // ═══════════════════════════════════════════════════════════
    // DELTA FLOATS
    // ═══════════════════════════════════════════════════════════
    function showDeltas(choice) {
      const barKeys = ['approval', 'tension', 'eco', 'unrest', 'party', 'energy']; // Add energy
      barKeys.forEach(k => {
        let delta = choice[k] || 0;
        if (!delta) return;
        const row = document.getElementById('brow-' + k);
        const el = document.createElement('span');
        el.className = 'delta-float';
        // Declare energy increase as Good (Good)
        const isGood = (k === 'approval' || k === 'party' || k === 'eco' || k === 'energy') ? delta > 0 : delta < 0;
        el.classList.add(isGood ? 'delta-good' : 'delta-bad');
        el.textContent = (delta > 0 ? '+' : '') + delta;
        row.appendChild(el);
        setTimeout(() => el.remove(), 1700);
      });
    }

    // ═══════════════════════════════════════════════════════════
    // RESULT CHIPS
    // ═══════════════════════════════════════════════════════════
    const BAR_LABELS = { approval: 'Public Approval', tension: 'Interstellar Tension', eco: 'Economic State', unrest: 'State Control', party: 'Party Loyalty', energy: 'Energy Core' };
    const HIDDEN_LABELS = { empathy: 'Empathy', integrity: 'Integrity', courage: 'Courage', ideology: 'Ideology' };
    function showResultFlash(choice) {
      const rf = document.getElementById('result-flash');
      rf.innerHTML = '';
      const barKeys = ['approval', 'tension', 'eco', 'unrest', 'party', 'energy']; // Add energy
      let hasAny = false;
      barKeys.forEach(k => {
        let d = choice[k] || 0;
        if (!d) return;
        hasAny = true;
        // Declare energy increase as Good (Good)
        const isGood = (k === 'approval' || k === 'party' || k === 'eco' || k === 'energy') ? d > 0 : d < 0;
        const chip = document.createElement('div');
        chip.className = 'result-chip ' + (isGood ? 'good' : 'bad');
        chip.textContent = BAR_LABELS[k] + ' ' + (d > 0 ? '+' : '') + d;
        rf.appendChild(chip);
      });
      if (!hasAny) return;
      rf.classList.add('visible');
      setTimeout(() => { rf.classList.remove('visible'); rf.innerHTML = ''; }, 2200);
    }

    // ═══════════════════════════════════════════════════════════
    // CARD RENDERING
    // ═══════════════════════════════════════════════════════════
    function renderCard(card, topic) {
      awaitingContinue = false;
      pendingAdvance = null;
      document.getElementById('continue-wrap').classList.remove('visible');
      const card_el = document.getElementById('card');
      card_el.style.animation = 'none';
      void card_el.offsetWidth;
      card_el.style.animation = '';
      card_el.className = '';
      void card_el.offsetWidth;
      // Force re-enter animation
      card_el.style.animation = 'cardEnter .4s cubic-bezier(.22,1,.36,1) forwards';
      document.getElementById('card-tag').textContent = topic.toUpperCase().replace('CIVILRIGHTS', 'CIVIL RIGHTS');
      document.getElementById('card-title').textContent = card.title;
      document.getElementById('card-body').textContent = card.body;
      renderChoiceCards(card.choices, topic, card.title, false);
    }

    function renderArcAct(arc, actIdx) {
      awaitingContinue = false;
      pendingAdvance = null;
      document.getElementById('continue-wrap').classList.remove('visible');
      if (arc.id === 'convergence_route') document.getElementById('hud').style.display = 'none';
      const act = TheOvalCore.resolveAct(arc.acts[actIdx], gs);
      const banner = document.getElementById('arc-banner');
      banner.style.display = 'block';
      banner.classList.add('visible');
      // Re-trigger animation
      banner.style.animation = 'none'; void banner.offsetWidth;
      banner.style.animation = 'arcReveal .5s cubic-bezier(.22,1,.36,1) forwards';
      document.getElementById('arc-tag').textContent = act.tag;
      document.getElementById('arc-title').textContent = act.title;
      document.getElementById('arc-body').textContent = act.body;
      // Card shows as arc
      const card_el = document.getElementById('card');
      card_el.style.animation = 'cardEnter .4s cubic-bezier(.22,1,.36,1) forwards';
      document.getElementById('card-tag').textContent = '⚡ STORY ARC';
      document.getElementById('card-title').textContent = '';
      document.getElementById('card-body').textContent = '';
      renderChoiceCards(act.choices, 'arc', act.title, true);
      updateHUD(false);
    }

    function topicTheme(topic) {
      if (topic === 'environment') return "repeating-linear-gradient(70deg,rgba(19,19,23,.2) 0 2px,transparent 2px 8px),radial-gradient(circle at 24% 68%,rgba(19,19,23,.32) 0 18px,transparent 19px),radial-gradient(circle at 64% 44%,rgba(19,19,23,.22) 0 14px,transparent 15px)";
      if (topic === 'war' || topic === 'tension') return "repeating-linear-gradient(35deg,rgba(19,19,23,.22) 0 3px,transparent 3px 8px),linear-gradient(180deg,transparent 0 32%,rgba(19,19,23,.2) 32% 38%,transparent 38% 62%,rgba(19,19,23,.2) 62% 68%,transparent 68% 100%)";
      if (topic === 'economy') return "repeating-linear-gradient(90deg,rgba(19,19,23,.17) 0 2px,transparent 2px 8px),radial-gradient(circle at 70% 26%,rgba(19,19,23,.26) 0 16px,transparent 17px)";
      if (topic === 'civilrights') return "repeating-linear-gradient(120deg,rgba(19,19,23,.18) 0 2px,transparent 2px 7px),radial-gradient(circle at 30% 30%,rgba(19,19,23,.22) 0 12px,transparent 13px),radial-gradient(circle at 72% 72%,rgba(19,19,23,.2) 0 11px,transparent 12px)";
      if (topic === 'scandal') return "repeating-linear-gradient(150deg,rgba(19,19,23,.2) 0 2px,transparent 2px 6px),radial-gradient(circle at 52% 50%,rgba(19,19,23,.28) 0 20px,transparent 21px)";
      return "repeating-linear-gradient(45deg,rgba(19,19,23,.16) 0 2px,transparent 2px 8px)";
    }

    function woodblockIconSvg(topic) {
      const t = (topic || '').toLowerCase();
      if (t === 'environment') return `
    <svg viewBox="0 0 120 160" aria-hidden="true" focusable="false">
      <path class="woodblock-stroke" d="M60 140V88"/>
      <path class="woodblock-stroke" d="M60 104c-10 8-18 18-22 30M60 112c12 7 20 16 24 28"/>
      <path class="woodblock-stroke" d="M60 90c-20-6-34-18-38-34 10 4 18 4 26 0-6-8-8-16-6-24 8 6 16 8 24 6 0-12 6-22 18-30 12 8 18 18 18 30 8 2 16 0 24-6 2 8 0 16-6 24 8 4 16 4 26 0-4 16-18 28-38 34"/>
      <path class="woodblock-stroke" d="M38 68c10 8 18 12 22 12M82 68c-10 8-18 12-22 12"/>
      <path class="woodblock-stroke" d="M46 44c6 6 12 9 14 9M74 44c-6 6-12 9-14 9"/>
    </svg>`;
      if (t === 'economy') return `
    <svg viewBox="0 0 120 160" aria-hidden="true" focusable="false">
      <circle class="woodblock-stroke" cx="60" cy="72" r="38"/>
      <circle class="woodblock-stroke" cx="60" cy="72" r="16"/>
      <path class="woodblock-stroke" d="M60 34v18M60 92v18M22 72h18M80 72h18"/>
      <path class="woodblock-stroke" d="M33 45l13 13M74 86l13 13M87 45L74 58M46 86L33 99"/>
      <path class="woodblock-stroke" d="M32 124h56"/>
      <path class="woodblock-stroke" d="M38 134h44"/>
      <path class="woodblock-stroke" d="M44 144h32"/>
    </svg>`;
      if (t === 'war' || t === 'tension') return `
    <svg viewBox="0 0 120 160" aria-hidden="true" focusable="false">
      <path class="woodblock-stroke" d="M36 144V38"/>
      <path class="woodblock-stroke" d="M36 44c22-10 42-8 60 6-16 12-36 18-60 18z"/>
      <path class="woodblock-stroke" d="M84 144V54"/>
      <path class="woodblock-stroke" d="M84 60c-18-8-34-6-48 6 12 10 28 14 48 14z"/>
      <path class="woodblock-stroke" d="M24 144h72"/>
      <path class="woodblock-stroke" d="M58 116c6-10 16-14 30-12-4 14-14 22-30 24-16-2-26-10-30-24 14-2 24 2 30 12z"/>
    </svg>`;
      if (t === 'civilrights') return `
    <svg viewBox="0 0 120 160" aria-hidden="true" focusable="false">
      <path class="woodblock-stroke" d="M60 30v92"/>
      <path class="woodblock-stroke" d="M28 54h64"/>
      <path class="woodblock-stroke" d="M40 54c-10 14-18 22-24 24 8 6 16 10 24 10"/>
      <path class="woodblock-stroke" d="M80 54c10 14 18 22 24 24-8 6-16 10-24 10"/>
      <path class="woodblock-stroke" d="M52 122h16"/>
      <path class="woodblock-stroke" d="M44 140h32"/>
      <path class="woodblock-stroke" d="M34 140c6-10 18-16 26-16s20 6 26 16"/>
    </svg>`;
      // Technology (not currently a topic in this game) + fallback: celestial eye.
      return `
    <svg viewBox="0 0 120 160" aria-hidden="true" focusable="false">
      <circle class="woodblock-stroke" cx="60" cy="66" r="20"/>
      <path class="woodblock-stroke" d="M24 66c10-16 22-24 36-24s26 8 36 24c-10 16-22 24-36 24S34 82 24 66z"/>
      <circle class="woodblock-fill" cx="60" cy="66" r="5"/>
      <path class="woodblock-stroke" d="M60 24v10M60 98v10M18 66h10M92 66h10"/>
      <path class="woodblock-stroke" d="M30 36l8 8M82 36l-8 8M30 96l8-8M82 96l-8-8"/>
      <path class="woodblock-stroke" d="M36 132c8-10 16-14 24-14s16 4 24 14c-8 10-16 14-24 14s-16-4-24-14z"/>
    </svg>`;
    }

    function outcomeLines(choice) {
      const keys = ['approval', 'tension', 'eco', 'unrest', 'party', 'energy']; // Thêm energy
      const res = [];
      keys.forEach(k => {
      if (!choice[k]) return;
      const delta = choice[k];
      let isGood;
      if (k === 'unrest') {
        const highAuthority = gs.bars.stateAuthority >= 70;
        isGood = highAuthority ? delta < 0 : delta > 0;
      } else {
        // Declare energy increase as Good (Good)
        isGood = (k === 'approval' || k === 'party' || k === 'eco' || k === 'energy') ? delta > 0 : delta < 0;
      }
      res.push({ text: `${BAR_LABELS[k]} ${(delta > 0 ? '+' : '') + delta}`, isGood });
    });
    return res;
    }

    function getChoiceOutcomeText(originalChoice, effectiveChoice, topic) {
      if (originalChoice && originalChoice.resignation) return gs.resigned ? originalChoice.outcomeAccepted : originalChoice.outcomeRefused;
      if (originalChoice && originalChoice.outcome) return originalChoice.outcome;
      // Describe only; state changes happen once, in TheOvalCore.applyChoice.
      // (This used to add the deltas to gs a second time, under the wrong bar keys.)
      const positives = [];
      const negatives = [];
      outcomeLines(effectiveChoice).forEach((line, i) => {
        const label = line.text.replace(/ [+-]?\d+(\.\d+)?$/, '');
        (line.isGood ? positives : negatives).push(label);
      });

      if (topic === 'environment' && negatives.includes('State Control')) return 'The policy stabilizes supply quickly, but environmental and community costs spark new backlash.';
      if (positives.length && negatives.length) return `Short-term gains for ${positives.join(', ')} come with pressure on ${negatives.join(', ')}.`;
      if (positives.length) return `The move lands well and improves ${positives.join(', ')}.`;
      if (negatives.length) return `The decision carries risk, with strain concentrated on ${negatives.join(', ')}.`;
      return 'Impact is limited for now, but stakeholders will watch implementation closely.';
    }

    function renderChoiceCards(choices, topic, cardTitle, isArc) {
      const choicesEl = document.getElementById('choices');

      // Only fade out if there are existing cards (not first load)
      const hasExistingCards = choicesEl.innerHTML.trim().length > 0;

      if (hasExistingCards) {
        choicesEl.style.transition = 'opacity 200ms ease-out';
        choicesEl.style.opacity = '0';
      } else {
        // First load - set opacity immediately without fading
        choicesEl.style.transition = 'none';
        choicesEl.style.opacity = '1';
      }

      setTimeout(() => {
        // Clear old cards after fade-out completes
        choicesEl.innerHTML = '';
        // Track card flip states for 2-stage flip
        window.cardFlipStates = window.cardFlipStates || {};

        choices.forEach((c, i) => {
          const card = document.createElement('div');
          const cardId = `card-${Date.now()}-${i}`;
          card.id = cardId;
          card.className = 'card choice-card face-down';
          card.style.animationDelay = `${0.06 * i}s`;
          card.style.setProperty('--theme-bg', topicTheme(topic));
          const icon = woodblockIconSvg(topic);

          // New exact structure:
          // <div class="card">
          //   <div class="card-inner">
          //     <div class="card-front">Icon/seal</div>
          //     <div class="card-back">Answer text</div>
          //   </div>
          // </div>
          card.innerHTML = `
        <div class="card-inner">
          <div class="card-front choice-face tarot-back-design">
            <div class="choice-front-content">
              <div class="choice-icon" style="flex:1;display:flex;align-items:center;justify-content:center;">${icon}</div>
              <div class="choice-back-hint">Tap to reveal</div>
            </div>
          </div>

          <div class="card-back choice-face tarot-front-design">
            <div class="choice-answer-content">
              <div class="choice-label" style="padding:1.2rem; text-wrap: balance; line-height:1.4;">${c.text}</div>
              <div class="choice-confirm-hint">Confirm Selection</div>
              <div class="choice-tap-hint">Tap again to confirm</div>
            </div>
          </div>
          
          <div class="card-outcome-face choice-face tarot-front-design">
            <div class="choice-outcome-content">
              <div class="outcome-choice-text">${c.text}</div>
              <div class="outcome-label">Outcome:</div>
              <div class="outcome-description choice-back-msg"></div>
              <div class="choice-back-list"></div>
            </div>
          </div>
        </div>
      `;

          // Store choice data and state
          window.cardFlipStates[cardId] = { stage: 0, choice: c, cardTitle, choiceText: c.text, topic, isArc };

          // Handle click for 2-stage flip (button behavior on div)
          card.tabIndex = 0; // Make focusable
          card.onclick = (e) => onCardClick(e.currentTarget, cardId);
          card.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') onCardClick(card, cardId);
          };
          choicesEl.appendChild(card);
        });

        // Fade in the new cards after they're rendered
        if (hasExistingCards) {
          choicesEl.style.transition = 'opacity 340ms ease-in';
          choicesEl.style.opacity = '1';
        }
      }, hasExistingCards ? 200 : 0);
    }

    function onCardClick(btn, cardId) {
      if (transitioning || awaitingContinue) return;

      const state = window.cardFlipStates[cardId];
      if (!state) return;

      // Stage 0 -> Stage 1: Reveal (show option text)
      if (state.stage === 0) {
        performStage1Reveal(btn, cardId, state);
      }
      // Stage 1 -> Stage 2: Confirm (show consequence and select)
      else if (state.stage === 1) {
        performStage2Confirm(btn, cardId, state);
      }
    }

    // Stage 1: The Reveal - ScaleX flip to show option text (State 2)
    function performStage1Reveal(btn, cardId, state) {
      transitioning = true;

      // Remove duplicate cards in other revealed states - allow comparison
      document.querySelectorAll('.choice-card').forEach(c => {
        c.classList.remove('faded', 'card-deselected');
      });

      // Trigger scaleX flip - CSS handles the animation
      btn.classList.remove('face-down');
      btn.classList.add('revealing');

      // At the midpoint (0.2s when card is completely flat), swap the content visibility
      setTimeout(() => {
        // Hide the front (seal/icon)
        const frontFace = btn.querySelector('.card-front');
        if (frontFace) {
          frontFace.style.opacity = '0';
          frontFace.style.visibility = 'hidden';
        }

        // Show the back (option text)
        const backFace = btn.querySelector('.card-back');
        if (backFace) {
          backFace.style.opacity = '1';
          backFace.style.visibility = 'visible';
        }

        // Now switch the animation - remove revealing, add revealed for scaleXFlipIn
        btn.classList.remove('revealing');
        btn.classList.add('revealed');
      }, 200);

      // After scaleX flip completes (0.4s total)
      setTimeout(() => {
        btn.classList.add('floating');

        // Add visual hint (pulse animation) to guide user to click again
        btn.classList.add('reveal-hint');

        transitioning = false;
      }, 400);

      state.stage = 1;
      selectedCardId = cardId;
    }

    // Stage 2: The Choice - Confirm selection and commit to the choice
    function performStage2Confirm(btn, cardId, state) {
      transitioning = true;

      const { choice, cardTitle, topic, isArc } = state;

      const allCards = document.querySelectorAll('.choice-card');
      // All cards are now selectable immediately - proceed with selection

      // Remove the reveal hint animation
      btn.classList.remove('reveal-hint');

      // Move all cards into final selection overlay state
      const choicesWrapper = document.getElementById('choices');
      let overlay = document.getElementById('selected-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'selected-overlay';
        document.body.appendChild(overlay);
      }

      overlay.classList.add('active');
      choicesWrapper.style.visibility = 'hidden';
      document.body.classList.add('overlay-open');
      document.documentElement.classList.add('overlay-open');

      window.scrollTo({ top: 0, behavior: 'instant' });

      allCards.forEach(c => {
        c.classList.add('locked');
        if (c.id !== cardId) {
          c.classList.add('card-deselected');
          c.classList.remove('floating');
        }
      });

      const selectedCard = document.getElementById(cardId);
      selectedCard.classList.add('card-selected', 'grand-selection');
      selectedCard.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease';
      selectedCard.style.transform = 'scale(1)';
      selectedCard.style.position = 'relative';
      selectedCard.style.width = '100%';
      selectedCard.style.height = '100%';
      selectedCard.style.margin = '0';
      selectedCard.style.boxShadow = '0 42px 82px rgba(0,0,0,0.85)';

      overlay.appendChild(selectedCard);

      const continueWrap = document.getElementById('continue-wrap');
      continueWrap.classList.add('selected-state', 'visible');


      // Apply game state changes first, then show what actually changed.
      // Delta caps, arc multipliers and the 0-100 limits mean the raw card numbers
      // can differ from the real change, so the card shows the measured difference.
      const { effective: effectiveChoice, applied } = TheOvalCore.applyChoice(gs, choice, topic, isArc, cardTitle);
      if (gs.cheatMode) updateCheatUI();

      const outcomeMsg = btn.querySelector('.choice-back-msg');
      const outcomeList = btn.querySelector('.choice-back-list');
      if (outcomeMsg) outcomeMsg.textContent = getChoiceOutcomeText(choice, applied, topic);
      if (outcomeList) {
        const lines = outcomeLines(applied);
        outcomeList.innerHTML = lines.length
          ? lines.map(l => `<div class="choice-back-line ${l.isGood ? 'good' : 'bad'}">${l.text}</div>`).join('')
          : '<div class="choice-back-line">No immediate stat movement.</div>';
      }

      // Trigger the scaleX flip to show outcome
      btn.classList.remove('floating', 'revealed');
      btn.classList.add('confirming');
      updateHUD(false);

      // At the midpoint (0.2s when card is completely flat), swap the content visibility
      setTimeout(() => {
        // Hide the back (choice text)
        const backFace = btn.querySelector('.card-back');
        if (backFace) {
          backFace.style.opacity = '0';
          backFace.style.visibility = 'hidden';
        }

        // Show the outcome face (consequences & stats)
        const outcomeFace = btn.querySelector('.card-outcome-face');
        if (outcomeFace) {
          outcomeFace.style.opacity = '1';
          outcomeFace.style.visibility = 'visible';
        }

        // Now switch the animation - remove confirming, add confirmed for scaleXFlipIn
        btn.classList.remove('confirming');
        btn.classList.add('confirmed');
      }, 200);

      // After scaleX flip completes (0.4s total), finalize selection and show continue
      setTimeout(() => {
        btn.classList.add('floating');

        // Optimization: Hide non-selected cards from DOM for performance
        document.querySelectorAll('.choice-card.card-deselected').forEach(c => {
          c.style.display = 'none';
        });

        // Show continue button to proceed to next turn
        awaitingContinue = true;
        pendingAdvance = { isArc, effectiveChoice };
        document.getElementById('continue-wrap').classList.add('visible');
        transitioning = false;
      }, 600);

      state.stage = 2;
      tip('solo-result');
    }

    function continueAfterChoice() {
      if (!awaitingContinue || !pendingAdvance || transitioning) return;
      transitioning = true;
      awaitingContinue = false;
      document.getElementById('continue-wrap').classList.remove('visible');
      document.getElementById('continue-wrap').classList.remove('selected-state');

      // If overlay is active, hide it and avoid reverse-shrink animation on the selected card
      const overlay = document.getElementById('selected-overlay');
      if (overlay) {
        const selectedCard = overlay.querySelector('.card.choice-card.card-selected');
        if (selectedCard) {
          selectedCard.style.transition = 'none';
          selectedCard.style.transform = 'scale(1)';
          selectedCard.style.opacity = '0';
          selectedCard.style.display = 'none';
        }
        overlay.classList.remove('active');
        overlay.innerHTML = '';
        document.body.classList.remove('overlay-open');
        document.documentElement.classList.remove('overlay-open');
      }
      document.getElementById('choices').style.visibility = 'visible';

      // Reset card flip states for next turn
      selectedCardId = null;
      window.cardFlipStates = {};

      const card_el = document.getElementById('card');
      card_el.style.animation = 'cardExit .32s ease-in forwards';

      setTimeout(() => {
        transitioning = false;
        if (pendingAdvance.isArc) advanceArc(pendingAdvance.effectiveChoice);
        else advanceTurn();
        pendingAdvance = null;
      }, 320);
    }

    // Closes the active story arc without starting another turn (the run is ending).
    // Hides the arc banner when an arc closes.
    function closeArcView() {
      document.getElementById('hud').style.display = 'block';
      document.getElementById('arc-banner').style.display = 'none';
      Music.updateAtmosphere(false);
    }

    // The rules decide what follows an arc choice (TheOvalCore.advanceArc); this shows it.
    function advanceArc(choice) {
      const step = TheOvalCore.advanceArc(gs, choice);
      if (step.end) {
        closeArcView();
        showEndScreen(step.override);
        return;
      }
      if (step.act !== undefined) {
        renderArcAct(gs.activeArc, step.act);
        return;
      }
      closeArcView();
      advanceTurn();
    }

    // Between turns the rules (TheOvalCore.nextTurn) move the run on; this shows the next card or the end.
    function advanceTurn() {
      const step = TheOvalCore.nextTurn(gs);
      step.notices.forEach(showNotif);
      if (step.notices.some(n => n.startsWith('⚠'))) tip('solo-crisis');
      if (step.end) {
        updateHUD(false);
        showEndScreen(step.override);
        return;
      }
      if (step.arcStarted) showArcTriggerOverlay(step.arcStarted.name);
      updateHUD(true);
      if (gs.cheatMode) updateCheatUI();
      if (gs.activeArc) {
        Music.updateAtmosphere(true);
        renderArcAct(gs.activeArc, gs.activeArcActIndex);
      } else {
        Music.updateAtmosphere(false);
        const gift = TheOvalCore.giftCard(gs);
        if (gift) renderCard(gift, 'gift');
        else renderNextCard();
      }
    }

    function showArcTriggerOverlay(name) {
      tip('solo-arc');
      const el = document.createElement('div');
      el.className = 'arc-overlay';
      el.innerHTML = `<div class="arc-overlay-label">Story Arc Activated</div><div class="arc-overlay-line"></div><div class="arc-overlay-title">⚡ ${name}</div><div class="arc-overlay-line"></div>`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2500);
      showNotif('⚡ Arc triggered: ' + name);
    }

    function updateDirectivesHUD() {
      const hud = document.getElementById('active-directives');
      if (!gs.bars) return;

      let lines = [];
      if (gs.bars.publicApproval >= 80) lines.push(`<div class="directive-line directive-good"><span class="directive-icon">✦</span> App >80%: Economy boosts +3, but Approval decays faster.</div>`);
      if (gs.bars.stateAuthority >= 80) lines.push(`<div class="directive-line directive-bad"><span class="directive-icon">✦</span> Auth >80%: Heavy hand magnifies Approval penalties.</div>`);
      if (gs.bars.partyLoyalty >= 80) lines.push(`<div class="directive-line directive-good"><span class="directive-icon">✦</span> Party >80%: Scandal mgmt easier, but costs steep capital.</div>`);
      if (gs.bars.stateAuthority < 30) lines.push(`<div class="directive-line directive-bad"><span class="directive-icon">✦</span> Auth <30: Bleeding 1 Party Loyalty/turn.</div>`);

      if (lines.length > 0) {
        hud.innerHTML = lines.join('');
        hud.style.display = 'flex';
      } else {
        hud.style.display = 'none';
      }
    }

    function renderNextCard() {
      updateDirectivesHUD();
      const { card, topic } = TheOvalCore.drawCard(gs);
      renderCard(card, topic);

      // Low Party Loyalty can lock two options once the cards are on screen.
      setTimeout(() => {
        const cards = Array.from(document.querySelectorAll('.choice-card'));
        const locked = TheOvalCore.partyLock(gs, cards.length);
        locked.forEach(i => {
          const card = cards[i];
          card.classList.add('locked-by-party');
          card.style.pointerEvents = 'none';
          card.style.opacity = '0.4';
          card.style.filter = 'grayscale(100%)';
          const backHint = card.querySelector('.choice-back-hint');
          if (backHint) backHint.textContent = '🔒 Labeled Disloyal. Blocked by Party.';
        });
        if (locked.length) showNotif('⚠ Warning: Low Party Loyalty restricted your options.');
      }, 300); // give time for cards to render
    }

    // ═══════════════════════════════════════════════════════════
    // END SCREEN
    // ═══════════════════════════════════════════════════════════
    function showEndScreen(choiceOverride) {
      document.getElementById('app').style.display = 'none';
      window.scrollTo(0, 0);
      const end = document.getElementById('end-screen');
      end.style.display = 'block';
      const ending = TheOvalCore.resolveEnding(gs, choiceOverride);
      sendStat({ event: 'oval_end', ending: ending.title, turn: gs.turn, minutes: (Date.now() - runStartedAt) / 60000 });
      const axes = TheOvalCore.moralAxes(gs);
      const top5 = gs.definingChoices.slice(-5);
      end.innerHTML = `
    <div class="end-header">
      <span class="end-seal">${ending.emoji}</span>
      <div class="end-title">${ending.title}</div>
      <div class="end-tagline">"${ending.tagline}"</div>
    </div>
    <div class="end-narrative">${ending.narrative}</div>
    <div class="end-profile">${ending.profile}</div>
    <div class="section-label" style="animation:endReveal .6s .22s ease both">Moral Profile</div>
    <div class="axes-grid">${axes.map(a => `<div class="axis-row"><div class="axis-labels"><span>${a.left}</span><span>${a.right}</span></div><div class="axis-track"><div class="axis-marker" id="ax-${a.id}" style="left:50%"></div></div></div>`).join('')}</div>
    <div class="defining-wrap"><div class="section-label">Defining Decisions</div><div class="defining-list">${top5.map(d => `<div class="defining-item"><strong>${d.topic} · ${d.card}</strong><br>"${d.choice}"</div>`).join('')}</div></div>
    <div class="end-btns">
      <button class="end-btn" onclick="restartGame()">Play Again</button>
      <button class="end-btn" style="border-color: #6fbcf0; color: #6fbcf0;" onclick="mockMintNFT()">💠 Mint Legacy NFT (demo)</button>
      <button class="end-btn" onclick="showGallery()">Gallery</button>
      <button class="end-btn" style="border-color: #1DA1F2; color: #1DA1F2;" onclick="shareToX()">🐦 Share on X</button>
    </div>`;
      // Animate axis markers after brief delay
      setTimeout(() => {
        axes.forEach(a => {
          const el = document.getElementById('ax-' + a.id);
          if (el) el.style.left = a.pct + '%';
        });
      }, 400);
    }

    // ═══════════════════════════════════════════════════════════
    // GALLERY
    // ═══════════════════════════════════════════════════════════
    function showGallery() {
      const app = document.getElementById('app');
      const end = document.getElementById('end-screen');

      // Detect where we came from with computed styles for robustness
      const title = document.getElementById('title-screen');
      const titleDisp = window.getComputedStyle(title).display;
      const endDisp = window.getComputedStyle(end).display;

      if (titleDisp !== 'none') galleryLastScreen = 'title-screen';
      else if (endDisp !== 'none') galleryLastScreen = 'end-screen';

      app.style.display = 'none';
      end.style.display = 'none';

      const gal = document.getElementById('gallery');
      gal.style.display = 'block';
      const totalCards = Object.values(CARDS).reduce((s, a) => s + a.length, 0);

      let galleryContent = `
        <button class="gallery-back" onclick="backFromGallery()">← Return</button>
        <div class="gallery-title">🔓 The Oval Archives</div>
        
        <div class="gallery-section">
          <div class="gallery-section-title">Endings (${ENDINGS.length})</div>
          <div class="gallery-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
            ${ENDINGS.map(e => `
              <div class="gallery-card">
                <div class="gallery-card-title">${e.emoji} ${e.title}</div>
                <div class="gallery-card-tag">${e.profile}</div>
                <div class="gallery-card-desc" style="font-size: 0.8rem; margin: 8px 0; color: var(--text-mid);">
                  <i>"${e.tagline}"</i><br><br>
                  <span style="color: var(--text);">${e.narrative}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="gallery-section">
          <div class="gallery-section-title">Story Arcs (${ARCS.length})</div>
          <div class="gallery-grid" style="grid-template-columns: 1fr;">
            ${ARCS.map(a => `
              <div class="gallery-card">
                <div class="gallery-card-title">${a.name}</div>
                <div class="gallery-card-tag">${a.acts.length}-act arc</div>
                <div class="gallery-card-desc" style="font-size: 0.8rem; margin: 8px 0;">
                  <strong>Trigger Condition:</strong> ${a.id === 'convergence_route' ? 'From turn 6: Interstellar Tension above 80% for 3 turns (or 98%)' : a.id === 'the_scandal' ? 'Party Loyalty < 30%' : a.id === 'revolution' ? 'State Authority below 30% for 3 turns (or below 25%) while Approval is under 55%, or after turn 10, Approval below 10% for 3 turns' : a.id === 'legacy' ? 'The last turn of the run (20, 30 or 40)' : '—'}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-mid); display: flex; flex-direction: column; gap: 12px;">
                  ${a.acts.map(raw => TheOvalCore.resolveAct(raw, gs)).map((act, i) => `
                    <div style="border-left: 2px solid var(--border); padding-left: 10px;">
                      <strong style="color:var(--gold-light); font-size: 0.85rem;">Act ${i+1}: ${act.title}</strong><br>
                      <i style="color:var(--text);">${act.body}</i>
                      <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
                        ${act.choices.map(ch => `
                          <div style="background: rgba(0,0,0,0.2); padding: 4px; border-radius: 4px;">
                            <span style="color:var(--gold);">• ${ch.text}</span><br>
                            <span style="color:var(--text-dim);">↳ ${ch.outcome}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="gallery-section">
          <div class="gallery-section-title">Classified Decision Files (${totalCards})</div>
          <div class="gallery-grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">
            ${Object.entries(CARDS).map(([topic, cards]) => cards.map(c => `
              <div class="gallery-card">
                <div class="gallery-card-tag">${topic.toUpperCase()}</div>
                <div class="gallery-card-title" style="font-size: 0.95rem;">${c.title}</div>
                <div class="gallery-card-desc" style="font-size: 0.8rem; margin: 8px 0; font-style: italic; color: var(--text);">${c.body}</div>
                <div style="font-size: 0.75rem; color: var(--gold); display: flex; flex-direction: column; gap: 6px;">
                  ${c.choices.map(ch => `
                    <div style="background: rgba(0,0,0,0.2); padding: 4px; border-radius: 4px;">
                      <span>• ${ch.text}</span><br>
                      <span style="color:var(--text-dim);">↳ ${ch.outcome}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')).join('')}
          </div>
        </div>
      `;

      gal.innerHTML = galleryContent;
    }

    function backFromGallery() {
      document.getElementById('gallery').style.display = 'none';
      const app = document.getElementById('app');
      const end = document.getElementById('end-screen');
      
      if (galleryLastScreen === 'title-screen') {
        app.style.display = 'block';
        document.getElementById('title-screen').style.display = 'flex';
      } else if (galleryLastScreen === 'end-screen') {
        end.style.display = 'block';
      }
    }

    // ═══════════════════════════════════════════════════════════
    // MUSIC BUTTON
    // ═══════════════════════════════════════════════════════════
    function toggleMusic() {
      const playing = Music.toggle();
      const btn = document.getElementById('music-btn');
      if (playing) { btn.textContent = '♩ On'; btn.classList.add('playing'); }
      else { btn.textContent = '♩ Music'; btn.classList.remove('playing'); }
    }

    // ═══════════════════════════════════════════════════════════
    // NOTIFICATION
    // ═══════════════════════════════════════════════════════════
    function showNotif(msg) {
      const n = document.getElementById('notif');
      n.textContent = msg; n.classList.add('show');
      setTimeout(() => n.classList.remove('show'), 3000);
    }

    // ═══════════════════════════════════════════════════════════
    // CHEAT CODE
    // ═══════════════════════════════════════════════════════════
    document.addEventListener('keydown', e => {
      if (e.key.toLowerCase() === 'f' && e.target !== document.getElementById('cheat-input')) {
        const inp = document.getElementById('cheat-input');
        inp.classList.add('show'); inp.focus(); e.preventDefault();
      }
      if (e.key === 'Escape') document.getElementById('cheat-input').classList.remove('show');
    });

    function handleCheat(e) {
      if (e.key === 'Enter') {
        const v = e.target.value.trim().toUpperCase();
        e.target.value = '';
        e.target.classList.remove('show');
        if (v === 'FULLUNLOCK') { showGallery(); showNotif('🔓 Gallery Unlocked'); }
        else showNotif('Unknown code: ' + v);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // GAME FLOW
    // ═══════════════════════════════════════════════════════════
    // Anonymous play counters (no name or id is sent): see feedback.html#privacy.
    // Without the online server (file:// or a static copy) nothing is sent.
    let runStartedAt = 0;
    function sendStat(body) {
      if (typeof fetch !== 'function' || !/^https?:$/.test(location.protocol)) return;
      fetch('api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true })
        .catch(() => {});
    }

    // First-game tips (app/tips.js); shown once each, skipped when tips.js is not loaded.
    function tip(id) {
      if (window.TheOvalTips) window.TheOvalTips.show(id);
    }

    // turns: 20, 30 or 40 (the default, the full story).
    function startGame(mode, turns) {
      if (mode !== 'normal') return;
      initState(turns);
      runStartedAt = Date.now();
      sendStat({ event: 'oval_start', turns: gs.maxTurns });
      document.body.classList.add('in-game');
      document.getElementById('title-screen').style.display = 'none';
      const gs_screen = document.getElementById('game-screen');
      gs_screen.style.display = 'block';
      gs_screen.style.animation = 'fadeIn .5s ease forwards';
      document.getElementById('arc-banner').style.display = 'none';
      const rf = document.getElementById('result-flash');
      rf.classList.remove('visible');
      rf.innerHTML = '';
      rf.style.display = 'none';
      document.getElementById('continue-wrap').classList.remove('visible');
      updateHUD(false);
      renderNextCard();
      tip('solo-bars');
      tip('solo-card');
    }

    function restartGame() {
      document.body.classList.remove('in-game');
      document.getElementById('game-screen').style.display = 'none';
      document.getElementById('end-screen').style.display = 'none';
      document.getElementById('gallery').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      document.getElementById('title-screen').style.display = 'flex';
      document.getElementById('title-screen').style.animation = 'fadeIn .4s ease forwards';
    }

    // ═══════════════════════════════════════════════════════════
    // WEB3 MOCK LOGIC (HACKATHON DEMO)
    // ═══════════════════════════════════════════════════════════

    // MOCK SUI WALLET CONNECTION
    function mockConnect() {
      const btn = document.getElementById('connect-wallet');
      if(!btn) return;
      
      btn.textContent = "⌛ CONNECTING...";
      btn.style.opacity = "0.7";
      
      setTimeout(() => {
        btn.textContent = "0x7a2d...3f1e · DEMO WALLET";
        btn.style.background = "#27AE60";
        btn.style.opacity = "1";
        btn.style.boxShadow = "0 0 20px rgba(39, 174, 96, 0.6)";
        showNotif("Demo wallet connected. No real Sui connection is made.");
      }, 1500);
    }

    // MOCK NFT MINTING
    function mockMintNFT() {
      showNotif("Preparing demo mint...");

      setTimeout(() => {
        alert("🎉 Demo complete\n\nThis is a preview of how a Legacy NFT ('Lazarus Fragment') would be minted on Sui.\nNo transaction was sent and nothing was recorded on-chain.");
        showNotif("Demo mint finished (no real transaction).");
      }, 1200);
    }

    // SHARE TO X (TWITTER) LOGIC
    function shareToX() {
      const approval = gs.bars.publicApproval;
      const economy = gs.bars.economicState;
      const text = `I just ruled The Oval space station with an Approval Rating of ${approval}% and an Economy score of ${economy}%. Do you have what it takes to survive the @EveFrontier universe? Try my dApp now! #SuiHackathon #SUI`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }

    initState();
  