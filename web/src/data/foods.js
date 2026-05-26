export const FOODS = [
  // PRIMAL
  { id: 'wild_jerky',    name: 'Wild Jerky',      category: 'primal',  icon: '🥩', rarity: 'common',
    effects: { hunger: 35, STR: 8 },  desc: 'Simple, honest fuel.' },
  { id: 'raw_haunch',    name: 'Raw Haunch',       category: 'primal',  icon: '🍖', rarity: 'uncommon',
    effects: { hunger: 55, STR: 14, END: 6 }, desc: 'A proper meal for a wild spirit.' },

  // NATURE
  { id: 'forest_berries',name: 'Forest Berries',   category: 'nature',  icon: '🫐', rarity: 'common',
    effects: { hunger: 30, mood: 10, END: 8 }, desc: 'Sweet and grounding.' },
  { id: 'mossweed_stew', name: 'Mossweed Stew',    category: 'nature',  icon: '🍵', rarity: 'uncommon',
    effects: { hunger: 50, END: 12, CHA: 8 }, desc: 'Tastes like the forest after rain.' },

  // ARCANE
  { id: 'glowshrooms',   name: 'Glowshrooms',      category: 'arcane',  icon: '🍄', rarity: 'common',
    effects: { hunger: 30, INT: 8 }, desc: 'They pulse faintly in the dark.' },
  { id: 'stardust',      name: 'Stardust Pellets',  category: 'arcane',  icon: '✨', rarity: 'uncommon',
    effects: { hunger: 45, INT: 12, SPD: 8 }, desc: "Something about these feels wrong. Your Wild loves them." },

  // CRAFTED
  { id: 'honey_cake',    name: 'Honey Cake',        category: 'crafted', icon: '🍰', rarity: 'common',
    effects: { hunger: 25, mood: 25, CHA: 8 }, desc: 'Made with care. They can tell.' },
];

export const FOOD_CATEGORIES = {
  primal:  { label: 'Primal',  icon: '🥩', color: '#c0392b', primary: 'STR', secondary: 'END' },
  nature:  { label: 'Nature',  icon: '🌿', color: '#27ae60', primary: 'END', secondary: 'CHA' },
  arcane:  { label: 'Arcane',  icon: '✨', color: '#8e44ad', primary: 'INT', secondary: 'SPD' },
  crafted: { label: 'Crafted', icon: '🎭', color: '#e67e22', primary: 'CHA', secondary: null  },
};
