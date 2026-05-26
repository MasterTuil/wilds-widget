export const CREATURES = {
  vex: {
    id: 'vex',
    name: 'Vex',
    type: 'Trickster',
    affinities: ['INT', 'DEF'],
    personality: 'Clever, mischievous, observes before acting.',
    lore: "Vex's mask isn't worn. It grew there.",
    color: '#9b7fd4',
    affinityBonus: { INT: 1.15, DEF: 1.15 },
    behaviorProfile: {
      patience:  6,   // minutes idle before seeking attention
      curiosity: 8,   // wander frequency 1–10 (higher = more restless)
      affection: 6,   // how big the reaction is to pets/feeding
      mischief:  9,   // chance of unexpected micro-events
      energy:    7,   // baseline activity level
    },
    habitat: {
      id: 'cave',
      name: 'The Cave',
      background: 'assets/habitats/cave_bg.png',
      // CSS vars applied to :root when this habitat is active
      theme: {
        '--habitat-primary':   '#3eafc8',
        '--habitat-glow':      'rgba(62,175,200,0.35)',
        '--habitat-mid':       '#0d1e26',
        '--habitat-border':    'rgba(62,175,200,0.18)',
        '--habitat-hud':       '#0a161c00',
        '--bg-mid':            '#0f1e26',
        '--bg-panel':          '#0a161e',
        '--creature-color':    '#3eafc8',
      },
    },
    animations: {
      idle:      ['assets/vex3/animations/Breathing_Idle-fb852d9d/south/frame_000.png','assets/vex3/animations/Breathing_Idle-fb852d9d/south/frame_001.png','assets/vex3/animations/Breathing_Idle-fb852d9d/south/frame_002.png','assets/vex3/animations/Breathing_Idle-fb852d9d/south/frame_003.png'],
      idle_west: ['assets/vex3/animations/idle_west/frame_000.png','assets/vex3/animations/idle_west/frame_001.png','assets/vex3/animations/idle_west/frame_002.png','assets/vex3/animations/idle_west/frame_003.png'],
      happy:     ['assets/vex3/animations/happy/frame_000.png','assets/vex3/animations/happy/frame_001.png','assets/vex3/animations/happy/frame_002.png','assets/vex3/animations/happy/frame_003.png','assets/vex3/animations/happy/frame_004.png','assets/vex3/animations/happy/frame_005.png','assets/vex3/animations/happy/frame_006.png','assets/vex3/animations/happy/frame_007.png','assets/vex3/animations/happy/frame_008.png'],
      wave:      ['assets/vex3/animations/wave/frame_000.png','assets/vex3/animations/wave/frame_001.png','assets/vex3/animations/wave/frame_002.png','assets/vex3/animations/wave/frame_003.png','assets/vex3/animations/wave/frame_004.png','assets/vex3/animations/wave/frame_005.png','assets/vex3/animations/wave/frame_006.png','assets/vex3/animations/wave/frame_007.png','assets/vex3/animations/wave/frame_008.png'],
      eating:    ['assets/vex3/animations/eating/frame_000.png','assets/vex3/animations/eating/frame_001.png','assets/vex3/animations/eating/frame_002.png','assets/vex3/animations/eating/frame_003.png','assets/vex3/animations/eating/frame_004.png','assets/vex3/animations/eating/frame_005.png','assets/vex3/animations/eating/frame_006.png','assets/vex3/animations/eating/frame_007.png','assets/vex3/animations/eating/frame_008.png'],
      sad:       ['assets/vex3/animations/frustrated/frame_000.png','assets/vex3/animations/frustrated/frame_001.png','assets/vex3/animations/frustrated/frame_002.png','assets/vex3/animations/frustrated/frame_003.png','assets/vex3/animations/frustrated/frame_004.png','assets/vex3/animations/frustrated/frame_005.png','assets/vex3/animations/frustrated/frame_006.png','assets/vex3/animations/frustrated/frame_007.png','assets/vex3/animations/frustrated/frame_008.png'],
      training:  ['assets/vex3/animations/Lead_Jab-cc43b7a7/west/frame_000.png','assets/vex3/animations/Lead_Jab-cc43b7a7/west/frame_001.png','assets/vex3/animations/Lead_Jab-cc43b7a7/west/frame_002.png'],
      sleep:     ['assets/vex3/animations/sleep_south.gif'],
      shower:    ['assets/vex3/animations/shower/frame_001.png','assets/vex3/animations/shower/frame_002.png','assets/vex3/animations/shower/frame_003.png','assets/vex3/animations/shower/frame_004.png','assets/vex3/animations/shower/frame_005.png','assets/vex3/animations/shower/frame_006.png'],
      walk_east:      ['assets/vex3/animations/Walking-e680e13d/east/frame_000.png','assets/vex3/animations/Walking-e680e13d/east/frame_001.png','assets/vex3/animations/Walking-e680e13d/east/frame_002.png','assets/vex3/animations/Walking-e680e13d/east/frame_003.png','assets/vex3/animations/Walking-e680e13d/east/frame_004.png','assets/vex3/animations/Walking-e680e13d/east/frame_005.png'],
      walk_northeast: ['assets/vex3/animations/Walking-e680e13d/north-east/frame_000.png','assets/vex3/animations/Walking-e680e13d/north-east/frame_001.png','assets/vex3/animations/Walking-e680e13d/north-east/frame_002.png','assets/vex3/animations/Walking-e680e13d/north-east/frame_003.png','assets/vex3/animations/Walking-e680e13d/north-east/frame_004.png','assets/vex3/animations/Walking-e680e13d/north-east/frame_005.png'],
      walk_northwest: ['assets/vex3/animations/Walking-e680e13d/north-west/frame_000.png','assets/vex3/animations/Walking-e680e13d/north-west/frame_001.png','assets/vex3/animations/Walking-e680e13d/north-west/frame_002.png','assets/vex3/animations/Walking-e680e13d/north-west/frame_003.png','assets/vex3/animations/Walking-e680e13d/north-west/frame_004.png','assets/vex3/animations/Walking-e680e13d/north-west/frame_005.png'],
      walk_southeast: ['assets/vex3/animations/Walking-e680e13d/south-east/frame_000.png','assets/vex3/animations/Walking-e680e13d/south-east/frame_001.png','assets/vex3/animations/Walking-e680e13d/south-east/frame_002.png','assets/vex3/animations/Walking-e680e13d/south-east/frame_003.png','assets/vex3/animations/Walking-e680e13d/south-east/frame_004.png','assets/vex3/animations/Walking-e680e13d/south-east/frame_005.png'],
      walk_southwest: ['assets/vex3/animations/Walking-e680e13d/south-west/frame_000.png','assets/vex3/animations/Walking-e680e13d/south-west/frame_001.png','assets/vex3/animations/Walking-e680e13d/south-west/frame_002.png','assets/vex3/animations/Walking-e680e13d/south-west/frame_003.png','assets/vex3/animations/Walking-e680e13d/south-west/frame_004.png','assets/vex3/animations/Walking-e680e13d/south-west/frame_005.png'],
    },
    evolutionPaths: [
      { name: 'Sage',       prob: 0.58, hint: 'INT dominant · Arcane diet · any habitat' },
      { name: 'Ironveil',   prob: 0.22, hint: 'DEF dominant · Tempered diet · The Cave' },
      { name: 'Showmaster', prob: 0.18, hint: 'CHA dominant · Crafted diet · The Rooftop' },
      { name: '???',        prob: null, hint: 'Something hidden stirs beneath the mask...' },
    ],
  },
  aura: {
    id: 'aura',
    name: 'Aura',
    type: 'Nurturer',
    affinities: ['CHA', 'END'],
    personality: 'Gentle, protective, ancient warmth.',
    lore: 'They were healing the world before anyone asked.',
    color: '#7ec89a',
    affinityBonus: { CHA: 1.15, END: 1.15 },
    behaviorProfile: {
      patience:  10,  // very patient — ancient calm
      curiosity: 4,   // stays put, contemplative
      affection: 9,   // lights up when you interact
      mischief:  2,   // rarely surprises you
      energy:    5,   // slow and deliberate
    },
    habitat: {
      id: 'meadow',
      name: 'The Meadow',
      background: 'assets/habitats/meadow_bg.png',
      theme: {
        '--habitat-primary':   '#7ec89a',
        '--habitat-glow':      'rgba(126,200,154,0.35)',
        '--habitat-mid':       '#121f16',
        '--habitat-border':    'rgba(126,200,154,0.18)',
        '--habitat-hud':       '#0e1a1200',
        '--bg-mid':            '#141f17',
        '--bg-panel':          '#101a13',
        '--creature-color':    '#7ec89a',
      },
    },
    animations: {
      idle:     ['assets/aura/idle_0.png','assets/aura/idle_1.png','assets/aura/idle_2.png','assets/aura/idle_3.png'],
      happy:    ['assets/aura/happy_0.png','assets/aura/happy_1.png','assets/aura/happy_2.png','assets/aura/happy_3.png'],
      eating:   ['assets/aura/eating_0.png','assets/aura/eating_1.png','assets/aura/eating_2.png','assets/aura/eating_3.png'],
      sad:      ['assets/aura/sad_0.png','assets/aura/sad_1.png','assets/aura/sad_2.png','assets/aura/sad_3.png'],
      training: ['assets/aura/training_0.png','assets/aura/training_1.png','assets/aura/training_2.png','assets/aura/training_3.png'],
    },
    evolutionPaths: [
      { name: 'Tender',  prob: 0.55, hint: 'CHA dominant · Crafted diet · Greenhouse' },
      { name: 'Verdant', prob: 0.25, hint: 'END dominant · Nature diet · Greenhouse / Meadow' },
      { name: 'Oracle',  prob: 0.20, hint: 'INT dominant · Arcane diet · The Cave' },
      { name: '???',     prob: null, hint: 'Something ancient stirs in the quiet...' },
    ],
  },
};
