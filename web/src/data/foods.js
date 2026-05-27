// 3 foods, 1 per category. Each maps cleanly to one of the 3 final-evolution
// branches (food-pattern → final form). Add pixel sprite icons later.
export const FOODS = [
  { id: 'wild_jerky',    name: 'Wild Jerky',     category: 'primal', icon: '🍖', rarity: 'common',
    effects: { hunger: 45, STR: 12, END: 6 }, desc: 'Simple, honest fuel for a wild spirit.' },

  { id: 'mossweed_stew', name: 'Mossweed Stew',  category: 'nature', icon: '🍵', rarity: 'common',
    effects: { hunger: 45, END: 12, CHA: 6 }, desc: 'Tastes like the forest after rain.' },

  { id: 'glowshrooms',   name: 'Glowshrooms',    category: 'arcane', icon: '🍄', rarity: 'common',
    effects: { hunger: 45, INT: 12, SPD: 6 }, desc: 'They pulse faintly in the dark.' },
];

export const FOOD_CATEGORIES = {
  primal: { label: 'Primal', icon: '🍖', color: '#c0392b', primary: 'STR', secondary: 'END' },
  nature: { label: 'Nature', icon: '🌿', color: '#27ae60', primary: 'END', secondary: 'CHA' },
  arcane: { label: 'Arcane', icon: '🍄', color: '#8e44ad', primary: 'INT', secondary: 'SPD' },
};
