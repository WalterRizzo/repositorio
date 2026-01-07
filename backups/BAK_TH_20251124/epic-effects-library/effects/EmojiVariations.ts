/**
 * 🎭 EPIC EFFECTS LIBRARY - EMOJI VARIATIONS
 * Sistema de emojis aleatorios para diferentes tipos de acciones
 * Cada vez que se ejecuta una acción, aparece un emoji diferente
 */

export interface EmojiSet {
  main: string[];
  particles: string[];
  description: string;
}

export const EMOJI_VARIATIONS = {
  // 💾 SAVE/CREATE - Efectos al guardar/crear
  save: {
    main: ['🎉', '✨', '🎊', '🎆', '🎇', '💫', '⭐', '🌟', '💥', '🎯', '🎪', '🎭', '🎨'],
    particles: ['✨', '⭐', '🌟', '💫', '⚡', '💥', '🎆', '🎇', '🎊', '🎉'],
    description: 'Emojis celebratorios para acciones de guardado exitoso'
  },

  // ✅ APPROVE - Efectos al aprobar
  approve: {
    main: ['✅', '👍', '💚', '🎯', '✔️', '🏆', '🥇', '🎖️', '👏', '🙌', '💯', '🌟'],
    particles: ['⭐', '✨', '🌟', '💫', '💚', '💙', '💜', '🤍', '💛', '🧡'],
    description: 'Emojis de aprobación y éxito'
  },

  // ❌ REJECT - Efectos al rechazar
  reject: {
    main: ['❌', '😡', '💢', '⚠️', '🚫', '🛑', '❗', '⛔', '😤', '💥', '🔥'],
    particles: ['⚡', '💥', '❗', '❌', '💢', '🔴', '🟥'],
    description: 'Emojis de rechazo y advertencia'
  },

  // 💰 BALANCE/MONEY - Efectos al cargar saldo
  balance: {
    main: ['💰', '💸', '💵', '💴', '💶', '💷', '🤑', '💲', '💳', '🏦', '📈', '💎'],
    particles: ['💵', '💴', '💶', '💷', '💰', '💸', '🪙', '💲'],
    description: 'Emojis relacionados con dinero y finanzas'
  },

  // 🎁 BONUS - Efectos especiales adicionales
  bonus: {
    main: ['🎁', '🎀', '🎈', '🎂', '🍾', '🥳', '🎪', '🎭', '🎨', '🎯', '🎲', '🎰'],
    particles: ['🎈', '🎀', '🎁', '✨', '🌟', '💫', '⭐'],
    description: 'Emojis especiales para ocasiones bonus'
  },

  // 🚀 SUCCESS - Efectos de éxito general
  success: {
    main: ['🚀', '🎯', '💪', '🔥', '⚡', '💥', '🌟', '✨', '💫', '🎆', '🎇'],
    particles: ['⚡', '💥', '✨', '🌟', '💫', '🔥'],
    description: 'Emojis de éxito y logros'
  },

  // ⏰ LOADING - Efectos de carga
  loading: {
    main: ['⏳', '⌛', '🔄', '♻️', '🔃', '⏰', '⏲️', '🕐', '🕑', '🕒'],
    particles: ['⏳', '⌛', '💫', '✨'],
    description: 'Emojis para estados de carga'
  },

  // 🎨 CREATIVE - Efectos creativos
  creative: {
    main: ['🎨', '🖌️', '✏️', '🖍️', '🖊️', '✒️', '🎭', '🎪', '🎡', '🎢'],
    particles: ['🎨', '✨', '💫', '🌟', '⭐', '🎆'],
    description: 'Emojis para acciones creativas'
  }
};

/**
 * Obtiene un emoji aleatorio del conjunto especificado
 * @param type - Tipo de emoji (save, approve, reject, balance, etc.)
 * @param variant - 'main' para emoji principal, 'particles' para partículas
 * @returns Emoji aleatorio
 */
export function getRandomEmoji(type: keyof typeof EMOJI_VARIATIONS, variant: 'main' | 'particles' = 'main'): string {
  const emojiSet = EMOJI_VARIATIONS[type];
  if (!emojiSet) return '✨';
  
  const emojis = emojiSet[variant];
  const randomIndex = Math.floor(Math.random() * emojis.length);
  return emojis[randomIndex];
}

/**
 * Obtiene múltiples emojis aleatorios sin repetir
 * @param type - Tipo de emoji
 * @param variant - 'main' o 'particles'
 * @param count - Cantidad de emojis a obtener
 * @returns Array de emojis únicos
 */
export function getRandomEmojis(type: keyof typeof EMOJI_VARIATIONS, variant: 'main' | 'particles', count: number): string[] {
  const emojiSet = EMOJI_VARIATIONS[type];
  if (!emojiSet) return Array(count).fill('✨');
  
  const emojis = [...emojiSet[variant]];
  const result: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * emojis.length);
    result.push(emojis[randomIndex]);
  }
  
  return result;
}

/**
 * Obtiene un emoji especial basado en condiciones
 * @param type - Tipo base
 * @param special - Condición especial (ej: 'first', 'milestone', 'lucky')
 * @returns Emoji especial o aleatorio normal
 */
export function getSpecialEmoji(type: keyof typeof EMOJI_VARIATIONS, special?: string): string {
  // Emojis especiales para hitos
  const specialEmojis: Record<string, string> = {
    first: '🎊', // Primera vez
    milestone: '🏆', // Hito alcanzado
    lucky: '🍀', // Suerte
    perfect: '💯', // Perfecto
    rocket: '🚀', // Rápido
    fire: '🔥', // En racha
    diamond: '💎', // Premium
    crown: '👑' // VIP
  };

  if (special && specialEmojis[special]) {
    return specialEmojis[special];
  }

  return getRandomEmoji(type, 'main');
}

/**
 * Genera un conjunto completo de emojis para una animación
 * @param type - Tipo de animación
 * @param particleCount - Cantidad de partículas
 * @returns Objeto con emoji principal y array de partículas
 */
export function generateEmojiSet(type: keyof typeof EMOJI_VARIATIONS, particleCount: number = 20) {
  return {
    main: getRandomEmoji(type, 'main'),
    particles: getRandomEmojis(type, 'particles', particleCount)
  };
}

// Exportar tipos para TypeScript
export type EmojiType = keyof typeof EMOJI_VARIATIONS;
export type EmojiVariant = 'main' | 'particles';
