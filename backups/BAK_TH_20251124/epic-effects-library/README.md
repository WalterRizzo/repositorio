# 🎭 Epic Effects Library

Una biblioteca completa de efectos visuales y de audio **aleatorios** para aplicaciones web React. Cada vez que ejecutas una acción, obtienes emojis, colores y sonidos diferentes, haciendo la experiencia única e impredecible.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Características Principales

- 🎲 **Variación Aleatoria**: Cada interacción muestra emojis y colores diferentes
- 🎵 **Sonidos Dinámicos**: Múltiples variaciones de melodías para cada tipo de acción
- 🎨 **Paletas de Colores**: 12 paletas temáticas que se aplican aleatoriamente
- 🎬 **Animaciones 3D**: Efectos con perspectiva, rotación y transformaciones
- 💫 **Partículas Inteligentes**: Sistema de partículas configurable con emojis
- 🔊 **Audio Context API**: Síntesis de sonido sin archivos externos
- 📦 **Zero Dependencies**: No requiere librerías externas (solo React)
- 🎯 **TypeScript**: Completamente tipado para mejor DX

## 📋 Tabla de Contenidos

- [Instalación](#-instalación)
- [Uso Rápido](#-uso-rápido)
- [API Completa](#-api-completa)
  - [Emojis](#emojis)
  - [Sonidos](#sonidos)
  - [Colores](#colores)
- [Ejemplos](#-ejemplos)
- [Personalización](#-personalización)
- [Tipos de Efectos](#-tipos-de-efectos)
- [Performance](#-performance)
- [Roadmap](#-roadmap)

## 🚀 Instalación

### Opción 1: Copiar la carpeta

```bash
# Copiar la carpeta epic-effects-library a tu proyecto
cp -r epic-effects-library /tu-proyecto/src/
```

### Opción 2: Import directo

```typescript
// En tus componentes React
import { getRandomEmoji, getRandomEmojis } from '@/epic-effects-library/effects/EmojiVariations';
import { playRandomSound } from '@/epic-effects-library/sounds/SoundVariations';
import { getRandomPalette, getColorSet } from '@/epic-effects-library/effects/ColorVariations';
```

### Opción 3: Instalación como paquete (próximamente)

```bash
npm install @epic-effects/library
# o
yarn add @epic-effects/library
```

## ⚡ Uso Rápido

### Ejemplo Básico - Emoji Aleatorio

```tsx
import { useState } from 'react';
import { getRandomEmoji } from '@/epic-effects-library/effects/EmojiVariations';
import { playRandomSound } from '@/epic-effects-library/sounds/SoundVariations';

function SaveButton() {
  const [showNotification, setShowNotification] = useState(false);
  const [emoji, setEmoji] = useState('');

  const handleSave = () => {
    // Obtener emoji aleatorio
    const randomEmoji = getRandomEmoji('save');
    setEmoji(randomEmoji);
    
    // Reproducir sonido aleatorio
    playRandomSound('save');
    
    // Mostrar notificación
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <>
      <button onClick={handleSave}>
        Guardar
      </button>
      
      {showNotification && (
        <div className="notification">
          <span className="text-6xl">{emoji}</span>
          <p>¡Guardado exitosamente!</p>
        </div>
      )}
    </>
  );
}
```

### Ejemplo Avanzado - Efecto Completo con Partículas

```tsx
import { useState } from 'react';
import { getRandomEmoji, getRandomEmojis } from '@/epic-effects-library/effects/EmojiVariations';
import { playRandomSound } from '@/epic-effects-library/sounds/SoundVariations';
import { getColorSet } from '@/epic-effects-library/effects/ColorVariations';

function ApproveButton() {
  const [showEffect, setShowEffect] = useState(false);
  const [mainEmoji, setMainEmoji] = useState('');
  const [particles, setParticles] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const handleApprove = () => {
    // Configurar efecto aleatorio
    setMainEmoji(getRandomEmoji('approve'));
    setParticles(getRandomEmojis('approve', 'particles', 20));
    setColors(getColorSet(5));
    
    // Reproducir sonido
    playRandomSound('approve', 0.3);
    
    // Mostrar efecto
    setShowEffect(true);
    setTimeout(() => setShowEffect(false), 3500);
  };

  return (
    <>
      <button onClick={handleApprove}>Aprobar</button>
      
      {showEffect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          {/* Partículas flotantes */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((emoji, i) => (
              <div
                key={i}
                className="absolute text-4xl animate-float-up"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: '-10%',
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
          
          {/* Tarjeta principal */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 shadow-2xl">
            <div className="text-8xl animate-bounce">{mainEmoji}</div>
            <p className="text-white text-2xl font-bold mt-4">¡Aprobado!</p>
          </div>
        </div>
      )}
    </>
  );
}
```

## 📚 API Completa

### Emojis

#### `getRandomEmoji(type, variant?)`

Obtiene un emoji aleatorio del conjunto especificado.

**Parámetros:**
- `type`: `'save' | 'approve' | 'reject' | 'balance' | 'bonus' | 'success' | 'loading' | 'creative'`
- `variant`: `'main' | 'particles'` (default: `'main'`)

**Retorna:** `string` - Emoji aleatorio

**Ejemplo:**
```typescript
const emoji = getRandomEmoji('save'); // 🎉, ✨, 🎊, etc.
const particle = getRandomEmoji('save', 'particles'); // ⭐, 💫, etc.
```

#### `getRandomEmojis(type, variant, count)`

Obtiene múltiples emojis aleatorios.

**Parámetros:**
- `type`: Tipo de emoji
- `variant`: 'main' o 'particles'
- `count`: Cantidad de emojis

**Retorna:** `string[]` - Array de emojis

**Ejemplo:**
```typescript
const particles = getRandomEmojis('approve', 'particles', 20);
// ['⭐', '✨', '🌟', '💫', ...]
```

#### `getSpecialEmoji(type, special?)`

Obtiene un emoji especial basado en condiciones.

**Condiciones especiales:**
- `'first'` - Primera vez (🎊)
- `'milestone'` - Hito alcanzado (🏆)
- `'lucky'` - Suerte (🍀)
- `'perfect'` - Perfecto (💯)
- `'rocket'` - Rápido (🚀)
- `'fire'` - En racha (🔥)
- `'diamond'` - Premium (💎)
- `'crown'` - VIP (👑)

**Ejemplo:**
```typescript
const specialEmoji = getSpecialEmoji('save', 'first');
// 🎊 para la primera vez
```

#### `generateEmojiSet(type, particleCount)`

Genera un conjunto completo de emojis para una animación.

**Retorna:**
```typescript
{
  main: string;        // Emoji principal
  particles: string[]; // Array de partículas
}
```

### Sonidos

#### `playRandomSound(type, volume?)`

Reproduce un sonido con variación aleatoria.

**Parámetros:**
- `type`: `'save' | 'approve' | 'reject' | 'money' | 'magic' | 'epic'`
- `volume`: `number` (0.0 - 1.0, default: 0.3)

**Variaciones disponibles:**
- **save**: 5 variaciones (acordes ascendentes, cascadas, arpegios)
- **approve**: 4 variaciones (fanfarrias, acordes alegres)
- **reject**: 4 variaciones (descensos, alertas)
- **money**: 4 variaciones (cha-ching en diferentes tonos)
- **magic**: 3 variaciones (efectos mágicos brillantes)
- **epic**: 2 variaciones (fanfarrias completas)

**Ejemplo:**
```typescript
playRandomSound('save', 0.25);  // Volumen bajo
playRandomSound('money', 0.5);  // Volumen medio
```

#### `getRandomSoundVariation(type)`

Obtiene una variación de sonido sin reproducirla.

**Retorna:**
```typescript
{
  notes: number[];     // Frecuencias en Hz
  durations: number[]; // Duraciones en segundos
  delays: number[];    // Delays en segundos
  description: string; // Descripción de la variación
}
```

### Colores

#### `getRandomPalette()`

Obtiene una paleta de colores aleatoria completa.

**Retorna:**
```typescript
{
  primary: string[];   // Colores primarios
  secondary: string[]; // Colores secundarios
  accent: string[];    // Colores de acento
  glow: string[];      // Colores con opacidad para efectos glow
  description: string; // Descripción de la paleta
}
```

**Paletas disponibles:**
- 🌈 rainbow - Arcoíris vibrante
- 💎 crystal - Cristales brillantes
- 🔥 fire - Fuego ardiente
- 🌿 nature - Naturaleza verde
- 💜 purple - Púrpura mágico
- 🌟 gold - Dorado lujoso
- 🌊 ocean - Océano profundo
- 🍬 candy - Dulces pasteles
- ⚡ electric - Eléctrico neón
- 🌸 sakura - Flores de cerezo
- 🌌 galaxy - Galaxia espacial
- 🍊 citrus - Cítricos frescos

#### `getRandomColor(type?)`

Obtiene un color aleatorio de un tipo específico.

**Parámetros:**
- `type`: `'primary' | 'secondary' | 'accent' | 'glow'` (default: 'primary')

**Ejemplo:**
```typescript
const primary = getRandomColor('primary');   // '#FF6B6B'
const accent = getRandomColor('accent');     // '#FFE66D'
const glow = getRandomColor('glow');         // 'rgba(255,107,107,0.4)'
```

#### `getColorSet(count)`

Obtiene múltiples colores de una paleta aleatoria.

**Parámetros:**
- `count`: Cantidad de colores (default: 5)

**Retorna:** `string[]`

**Ejemplo:**
```typescript
const colors = getColorSet(8);
// ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', ...]

// Usar en partículas
colors.map((color, i) => (
  <div style={{ backgroundColor: color }} />
))
```

#### `getPalette(name)`

Obtiene una paleta específica por nombre.

**Ejemplo:**
```typescript
const firePalette = getPalette('fire');
const oceanPalette = getPalette('ocean');
```

## 🎯 Ejemplos

### Ejemplo 1: Botón de Guardado con Confetti

```tsx
function SaveButton() {
  const [show, setShow] = useState(false);
  const [emoji, setEmoji] = useState('');
  const [confetti, setConfetti] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const handleSave = async () => {
    // Guardar datos...
    await saveData();
    
    // Efecto épico
    setEmoji(getRandomEmoji('save'));
    setConfetti(getRandomEmojis('save', 'particles', 50));
    setColors(getColorSet(8));
    playRandomSound('save', 0.25);
    
    setShow(true);
    setTimeout(() => setShow(false), 4000);
  };

  return (
    <>
      <button onClick={handleSave}>💾 Guardar</button>
      
      {show && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Confetti */}
          {confetti.map((e, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                color: colors[i % colors.length],
                animationDelay: `${Math.random()}s`,
              }}
            >
              {e}
            </div>
          ))}
          
          {/* Emoji principal */}
          <div className="flex items-center justify-center h-full">
            <div className="text-9xl animate-spin-3d">{emoji}</div>
          </div>
        </div>
      )}
    </>
  );
}
```

### Ejemplo 2: Notificación de Dinero

```tsx
function MoneyNotification() {
  const [show, setShow] = useState(false);
  const [moneyEmojis, setMoneyEmojis] = useState<string[]>([]);

  const loadBalance = async () => {
    await addBalance(100);
    
    setMoneyEmojis(getRandomEmojis('balance', 'particles', 25));
    playRandomSound('money', 0.3);
    
    setShow(true);
    setTimeout(() => setShow(false), 4000);
  };

  return (
    <>
      <button onClick={loadBalance}>💰 Cargar Saldo</button>
      
      {show && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Lluvia de dinero */}
          {moneyEmojis.map((emoji, i) => (
            <div
              key={i}
              className="absolute text-5xl animate-money-rain"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20%`,
                animationDelay: `${Math.random() * 0.8}s`,
              }}
            >
              {emoji}
            </div>
          ))}
          
          <div className="flex items-center justify-center h-full">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-8">
              <p className="text-white text-3xl font-bold">¡Saldo Cargado! 💰</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

### Ejemplo 3: Aprobación con Estrellas

```tsx
function ApproveEffect() {
  const [show, setShow] = useState(false);
  const [stars, setStars] = useState<string[]>([]);
  const [emoji, setEmoji] = useState('');

  const approve = () => {
    setEmoji(getRandomEmoji('approve'));
    setStars(getRandomEmojis('approve', 'particles', 20));
    playRandomSound('approve', 0.25);
    
    setShow(true);
    setTimeout(() => setShow(false), 3500);
  };

  return (
    <>
      <button onClick={approve}>✅ Aprobar</button>
      
      {show && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Estrellas flotando */}
          {stars.map((star, i) => (
            <div
              key={i}
              className="absolute text-4xl animate-float-up"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '-10%',
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              {star}
            </div>
          ))}
          
          <div className="flex items-center justify-center h-full">
            <div className="text-8xl animate-bounce">{emoji}</div>
          </div>
        </div>
      )}
    </>
  );
}
```

## 🎨 Personalización

### Añadir Nuevos Emojis

Edita `effects/EmojiVariations.ts`:

```typescript
export const EMOJI_VARIATIONS = {
  // ... emojis existentes
  
  // Nuevo tipo personalizado
  custom: {
    main: ['🎮', '🕹️', '👾', '🎯'],
    particles: ['⚡', '💥', '✨', '🌟'],
    description: 'Gaming effects'
  }
};
```

### Añadir Nuevos Sonidos

Edita `sounds/SoundVariations.ts`:

```typescript
export const SOUND_VARIATIONS = {
  // ... sonidos existentes
  
  custom: {
    v1: {
      notes: [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6],
      durations: [0.1, 0.1, 0.1, 0.3],
      delays: [0, 0.05, 0.1, 0.15],
      description: 'Custom melody'
    }
  }
};
```

### Añadir Paletas de Colores

Edita `effects/ColorVariations.ts`:

```typescript
export const COLOR_PALETTES = {
  // ... paletas existentes
  
  custom: {
    primary: ['#FF0000', '#00FF00', '#0000FF'],
    secondary: ['#FFFF00', '#FF00FF', '#00FFFF'],
    accent: ['#FFA500', '#800080', '#008080'],
    glow: ['rgba(255,0,0,0.4)', 'rgba(0,255,0,0.4)'],
    description: 'Custom RGB palette'
  }
};
```

## 🎭 Tipos de Efectos

### Disponibles

| Tipo | Emojis | Sonidos | Uso Recomendado |
|------|--------|---------|-----------------|
| **save** | 🎉✨🎊🎆🎇💫⭐🌟💥🎯🎪🎭🎨 | 5 variaciones | Guardar, crear, generar |
| **approve** | ✅👍💚🎯✔️🏆🥇🎖️👏🙌💯🌟 | 4 variaciones | Aprobar, confirmar, validar |
| **reject** | ❌😡💢⚠️🚫🛑❗⛔😤💥🔥 | 4 variaciones | Rechazar, cancelar, error |
| **balance** | 💰💸💵💴💶💷🤑💲💳🏦📈💎 | 4 variaciones | Dinero, pagos, cargas |
| **bonus** | 🎁🎀🎈🎂🍾🥳🎪🎭🎨🎯🎲🎰 | - | Recompensas especiales |
| **success** | 🚀🎯💪🔥⚡💥🌟✨💫🎆🎇 | - | Logros generales |
| **loading** | ⏳⌛🔄♻️🔃⏰⏲️🕐🕑🕒 | - | Estados de carga |
| **creative** | 🎨🖌️✏️🖍️🖊️✒️🎭🎪🎡🎢 | - | Acciones creativas |

## ⚡ Performance

### Optimizaciones Incluidas

- ✅ **Sin archivos externos**: Todo el audio se genera con Web Audio API
- ✅ **Lazy rendering**: Partículas solo se renderizan cuando son visibles
- ✅ **CSS GPU acceleration**: `transform-gpu` para animaciones suaves
- ✅ **Cleanup automático**: `setTimeout` limpia estados después de animaciones
- ✅ **Pointer events none**: Notificaciones no bloquean interacciones

### Mejores Prácticas

```tsx
// ✅ BIEN: Limpiar estados después de usar
const showEffect = () => {
  setShow(true);
  setTimeout(() => setShow(false), 4000);
};

// ❌ MAL: No limpiar estados
const showEffect = () => {
  setShow(true);
  // Nunca se limpia, memoria leak
};

// ✅ BIEN: Volumen apropiado
playRandomSound('save', 0.25); // Volumen bajo, no molesta

// ❌ MAL: Volumen muy alto
playRandomSound('save', 1.0); // Muy fuerte
```

## 🗺️ Roadmap

### v2.1 (Próximo)
- [ ] Efectos de partículas con física (gravedad, rebotes)
- [ ] Soporte para temas dark/light automático
- [ ] Presets de efectos completos (ej: "celebration", "error", "loading")

### v3.0 (Futuro)
- [ ] Sistema de achievements con efectos especiales
- [ ] Integración con librerías de animación (Framer Motion, GSAP)
- [ ] Soporte para custom shaders WebGL
- [ ] Editor visual de efectos

### v4.0 (Visión)
- [ ] Efectos de IA generativos
- [ ] Sincronización con música externa
- [ ] Efectos 3D con Three.js

## 📄 Licencia

MIT License - Úsalo libremente en proyectos personales o comerciales

## 🤝 Contribuciones

¡Contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una rama con tu feature (`git checkout -b feature/NuevoEfecto`)
3. Commit tus cambios (`git commit -m 'Add: Nuevo efecto espacial'`)
4. Push a la rama (`git push origin feature/NuevoEfecto`)
5. Abre un Pull Request

## 📞 Soporte

- 🐛 **Reportar bugs**: [GitHub Issues](https://github.com/tu-repo/issues)
- 💡 **Solicitar features**: [GitHub Discussions](https://github.com/tu-repo/discussions)
- 📧 **Email**: support@epic-effects.dev

---

Hecho con 💜 por tu equipo de desarrollo

**¡Que cada interacción sea una celebración!** 🎉✨🎊
