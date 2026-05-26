import { CREATURES } from './data/creatures.js';

// How fast needs decay (points per millisecond)
const DECAY_RATES = {
  hunger:  100 / (4  * 60 * 60 * 1000),  // full → 0 in 4 hours
  mood:    100 / (6  * 60 * 60 * 1000),  // full → 0 in 6 hours
  energy:  100 / (8  * 60 * 60 * 1000),  // full → 0 in 8 hours
  hygiene: 100 / (12 * 60 * 60 * 1000),  // full → 0 in 12 hours
};

// Energy passively restores over time (0 → full in 3 hours of rest)
const ENERGY_REGEN = 100 / (3 * 60 * 60 * 1000);

const DEFAULT_STATE = {
  creatureId: null,
  name: null,
  stage: 'hatchling',
  born: null,
  lastSaved: null,

  needs: { hunger: 80, mood: 80, energy: 90, hygiene: 85 },

  stats: { STR: 5, SPD: 5, END: 5, INT: 5, DEF: 5, CHA: 5 },

  diet: { primal: 0, nature: 0, arcane: 0, crafted: 0 },

  trainingCooldowns: {}, // disciplineId → timestamp

  level: 1,
  xp:    0,   // XP within the current level (resets on level-up)

  daysAlive: 0,
  totalFeedings: 0,
  totalTrainingSessions: 0,
  totalBaths: 0,
  totalPets: 0,

  achievements: [],

  // Shimmer
  shimmer: null, // null | 'bright' | 'lucent' | 'mythbright'
};

export class GameState {
  constructor() {
    this.state = null;
    this.listeners = [];
  }

  // ─── Lifecycle ───────────────────────────────────────────────

  startNewGame(creatureId, name) {
    const roll = Math.random();
    const shimmer = roll < 0.005 ? 'bright' : null; // 1 in 200

    this.state = {
      ...structuredClone(DEFAULT_STATE),
      creatureId,
      name: name || CREATURES[creatureId].name,
      born: Date.now(),
      lastSaved: Date.now(),
      shimmer,
    };

    this._notify();
    return this.state;
  }

  loadState(savedState) {
    this.state = savedState;
    this._applyOfflineDecay();
    this._notify();
  }

  // ─── Needs ───────────────────────────────────────────────────

  tick(deltaMs) {
    if (!this.state) return;
    const needs = this.state.needs;

    for (const [key, rate] of Object.entries(DECAY_RATES)) {
      needs[key] = Math.max(0, needs[key] - rate * deltaMs);
    }

    // Energy regenerates passively — net still drains from training but recovers at rest
    needs.energy = Math.min(100, needs.energy + ENERGY_REGEN * deltaMs);

    // Update days alive
    this.state.daysAlive = Math.floor(
      (Date.now() - this.state.born) / (24 * 60 * 60 * 1000)
    );

    this._notify();
  }

  _applyOfflineDecay() {
    const elapsed = Date.now() - (this.state.lastSaved || Date.now());
    if (elapsed <= 0) return;
    const needs = this.state.needs;
    for (const [key, rate] of Object.entries(DECAY_RATES)) {
      needs[key] = Math.max(0, needs[key] - rate * elapsed);
    }
    needs.energy = Math.min(100, needs.energy + ENERGY_REGEN * elapsed);
    this.state.lastSaved = Date.now();
  }

  // ─── Actions ─────────────────────────────────────────────────

  feed(food) {
    if (!this.state) return { ok: false, msg: 'No active Wild.' };
    if (this.state.needs.hunger > 90) return { ok: false, msg: `${this.state.name} isn't hungry right now.` };

    const needs = this.state.needs;
    needs.hunger  = Math.min(100, needs.hunger  + (food.effects.hunger  || 0));
    needs.mood    = Math.min(100, needs.mood    + (food.effects.mood    || 0));
    needs.energy  = Math.min(100, needs.energy  + (food.effects.energy  || 0));

    // Track diet
    this.state.diet[food.category] = (this.state.diet[food.category] || 0) + 1;
    this.state.totalFeedings++;

    // Apply stat bonuses (small passive gain from food)
    const statKey = { primal:'STR', nature:'END', arcane:'INT', crafted:'CHA' }[food.category];
    if (statKey && food.effects[statKey]) {
      this.state.stats[statKey] = (this.state.stats[statKey] || 0) + Math.round(food.effects[statKey] / 10);
    }

    this._notify();
    return { ok: true, animation: 'eating' };
  }

  train(discipline) {
    if (!this.state) return { ok: false, msg: 'No active Wild.' };

    const cooldownKey = `train_${discipline}`;
    const lastTrain = this.state.trainingCooldowns[cooldownKey] || 0;
    const cooldownMs = 4 * 60 * 60 * 1000;

    if (Date.now() - lastTrain < cooldownMs) {
      const remaining = Math.ceil((cooldownMs - (Date.now() - lastTrain)) / 60000);
      return { ok: false, msg: `${this.state.name} needs ${remaining}m rest before training again.` };
    }
    if (this.state.needs.energy < 15) {
      return { ok: false, msg: `${this.state.name} is too tired to train.` };
    }

    return { ok: true, canTrain: true };
  }

  applyTrainingResult(discipline, score, xp) {
    const creature = CREATURES[this.state.creatureId];
    const bonus = creature.affinityBonus[discipline] || 1.0;
    const gain = Math.round(xp * bonus);

    this.state.stats[discipline] = (this.state.stats[discipline] || 0) + gain;
    this.state.needs.energy = Math.max(0, this.state.needs.energy - 20);
    this.state.needs.mood   = Math.min(100, this.state.needs.mood + 5);
    this.state.trainingCooldowns[`train_${discipline}`] = Date.now();
    this.state.totalTrainingSessions++;

    this._notify();
    return { gain, discipline };
  }

  pet() {
    if (!this.state) return { ok: false };
    this.state.needs.mood = Math.min(100, this.state.needs.mood + 20);
    this.state.totalPets = (this.state.totalPets ?? 0) + 1;
    this._notify();
    return { ok: true };
  }

  // ─── XP / Leveling ───────────────────────────────────────

  addXP(amount) {
    if (!this.state) return { leveled: false };
    // Gracefully handle old saves that lack these fields
    this.state.xp    = (this.state.xp    ?? 0) + amount;
    this.state.level =  this.state.level  ?? 1;

    let leveled  = false;
    let newLevel = this.state.level;

    while (this.state.xp >= this._xpNeeded(this.state.level)) {
      this.state.xp -= this._xpNeeded(this.state.level);
      this.state.level++;
      newLevel = this.state.level;
      leveled  = true;
    }

    this._notify();
    return { leveled, newLevel, xpGained: amount };
  }

  _xpNeeded(level) {
    // Level 1→2: 100 XP, 2→3: 200 XP, 3→4: 300 XP …
    return level * 100;
  }

  bathe() {
    if (!this.state) return { ok: false };
    this.state.needs.hygiene = Math.min(100, this.state.needs.hygiene + 60);
    this.state.needs.mood    = Math.min(100, this.state.needs.mood + 10);
    this.state.totalBaths = (this.state.totalBaths ?? 0) + 1;
    this._notify();
    return { ok: true, animation: 'happy' };
  }

  unlockAchievement(id) {
    if (!this.state) return { isNew: false };
    if (!this.state.achievements) this.state.achievements = [];
    if (this.state.achievements.includes(id)) return { isNew: false };
    this.state.achievements.push(id);
    this._notify();
    return { isNew: true };
  }

  rest() {
    if (!this.state) return { ok: false };
    this.state.needs.energy = Math.min(100, this.state.needs.energy + 40);
    this._notify();
    return { ok: true };
  }

  // ─── Derived ─────────────────────────────────────────────────

  getOverallMood() {
    if (!this.state) return 'ok';
    const avg = Object.values(this.state.needs).reduce((a, b) => a + b, 0) / 4;
    if (avg < 20) return 'critical';
    if (avg < 40) return 'sad';
    if (avg < 70) return 'ok';
    return 'happy';
  }

  getEvolutionProbabilities() {
    if (!this.state) return [];
    const creature = CREATURES[this.state.creatureId];
    // Simple probability shift based on dominant stat
    return creature.evolutionPaths;
  }

  getDominantDiet() {
    if (!this.state) return null;
    const diet = this.state.diet;
    const total = Object.values(diet).reduce((a, b) => a + b, 0);
    if (total === 0) return null;
    return Object.entries(diet).sort((a, b) => b[1] - a[1])[0][0];
  }

  // ─── Pub/Sub ─────────────────────────────────────────────────

  onChange(fn) { this.listeners.push(fn); }

  _notify() {
    this.state.lastSaved = Date.now();
    this.listeners.forEach(fn => fn(this.state));
  }
}
