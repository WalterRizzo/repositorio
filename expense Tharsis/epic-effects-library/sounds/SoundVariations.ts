/**
 * 🎵 EPIC EFFECTS LIBRARY - SOUND VARIATIONS
 * Sistema de sonidos aleatorios con variaciones de tonos y efectos
 * Cada acción puede tener diferentes melodías y efectos de audio
 */

export interface SoundConfig {
  type: 'success' | 'error' | 'save' | 'money' | 'magic' | 'epic';
  frequency: number;
  duration: number;
  volume: number;
}

export interface SoundVariation {
  notes: number[];
  durations: number[];
  delays: number[];
  description: string;
}

// Frecuencias de notas musicales (Hz)
const NOTES = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98, A6: 1760.00, B6: 1975.53,
  C7: 2093.00
};

export const SOUND_VARIATIONS = {
  // 💾 SAVE - Variaciones para guardar
  save: {
    v1: {
      notes: [NOTES.C5, NOTES.E5, NOTES.G5],
      durations: [0.15, 0.15, 0.3],
      delays: [0, 0.1, 0.2],
      description: 'Acorde ascendente suave'
    },
    v2: {
      notes: [NOTES.G5, NOTES.C6, NOTES.E6],
      durations: [0.1, 0.1, 0.4],
      delays: [0, 0.05, 0.15],
      description: 'Brillante y rápido'
    },
    v3: {
      notes: [NOTES.C5, NOTES.G5, NOTES.C6, NOTES.G6],
      durations: [0.1, 0.1, 0.1, 0.3],
      delays: [0, 0.08, 0.16, 0.24],
      description: 'Cascada de octavas'
    },
    v4: {
      notes: [NOTES.E5, NOTES.G5, NOTES.B5, NOTES.E6],
      durations: [0.12, 0.12, 0.12, 0.35],
      delays: [0, 0.1, 0.2, 0.3],
      description: 'Arpeggio melódico'
    },
    v5: {
      notes: [NOTES.A4, NOTES.C5, NOTES.E5, NOTES.A5, NOTES.C6],
      durations: [0.1, 0.1, 0.1, 0.1, 0.4],
      delays: [0, 0.05, 0.1, 0.15, 0.2],
      description: 'Ascenso triunfal'
    }
  },

  // ✅ APPROVE - Variaciones para aprobar
  approve: {
    v1: {
      notes: [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6],
      durations: [0.1, 0.1, 0.1, 0.3],
      delays: [0, 0.05, 0.1, 0.15],
      description: 'Acorde mayor alegre'
    },
    v2: {
      notes: [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.G5],
      durations: [0.12, 0.12, 0.12, 0.35],
      delays: [0, 0.08, 0.16, 0.24],
      description: 'Positivo y brillante'
    },
    v3: {
      notes: [NOTES.F5, NOTES.A5, NOTES.C6],
      durations: [0.15, 0.15, 0.4],
      delays: [0, 0.1, 0.2],
      description: 'Fanfarria corta'
    },
    v4: {
      notes: [NOTES.D5, NOTES.F5, NOTES.A5, NOTES.D6],
      durations: [0.1, 0.1, 0.1, 0.3],
      delays: [0, 0.07, 0.14, 0.21],
      description: 'Victoria suave'
    }
  },

  // ❌ REJECT - Variaciones para rechazar
  reject: {
    v1: {
      notes: [NOTES.E5, NOTES.D5, NOTES.C5],
      durations: [0.1, 0.1, 0.3],
      delays: [0, 0.08, 0.16],
      description: 'Descenso advertencia'
    },
    v2: {
      notes: [NOTES.G5, NOTES.F5, NOTES.D5, NOTES.C5],
      durations: [0.08, 0.08, 0.08, 0.25],
      delays: [0, 0.06, 0.12, 0.18],
      description: 'Cascada de alerta'
    },
    v3: {
      notes: [NOTES.A4, NOTES.F4, NOTES.C4],
      durations: [0.15, 0.15, 0.35],
      delays: [0, 0.1, 0.2],
      description: 'Error profundo'
    },
    v4: {
      notes: [NOTES.B4, NOTES.A4, NOTES.G4, NOTES.F4],
      durations: [0.1, 0.1, 0.1, 0.3],
      delays: [0, 0.05, 0.1, 0.15],
      description: 'Negación suave'
    }
  },

  // 💰 MONEY - Variaciones para dinero
  money: {
    v1: {
      notes: [NOTES.E4, NOTES.G4, NOTES.C5, NOTES.E5],
      durations: [0.08, 0.08, 0.08, 0.25],
      delays: [0, 0.06, 0.12, 0.18],
      description: 'Cha-ching clásico'
    },
    v2: {
      notes: [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6],
      durations: [0.1, 0.1, 0.1, 0.3],
      delays: [0, 0.05, 0.1, 0.15],
      description: 'Dinero brillante'
    },
    v3: {
      notes: [NOTES.G4, NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6],
      durations: [0.07, 0.07, 0.07, 0.07, 0.3],
      delays: [0, 0.05, 0.1, 0.15, 0.2],
      description: 'Cascada de monedas'
    },
    v4: {
      notes: [NOTES.A4, NOTES.C5, NOTES.E5, NOTES.A5],
      durations: [0.1, 0.1, 0.1, 0.35],
      delays: [0, 0.08, 0.16, 0.24],
      description: 'Riqueza abundante'
    }
  },

  // ✨ MAGIC - Variaciones mágicas
  magic: {
    v1: {
      notes: [NOTES.C6, NOTES.E6, NOTES.G6, NOTES.C7],
      durations: [0.1, 0.1, 0.1, 0.4],
      delays: [0, 0.05, 0.1, 0.15],
      description: 'Polvo de estrellas'
    },
    v2: {
      notes: [NOTES.G5, NOTES.B5, NOTES.D6, NOTES.G6],
      durations: [0.12, 0.12, 0.12, 0.35],
      delays: [0, 0.08, 0.16, 0.24],
      description: 'Hechizo brillante'
    },
    v3: {
      notes: [NOTES.E5, NOTES.G5, NOTES.B5, NOTES.E6, NOTES.G6],
      durations: [0.08, 0.08, 0.08, 0.08, 0.4],
      delays: [0, 0.05, 0.1, 0.15, 0.2],
      description: 'Magia ascendente'
    }
  },

  // 🎆 EPIC - Variaciones épicas
  epic: {
    v1: {
      notes: [NOTES.C4, NOTES.G4, NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6],
      durations: [0.1, 0.1, 0.1, 0.1, 0.1, 0.5],
      delays: [0, 0.05, 0.1, 0.15, 0.2, 0.25],
      description: 'Fanfarria completa'
    },
    v2: {
      notes: [NOTES.E4, NOTES.G4, NOTES.B4, NOTES.E5, NOTES.G5, NOTES.B5, NOTES.E6],
      durations: [0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.5],
      delays: [0, 0.04, 0.08, 0.12, 0.16, 0.2, 0.24],
      description: 'Escala épica'
    }
  }
};

/**
 * Obtiene una variación aleatoria de sonido
 */
export function getRandomSoundVariation(type: keyof typeof SOUND_VARIATIONS): SoundVariation {
  const variations = SOUND_VARIATIONS[type];
  const keys = Object.keys(variations) as Array<keyof typeof variations>;
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return variations[randomKey];
}

/**
 * Reproduce un sonido con variación aleatoria
 */
export function playRandomSound(type: keyof typeof SOUND_VARIATIONS, volume: number = 0.3): void {
  const variation = getRandomSoundVariation(type);
  const audioContext = new AudioContext();
  
  variation.notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + variation.delays[index]);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime + variation.delays[index]);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + variation.delays[index] + variation.durations[index]);
    
    oscillator.start(audioContext.currentTime + variation.delays[index]);
    oscillator.stop(audioContext.currentTime + variation.delays[index] + variation.durations[index]);
  });
}

export type SoundType = keyof typeof SOUND_VARIATIONS;
