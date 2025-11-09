/**
 * 🎬 EPIC EFFECTS LIBRARY - EJEMPLOS COMPLETOS
 * Ejemplos listos para copiar y pegar en tus componentes
 */

import { useState } from 'react';
import { getRandomEmoji, getRandomEmojis } from '../effects/EmojiVariations';
import { playRandomSound } from '../sounds/SoundVariations';
import { getColorSet, getRandomPalette } from '../effects/ColorVariations';

// ========================================
// EJEMPLO 1: Botón Simple con Emoji Aleatorio
// ========================================

export function SimpleEmojiButton() {
  const [emoji, setEmoji] = useState('');
  const [show, setShow] = useState(false);

  const handleClick = () => {
    const randomEmoji = getRandomEmoji('save');
    setEmoji(randomEmoji);
    playRandomSound('save', 0.25);
    
    setShow(true);
    setTimeout(() => setShow(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Guardar
      </button>
      
      {show && (
        <div className="absolute top-0 left-0 text-6xl animate-bounce">
          {emoji}
        </div>
      )}
    </div>
  );
}

// ========================================
// EJEMPLO 2: Notificación Completa con Confetti
// ========================================

export function ConfettiNotification() {
  const [show, setShow] = useState(false);
  const [emoji, setEmoji] = useState('');
  const [confetti, setConfetti] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const celebrate = () => {
    setEmoji(getRandomEmoji('save'));
    setConfetti(getRandomEmojis('save', 'particles', 50));
    setColors(getColorSet(8));
    playRandomSound('save', 0.25);
    
    setShow(true);
    setTimeout(() => setShow(false), 4000);
  };

  if (!show) {
    return (
      <button onClick={celebrate} className="px-6 py-3 bg-purple-500 text-white rounded-lg">
        ✨ Celebrar
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-yellow-500/20 animate-pulse"></div>
      
      {/* Confetti cayendo */}
      <div className="absolute inset-0 overflow-hidden">
        {confetti.map((e, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              color: colors[i % colors.length],
              animationDelay: `${Math.random() * 1}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            {e}
          </div>
        ))}
      </div>

      {/* Tarjeta principal */}
      <div className="relative pointer-events-auto">
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 rounded-3xl shadow-2xl p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-9xl animate-spin-3d">{emoji}</div>
            <h2 className="text-4xl font-black text-white">¡Éxito!</h2>
            <p className="text-white text-lg">Operación completada</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// EJEMPLO 3: Aprobación con Estrellas Flotantes
// ========================================

export function ApprovalEffect() {
  const [show, setShow] = useState(false);
  const [emoji, setEmoji] = useState('');
  const [stars, setStars] = useState<string[]>([]);

  const approve = () => {
    setEmoji(getRandomEmoji('approve'));
    setStars(getRandomEmojis('approve', 'particles', 20));
    playRandomSound('approve', 0.25);
    
    setShow(true);
    setTimeout(() => setShow(false), 3500);
  };

  if (!show) {
    return (
      <button onClick={approve} className="px-6 py-3 bg-green-500 text-white rounded-lg">
        ✅ Aprobar
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Estrellas flotando desde abajo */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute text-4xl animate-float-up"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-10%',
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${2 + Math.random() * 1}s`,
            }}
          >
            {star}
          </div>
        ))}
      </div>
      
      <div className="relative pointer-events-auto animate-bounce-in">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
        <div className="relative flex items-center space-x-4 p-6 rounded-2xl shadow-2xl backdrop-blur-lg border-2 bg-gradient-to-r from-emerald-500/90 to-green-600/90 border-emerald-300">
          <div className="text-8xl animate-bounce">{emoji}</div>
          <div className="text-white">
            <p className="text-2xl font-bold">¡Aprobado!</p>
            <p className="text-sm opacity-90">Operación exitosa</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// EJEMPLO 4: Rechazo con Rayos
// ========================================

export function RejectEffect() {
  const [show, setShow] = useState(false);
  const [emoji, setEmoji] = useState('');
  const [colors, setColors] = useState<string[]>([]);

  const reject = () => {
    setEmoji(getRandomEmoji('reject'));
    setColors(getColorSet(6));
    playRandomSound('reject', 0.25);
    
    setShow(true);
    setTimeout(() => setShow(false), 3500);
  };

  if (!show) {
    return (
      <button onClick={reject} className="px-6 py-3 bg-red-500 text-white rounded-lg">
        ❌ Rechazar
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Rayos parpadeantes */}
      <div className="absolute inset-0 overflow-hidden">
        {colors.map((color, i) => (
          <div
            key={i}
            className="absolute h-2 opacity-40 animate-lightning"
            style={{
              width: '150%',
              left: '-25%',
              top: `${10 + i * 15}%`,
              background: `linear-gradient(to right, transparent, ${color}, transparent)`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <div className="relative pointer-events-auto animate-shake-intense">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
        <div className="relative flex items-center space-x-4 p-6 rounded-2xl shadow-2xl backdrop-blur-lg border-2 bg-gradient-to-r from-red-500/90 to-rose-600/90 border-red-300">
          <div className="text-8xl animate-shake">{emoji}</div>
          <div className="text-white">
            <p className="text-2xl font-bold">Rechazado</p>
            <p className="text-sm opacity-90">Operación cancelada</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// EJEMPLO 5: Lluvia de Dinero
// ========================================

export function MoneyRain() {
  const [show, setShow] = useState(false);
  const [money, setMoney] = useState<string[]>([]);
  const [mainEmoji, setMainEmoji] = useState('');

  const loadMoney = () => {
    setMainEmoji(getRandomEmoji('balance'));
    setMoney(getRandomEmojis('balance', 'particles', 25));
    playRandomSound('money', 0.3);
    
    setShow(true);
    setTimeout(() => setShow(false), 4000);
  };

  if (!show) {
    return (
      <button onClick={loadMoney} className="px-6 py-3 bg-emerald-500 text-white rounded-lg">
        💰 Cargar Saldo
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Lluvia de dinero */}
      <div className="absolute inset-0 overflow-hidden">
        {money.map((emoji, i) => (
          <div
            key={i}
            className="absolute text-5xl animate-money-rain"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              animationDelay: `${Math.random() * 0.8}s`,
              animationDuration: `${2 + Math.random() * 1.5}s`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Ondas expandiéndose */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border-4 border-yellow-400 animate-ripple"
            style={{
              width: '100px',
              height: '100px',
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative pointer-events-auto animate-bounce-scale">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 rounded-3xl blur-2xl opacity-75"></div>
        <div className="relative flex items-center space-x-4 p-8 rounded-3xl shadow-2xl backdrop-blur-lg border-4 bg-gradient-to-r from-emerald-500/90 via-green-600/90 to-teal-600/90 border-emerald-300">
          <div className="text-8xl">{mainEmoji}</div>
          <div className="text-white">
            <p className="text-3xl font-black">¡Saldo Cargado!</p>
            <p className="text-lg opacity-90">Balance actualizado</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// EJEMPLO 6: Efecto Mágico con Paleta Aleatoria
// ========================================

export function MagicEffect() {
  const [show, setShow] = useState(false);
  const [palette, setPalette] = useState<any>(null);

  const doMagic = () => {
    const randomPalette = getRandomPalette();
    setPalette(randomPalette);
    playRandomSound('magic', 0.25);
    
    setShow(true);
    setTimeout(() => setShow(false), 3000);
  };

  if (!show || !palette) {
    return (
      <button onClick={doMagic} className="px-6 py-3 bg-purple-500 text-white rounded-lg">
        ✨ Magia
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          background: `linear-gradient(135deg, ${palette.primary[0]}, ${palette.primary[1]}, ${palette.primary[2]})`,
          opacity: 0.3
        }}
      />
      
      <div className="relative pointer-events-auto">
        <div 
          className="rounded-3xl shadow-2xl p-8"
          style={{
            background: `linear-gradient(to right, ${palette.primary[0]}, ${palette.accent[0]})`,
          }}
        >
          <div className="text-center">
            <div className="text-9xl mb-4 animate-spin-3d">✨</div>
            <p className="text-white text-2xl font-bold">{palette.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// EJEMPLO 7: Multi-Efecto Combinado
// ========================================

export function CombinedEffect() {
  const [show, setShow] = useState(false);
  const [effect, setEffect] = useState<'save' | 'approve' | 'reject' | 'money'>('save');
  const [data, setData] = useState({
    emoji: '',
    particles: [] as string[],
    colors: [] as string[]
  });

  const triggerEffect = (type: typeof effect) => {
    setEffect(type);
    setData({
      emoji: getRandomEmoji(type),
      particles: getRandomEmojis(type, 'particles', 30),
      colors: getColorSet(8)
    });
    playRandomSound(type, 0.25);
    
    setShow(true);
    setTimeout(() => setShow(false), 4000);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => triggerEffect('save')} className="px-4 py-2 bg-purple-500 text-white rounded">
          💾 Save
        </button>
        <button onClick={() => triggerEffect('approve')} className="px-4 py-2 bg-green-500 text-white rounded">
          ✅ Approve
        </button>
        <button onClick={() => triggerEffect('reject')} className="px-4 py-2 bg-red-500 text-white rounded">
          ❌ Reject
        </button>
        <button onClick={() => triggerEffect('money')} className="px-4 py-2 bg-emerald-500 text-white rounded">
          💰 Money
        </button>
      </div>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
            {data.particles.map((particle, i) => (
              <div
                key={i}
                className="absolute text-4xl animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                  color: data.colors[i % data.colors.length],
                  animationDelay: `${Math.random()}s`,
                }}
              >
                {particle}
              </div>
            ))}
          </div>
          
          <div className="text-9xl animate-bounce-scale">{data.emoji}</div>
        </div>
      )}
    </div>
  );
}
