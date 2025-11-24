import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export interface BubbleTooltipPortalProps {
  visible: boolean;
  x: number;
  y: number;
  rejectionReason: string;
  rejectedBy?: string;
  rejectedAt?: string;
}

export default function BubbleTooltipPortal({ visible, x, y, rejectionReason, rejectedBy, rejectedAt }: BubbleTooltipPortalProps) {
  const [container, setContainer] = useState<Element | null>(null);

  useEffect(() => {
    let el = document.getElementById("bubble-tooltip-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "bubble-tooltip-root";
      document.body.appendChild(el);
    }
    setContainer(el);
  }, []);

  if (!container || !visible) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 9999,
        pointerEvents: "none",
      }}
      className="bubble-tooltip animate-bubble float-bubble px-6 py-5 min-w-[220px] max-w-md rounded-full shadow-xl border-4 border-pink-400 bg-gradient-to-br from-pink-500 via-red-500 to-purple-500 text-white flex flex-col items-center justify-center"
    >
      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl animate-bounce">🫧</span>
      <span className="inline-block mb-2"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white animate-spin-slow"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></span>
      <span className="text-xs font-bold uppercase tracking-widest mb-1">Rechazo</span>
      <span className="text-sm font-semibold text-white/90 mb-2 break-words whitespace-pre-line text-center" style={{wordBreak: 'break-word', whiteSpace: 'pre-line'}}>{rejectionReason}</span>
      {rejectedBy && (
        <span className="text-xs mt-1 opacity-80">por <span className="font-bold">{rejectedBy}</span></span>
      )}
      {rejectedAt && (
        <span className="text-xs mt-1 opacity-60">{rejectedAt}</span>
      )}
      <span className="absolute bottom-[-18px] left-1/2 -translate-x-1/2 text-2xl animate-pulse">🫧</span>
      <style>{`
        .bubble-tooltip {
          animation: bubblePop 0.7s cubic-bezier(.68,-0.55,.27,1.55) both;
        }
        @keyframes bubblePop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bubble {
          animation: bubbleFloat 2.5s infinite ease-in-out alternate;
        }
        @keyframes bubbleFloat {
          0% { transform: translateY(0); }
          100% { transform: translateY(-12px); }
        }
        .animate-spin-slow {
          animation: spin 2.5s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    container
  );
}
