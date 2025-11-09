/**
 * 🎨 EPIC EFFECTS LIBRARY - COLOR VARIATIONS
 * Sistema de colores aleatorios para partículas, fondos y efectos
 * Paletas temáticas que cambian dinámicamente
 */

export interface ColorPalette {
  primary: string[];
  secondary: string[];
  accent: string[];
  glow: string[];
  description: string;
}

export const COLOR_PALETTES = {
  // 🌈 RAINBOW - Arcoíris vibrante
  rainbow: {
    primary: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'],
    secondary: ['#FF8787', '#6EDDD5', '#5FC9E3', '#FFB89A', '#AAE8D4', '#F9E79F', '#D2B4DE'],
    accent: ['#FFE66D', '#4ECDC4', '#FF6B9D', '#C44569', '#774FF8', '#00D9FF'],
    glow: ['rgba(255,107,107,0.4)', 'rgba(78,205,196,0.4)', 'rgba(255,230,109,0.4)'],
    description: 'Paleta arcoíris multicolor'
  },

  // 💎 CRYSTAL - Cristales brillantes
  crystal: {
    primary: ['#E3F2FD', '#B3E5FC', '#81D4FA', '#4FC3F7', '#29B6F6', '#03A9F4'],
    secondary: ['#FFFFFF', '#F0F8FF', '#E6F7FF', '#CCF2FF', '#B3ECFF'],
    accent: ['#00BCD4', '#00E5FF', '#84FFFF', '#18FFFF'],
    glow: ['rgba(3,169,244,0.3)', 'rgba(0,188,212,0.3)', 'rgba(132,255,255,0.3)'],
    description: 'Tonos cristalinos azules'
  },

  // 🔥 FIRE - Fuego ardiente
  fire: {
    primary: ['#FF4500', '#FF6347', '#FF7F50', '#FFA500', '#FFD700', '#FFFF00'],
    secondary: ['#FF0000', '#FF1493', '#FF69B4', '#FFA07A'],
    accent: ['#FF6B00', '#FF8C00', '#FFA500', '#FFD700'],
    glow: ['rgba(255,69,0,0.5)', 'rgba(255,140,0,0.5)', 'rgba(255,215,0,0.4)'],
    description: 'Colores de fuego intenso'
  },

  // 🌿 NATURE - Naturaleza verde
  nature: {
    primary: ['#2ECC71', '#27AE60', '#52BE80', '#7DCEA0', '#A9DFBF', '#D5F4E6'],
    secondary: ['#82E0AA', '#58D68D', '#48C9B0', '#45B39D'],
    accent: ['#1ABC9C', '#16A085', '#0E6655', '#7DCEA0'],
    glow: ['rgba(46,204,113,0.4)', 'rgba(26,188,156,0.4)', 'rgba(125,206,160,0.3)'],
    description: 'Verdes naturales frescos'
  },

  // 💜 PURPLE - Púrpura mágico
  purple: {
    primary: ['#9B59B6', '#8E44AD', '#AF7AC5', '#C39BD3', '#D7BDE2', '#E8DAEF'],
    secondary: ['#BB8FCE', '#A569BD', '#884EA0', '#76448A'],
    accent: ['#E74C3C', '#EC7063', '#F1948A', '#F5B7B1'],
    glow: ['rgba(155,89,182,0.4)', 'rgba(142,68,173,0.4)', 'rgba(187,143,206,0.3)'],
    description: 'Púrpuras místicos'
  },

  // 🌟 GOLD - Dorado lujoso
  gold: {
    primary: ['#FFD700', '#FFC700', '#FFB700', '#FFA700', '#FF9700', '#FF8700'],
    secondary: ['#FFEB3B', '#FFC107', '#FF9800', '#FF5722'],
    accent: ['#F9A825', '#F57F17', '#E65100', '#BF360C'],
    glow: ['rgba(255,215,0,0.5)', 'rgba(255,193,7,0.4)', 'rgba(255,152,0,0.4)'],
    description: 'Dorados brillantes'
  },

  // 🌊 OCEAN - Océano profundo
  ocean: {
    primary: ['#3498DB', '#2980B9', '#5DADE2', '#85C1E2', '#AED6F1', '#D6EAF8'],
    secondary: ['#1ABC9C', '#16A085', '#48C9B0', '#45B39D'],
    accent: ['#00BCD4', '#00ACC1', '#0097A7', '#00838F'],
    glow: ['rgba(52,152,219,0.4)', 'rgba(26,188,156,0.4)', 'rgba(0,188,212,0.3)'],
    description: 'Azules oceánicos'
  },

  // 🍬 CANDY - Dulces pasteles
  candy: {
    primary: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E0BBE4'],
    secondary: ['#FEC8D8', '#FFDFD3', '#D4F0F0', '#CCE2CB', '#B6CFB6'],
    accent: ['#FF6F91', '#FFC75F', '#845EC2', '#00C9A7', '#C34A36'],
    glow: ['rgba(255,179,186,0.5)', 'rgba(186,225,255,0.5)', 'rgba(224,187,228,0.5)'],
    description: 'Colores pastel dulces'
  },

  // ⚡ ELECTRIC - Eléctrico neón
  electric: {
    primary: ['#00FFFF', '#00FF00', '#FFFF00', '#FF00FF', '#00BFFF', '#7FFF00'],
    secondary: ['#39FF14', '#BC13FE', '#FF1493', '#00CED1'],
    accent: ['#0FF0FC', '#CCFF00', '#FF10F0', '#10FF00'],
    glow: ['rgba(0,255,255,0.6)', 'rgba(0,255,0,0.6)', 'rgba(255,0,255,0.6)'],
    description: 'Neones eléctricos'
  },

  // 🌸 SAKURA - Flores de cerezo
  sakura: {
    primary: ['#FFB7D5', '#FFA6C9', '#FF95BE', '#FF84B2', '#FF73A7', '#FF629B'],
    secondary: ['#FFE4E1', '#FFD6E7', '#FFC0CB', '#FFB6C1'],
    accent: ['#FF1493', '#FF69B4', '#DB7093', '#C71585'],
    glow: ['rgba(255,183,213,0.5)', 'rgba(255,105,180,0.4)', 'rgba(219,112,147,0.4)'],
    description: 'Rosas delicados'
  },

  // 🌌 GALAXY - Galaxia espacial
  galaxy: {
    primary: ['#2C003E', '#512B81', '#7E57C2', '#9575CD', '#B39DDB', '#D1C4E9'],
    secondary: ['#1A237E', '#283593', '#3F51B5', '#5C6BC0'],
    accent: ['#E040FB', '#D500F9', '#AA00FF', '#7C4DFF'],
    glow: ['rgba(124,77,255,0.5)', 'rgba(213,0,249,0.5)', 'rgba(149,117,205,0.4)'],
    description: 'Violetas espaciales'
  },

  // 🍊 CITRUS - Cítricos frescos
  citrus: {
    primary: ['#FF6F00', '#FF8F00', '#FFA000', '#FFB300', '#FFC107', '#FFD54F'],
    secondary: ['#FFEB3B', '#FFF176', '#FFF59D', '#FFF9C4'],
    accent: ['#FF9800', '#FF6D00', '#F57C00', '#EF6C00'],
    glow: ['rgba(255,111,0,0.5)', 'rgba(255,193,7,0.4)', 'rgba(255,235,59,0.4)'],
    description: 'Naranjas y amarillos'
  }
};

/**
 * Obtiene una paleta aleatoria
 */
export function getRandomPalette(): ColorPalette {
  const keys = Object.keys(COLOR_PALETTES) as Array<keyof typeof COLOR_PALETTES>;
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return COLOR_PALETTES[randomKey];
}

/**
 * Obtiene un color aleatorio de un tipo específico
 */
export function getRandomColor(type: 'primary' | 'secondary' | 'accent' | 'glow' = 'primary'): string {
  const palette = getRandomPalette();
  const colors = palette[type];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Obtiene múltiples colores de una paleta
 */
export function getColorSet(count: number = 5): string[] {
  const palette = getRandomPalette();
  const allColors = [...palette.primary, ...palette.secondary, ...palette.accent];
  const colors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    colors.push(allColors[Math.floor(Math.random() * allColors.length)]);
  }
  
  return colors;
}

/**
 * Obtiene una paleta específica por nombre
 */
export function getPalette(name: keyof typeof COLOR_PALETTES): ColorPalette {
  return COLOR_PALETTES[name];
}

export type PaletteName = keyof typeof COLOR_PALETTES;
export type ColorType = 'primary' | 'secondary' | 'accent' | 'glow';
