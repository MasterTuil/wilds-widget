import { GameState }      from './GameState.js';
import { SaveSystem }     from './SaveSystem.js';
import { CreatureRenderer } from './CreatureRenderer.js';
import { UIManager }      from './UIManager.js';
import { CREATURES }      from './data/creatures.js';

// ─── Boot ──────────────────────────────────────────────────────

const gs     = new GameState();
const save   = new SaveSystem();
const canvas = document.getElementById('game-canvas');
const renderer = new CreatureRenderer(canvas);
const ui     = new UIManager(gs, save, renderer);

let tickInterval = null;

async function boot() {
  ui.init();

  // Try URL save first, then localStorage
  const urlSave = save.importFromURL();
  const localSave = save.load();
  const existing = urlSave || localSave;

  if (existing?.creatureId) {
    // Resume existing game
    await startGame(existing.creatureId, existing);
  } else {
    // Show title / creature select
    ui.showTitle();
    bindCreatureSelect();
  }
}

function bindCreatureSelect() {
  document.querySelectorAll('.creature-option').forEach(el => {
    el.addEventListener('click', async () => {
      const id = el.dataset.creature;
      await startGame(id, null);
    });
  });

  // Animate previews on title screen
  animatePreviews();
}

async function startGame(creatureId, existingState) {
  // Load creature sprites
  await renderer.load(creatureId);

  // Init or restore state
  if (existingState) {
    gs.loadState(existingState);
  } else {
    gs.startNewGame(creatureId);
  }

  // Wire state changes to UI
  gs.onChange(state => ui.update(state));

  // Start render loop
  renderer.start();

  // Game tick — apply needs decay every second
  tickInterval = setInterval(() => gs.tick(1000), 1000);

  // Show game screen FIRST so the habitat container has real dimensions
  ui.showGame();

  // Resize canvas now that the screen is visible
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initial UI update
  ui.update(gs.state);

  // If shimmer, celebrate
  if (gs.state.shimmer === 'bright') {
    setTimeout(() => ui.showToast(`✨ A Bright ${CREATURES[creatureId].name} — rare!`, 'ok'), 1000);
  }
}

function resizeCanvas() {
  const container = document.getElementById('habitat-container');
  if (!container) return;
  const { width, height } = container.getBoundingClientRect();
  renderer.resize(width, height);
}

// ─── Launch ────────────────────────────────────────────────────
boot();
