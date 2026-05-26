import { FOODS, FOOD_CATEGORIES } from './data/foods.js';
import { CREATURES } from './data/creatures.js';

export class UIManager {
  constructor(gameState, saveSystem, renderer) {
    this.gs = gameState;
    this.save = saveSystem;
    this.renderer = renderer;
    this.activePanel = null;
    this.toastTimer = null;

    // Mini-game state
    this.mgHolding = false;
    this.mgPower = 0;
    this.mgRafId = null;
    this.mgDiscipline = 'INT';
  }

  init() {
    this._buildFoodGrid();
    this._bindButtons();
    this._bindPanels();
    this._bindMiniGame();
  }

  // ─── Screens ─────────────────────────────────────────────────

  showTitle() {
    document.getElementById('screen-title').classList.add('active');
    document.getElementById('screen-game').classList.remove('active');
  }

  showGame() {
    document.getElementById('screen-title').classList.remove('active');
    document.getElementById('screen-game').classList.add('active');
  }

  // ─── HUD Update ──────────────────────────────────────────────

  update(state) {
    if (!state) return;

    const creature = CREATURES[state.creatureId];

    // Top HUD
    document.getElementById('wild-name').textContent  = state.name;
    document.getElementById('wild-stage').textContent = `${creature.type} · ${state.stage.charAt(0).toUpperCase() + state.stage.slice(1)}`;

    // Needs bars
    this._setBar('hunger',  state.needs.hunger);
    this._setBar('mood',    state.needs.mood);
    this._setBar('energy',  state.needs.energy);
    this._setBar('hygiene', state.needs.hygiene);

    // Apply full habitat theme (only on first call or creature change)
    if (this._lastCreatureId !== state.creatureId) {
      this._applyHabitatTheme(creature);
      this._lastCreatureId = state.creatureId;
    }

    // Pass mood to renderer — it handles bursts + idle as base state
    const mood = this.gs.getOverallMood();
    this.renderer.setMood(mood);

    // Only force sad/critical — happy bursts are handled inside renderer
    const actionAnims = ['eating', 'training', 'happy'];
    const inAction = actionAnims.includes(this.renderer.currentAnim);
    if (!inAction) {
      if (mood === 'critical' || mood === 'sad') {
        this.renderer.setAnimation('sad');
      } else {
        // Return to idle if we were sad and recovered
        if (this.renderer.currentAnim === 'sad') {
          this.renderer.setAnimation(this.renderer._idleAnim());
        }
      }
    }

    // Save on every update
    this.save.save(state);
  }

  _applyHabitatTheme(creature) {
    const root = document.documentElement;
    const { theme, background } = creature.habitat;

    // Apply all CSS variables
    for (const [key, val] of Object.entries(theme)) {
      root.style.setProperty(key, val);
    }

    // Set habitat background image on container
    const container = document.getElementById('habitat-container');
    if (container) {
      container.style.backgroundImage  = `url('${background}')`;
      container.style.backgroundSize   = 'cover';
      container.style.backgroundPosition = 'center bottom';
      container.style.imageRendering   = 'pixelated';
    }
  }

  _setBar(need, value) {
    const bar = document.getElementById(`bar-${need}`);
    if (!bar) return;
    bar.style.width = `${Math.max(0, Math.min(100, value))}%`;

    // Color shift: green → yellow → red
    if (value > 50)      bar.style.background = 'var(--bar-good)';
    else if (value > 25) bar.style.background = 'var(--bar-warn)';
    else                 bar.style.background = 'var(--bar-crit)';
  }

  // ─── Food Grid ───────────────────────────────────────────────

  _buildFoodGrid() {
    const grid = document.getElementById('food-grid');
    if (!grid) return;

    // Group by category
    const grouped = {};
    for (const food of FOODS) {
      if (!grouped[food.category]) grouped[food.category] = [];
      grouped[food.category].push(food);
    }

    grid.innerHTML = '';
    for (const [cat, foods] of Object.entries(grouped)) {
      const catInfo = FOOD_CATEGORIES[cat];
      const section = document.createElement('div');
      section.className = 'food-category';
      section.innerHTML = `<div class="food-cat-label">${catInfo.icon} ${catInfo.label}</div>`;

      const row = document.createElement('div');
      row.className = 'food-row';

      for (const food of foods) {
        const btn = document.createElement('button');
        btn.className = 'food-item';
        btn.dataset.foodId = food.id;
        btn.innerHTML = `
          <span class="food-icon">${food.icon}</span>
          <span class="food-name">${food.name}</span>
          <span class="food-rarity rarity-${food.rarity}">${food.rarity}</span>
        `;
        btn.addEventListener('click', () => this._onFeed(food));
        row.appendChild(btn);
      }

      section.appendChild(row);
      grid.appendChild(section);
    }
  }

  _onFeed(food) {
    const result = this.gs.feed(food);
    if (!result.ok) { this.showToast(result.msg, 'warn'); return; }
    this.renderer.setAnimation('eating');
    this.showToast(`${this.gs.state.name} ate ${food.name}! 🍽️`, 'ok');
    setTimeout(() => this.renderer.setAnimation(this.renderer._idleAnim()), 2200);
    this.closePanel();
  }

  // ─── Mini-Game ───────────────────────────────────────────────

  _bindMiniGame() {
    const btn = document.getElementById('minigame-btn');
    if (!btn) return;

    const onDown = () => {
      if (this.mgHolding) return;
      this.mgHolding = true;
      this.mgPower = 0;
      this._mgLoop();
    };
    const onUp = () => {
      if (!this.mgHolding) return;
      this.mgHolding = false;
      cancelAnimationFrame(this.mgRafId);
      this._mgRelease();
    };

    btn.addEventListener('mousedown',  onDown);
    btn.addEventListener('touchstart', onDown, { passive: true });
    btn.addEventListener('mouseup',    onUp);
    btn.addEventListener('touchend',   onUp);
    window.addEventListener('mouseup', onUp);
  }

  _mgLoop() {
    if (!this.mgHolding) return;
    this.mgPower = Math.min(100, this.mgPower + 1.2);
    this._mgRender();
    this.mgRafId = requestAnimationFrame(() => this._mgLoop());
  }

  _mgRelease() {
    const power = this.mgPower;
    const resultEl = document.getElementById('minigame-result');

    // Golden zone: 55–80
    let grade, xp;
    if (power >= 55 && power <= 80) {
      grade = power >= 65 && power <= 75 ? '✨ PERFECT!' : '👍 GOOD!';
      xp = power >= 65 && power <= 75 ? 8 : 5;
    } else {
      grade = '😬 Miss';
      xp = 1;
    }

    resultEl.textContent = `${grade}  +${xp} ${this.mgDiscipline}`;
    resultEl.className = 'result-show';

    const applyResult = this.gs.applyTrainingResult(this.mgDiscipline, power, xp);
    this.renderer.setAnimation('training');
    setTimeout(() => {
      resultEl.className = '';
      this.renderer.setAnimation(this.renderer._idleAnim());
    }, 2000);

    // Reset bar
    this.mgPower = 0;
    this._mgRender();
    this.showToast(`+${applyResult.gain} ${applyResult.discipline}!`, 'ok');
  }

  _mgRender() {
    const indicator = document.getElementById('power-indicator');
    if (indicator) indicator.style.left = `${this.mgPower}%`;
  }

  // ─── Stats Panel ─────────────────────────────────────────────

  updateStatsPanel(state) {
    const el = document.getElementById('stats-content');
    if (!el || !state) return;

    const statIcons = { STR:'💪', SPD:'💨', END:'🛡️', INT:'🧠', DEF:'🔒', CHA:'✨' };
    el.innerHTML = `
      <div class="stat-grid">
        ${Object.entries(state.stats).map(([k,v]) =>
          `<div class="stat-row">
            <span class="stat-icon">${statIcons[k]}</span>
            <span class="stat-name">${k}</span>
            <div class="stat-bar-track"><div class="stat-bar" style="width:${Math.min(100,(v/150)*100)}%"></div></div>
            <span class="stat-val">${v}</span>
          </div>`
        ).join('')}
      </div>
      <div class="days-alive">Day ${state.daysAlive} · ${state.totalFeedings} feedings · ${state.totalTrainingSessions} sessions</div>
    `;

    // Evolution path
    const pathEl = document.getElementById('evolution-path');
    const paths = this.gs.getEvolutionProbabilities();
    pathEl.innerHTML = `
      <div class="evo-title">Evolution Path</div>
      ${paths.map(p => `
        <div class="evo-row ${p.name === '???' ? 'evo-secret' : ''}">
          <span class="evo-name">${p.name}</span>
          <span class="evo-prob">${p.prob ? Math.round(p.prob * 100) + '%' : '???'}</span>
          <span class="evo-hint">${p.hint}</span>
        </div>
      `).join('')}
    `;
  }

  // ─── Panels ──────────────────────────────────────────────────

  _bindPanels() {
    document.querySelectorAll('.panel-close').forEach(btn => {
      btn.addEventListener('click', () => this.closePanel());
    });
    document.getElementById('overlay').addEventListener('click', () => this.closePanel());
  }

  openPanel(name) {
    this.closePanel();
    const panel = document.getElementById(`panel-${name}`);
    const overlay = document.getElementById('overlay');
    if (!panel) return;
    panel.classList.add('open');
    overlay.classList.remove('hidden');
    this.activePanel = name;

    if (name === 'stats') this.updateStatsPanel(this.gs.state);
  }

  closePanel() {
    if (!this.activePanel) return;
    document.getElementById(`panel-${this.activePanel}`)?.classList.remove('open');
    document.getElementById('overlay').classList.add('hidden');
    this.activePanel = null;
  }

  // ─── Action Buttons ──────────────────────────────────────────

  _bindButtons() {
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        switch (action) {
          case 'feed':  this.openPanel('feed'); break;
          case 'train': this._onTrain(); break;
          case 'bathe': this._onBathe(); break;
          case 'rest':  this._onRest(); break;
          case 'stats': this.openPanel('stats'); break;
        }
      });
    });
  }

  _onTrain() {
    const result = this.gs.train(this.mgDiscipline);
    if (!result.ok) { this.showToast(result.msg, 'warn'); return; }
    this.openPanel('train');
  }

  _onBathe() {
    this.gs.bathe();
    this.renderer.setAnimation('happy');
    this.showToast(`${this.gs.state.name} feels fresh! 💧`, 'ok');
    setTimeout(() => this.renderer.setAnimation(this.renderer._idleAnim()), 1800);
  }

  _onRest() {
    this.gs.rest();
    this.showToast(`${this.gs.state.name} rests... ⚡ energy restored.`, 'ok');
  }

  // ─── Toast ───────────────────────────────────────────────────

  showToast(msg, type = 'ok') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast-${type}`;
    toast.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
  }
}
