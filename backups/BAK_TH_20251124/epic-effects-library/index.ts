/**
 * 🎭 EPIC EFFECTS LIBRARY
 * Biblioteca centralizada de efectos visuales y de audio con variaciones aleatorias
 * 
 * @version 2.0.0
 * @author Tu Equipo de Desarrollo
 * @license MIT
 */

// Exportar todos los efectos de emojis
export {
  EMOJI_VARIATIONS,
  getRandomEmoji,
  getRandomEmojis,
  getSpecialEmoji,
  generateEmojiSet,
  type EmojiType,
  type EmojiVariant,
  type EmojiSet
} from './effects/EmojiVariations';

// Exportar todos los sonidos
export {
  SOUND_VARIATIONS,
  getRandomSoundVariation,
  playRandomSound,
  type SoundType,
  type SoundConfig,
  type SoundVariation
} from './sounds/SoundVariations';

// Exportar todas las paletas de colores
export {
  COLOR_PALETTES,
  getRandomPalette,
  getRandomColor,
  getColorSet,
  getPalette,
  type PaletteName,
  type ColorType,
  type ColorPalette
} from './effects/ColorVariations';

// Exportar ejemplos (opcional, para referencia)
export {
  SimpleEmojiButton,
  ConfettiNotification,
  ApprovalEffect,
  RejectEffect,
  MoneyRain,
  MagicEffect,
  CombinedEffect
} from './examples/ComponentExamples';

/**
 * Hook de utilidad para manejar efectos completos
 */
export function useEpicEffect(type: EmojiType) {
  const [show, setShow] = useState(false);
  const [data, setData] = useState({
    emoji: '',
    particles: [] as string[],
    colors: [] as string[]
  });

  const trigger = (particleCount: number = 20, duration: number = 4000) => {
    const emoji = getRandomEmoji(type);
    const particles = getRandomEmojis(type, 'particles', particleCount);
    const colors = getColorSet(8);
    
    setData({ emoji, particles, colors });
    playRandomSound(type as any, 0.25);
    
    setShow(true);
    setTimeout(() => setShow(false), duration);
  };

  return { show, data, trigger };
}

// Re-export useState para el hook
import { useState } from 'react';
