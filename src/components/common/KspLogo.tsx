import React from 'react';

interface KspLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  inverted?: boolean;
}

export const KspLogo: React.FC<KspLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor,
  inverted = false,
}) => {
  const sizeMap = {
    sm: { icon: 'h-8 w-8', container: 'h-8', textTitle: 'text-xs', textSub: 'text-[8px] tracking-[0.2em]' },
    md: { icon: 'h-11 w-11', container: 'h-11', textTitle: 'text-sm', textSub: 'text-[9px] tracking-[0.25em]' },
    lg: { icon: 'h-16 w-16', container: 'h-16', textTitle: 'text-lg', textSub: 'text-[10px] tracking-[0.3em]' },
    xl: { icon: 'h-24 w-24', container: 'h-24', textTitle: 'text-2xl', textSub: 'text-xs tracking-[0.35em]' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Scalable Vector Emblem matching official brand identity */}
      <div className={`relative shrink-0 flex items-center justify-center ${currentSize.icon}`}>
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          <defs>
            {/* Orange to Red-Orange Gradient for Body & Main Ribbon */}
            <linearGradient id="kspOrangeGradient" x1="20%" y1="10%" x2="80%" y2="90%">
              <stop offset="0%" stopColor="#FF4500" />
              <stop offset="35%" stopColor="#FF6B00" />
              <stop offset="70%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FFB703" />
            </linearGradient>

            {/* Golden Yellow Gradient for Wing Arcs */}
            <linearGradient id="kspGoldWing" x1="0%" y1="50%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#FF7A00" />
              <stop offset="50%" stopColor="#FFB700" />
              <stop offset="100%" stopColor="#FFD000" />
            </linearGradient>

            {/* Sub-arc Gradient */}
            <linearGradient id="kspSubWing" x1="0%" y1="30%" x2="100%" y2="90%">
              <stop offset="0%" stopColor="#E65100" />
              <stop offset="60%" stopColor="#FB8C00" />
              <stop offset="100%" stopColor="#FFA726" />
            </linearGradient>
          </defs>

          {/* Top Star (Largest) */}
          <polygon
            points="48,32 53,44 65,49 53,54 48,66 43,54 31,49 43,44"
            fill="#111827"
          />

          {/* Middle Star */}
          <polygon
            points="44,80 47,88 56,92 47,96 44,104 41,96 32,92 41,88"
            fill="#111827"
          />

          {/* Bottom Star (Smallest) */}
          <polygon
            points="60,118 62,124 69,127 62,130 60,136 58,130 51,127 58,124"
            fill="#111827"
          />

          {/* Head (Black Circle) */}
          <circle cx="80" cy="74" r="14" fill="#111827" />

          {/* Reaching Human Silhouette / Dynamic Upward Swoosh */}
          <path
            d="M 52,60 C 58,60 63,70 63,85 C 63,115 85,140 128,142 C 100,138 78,122 75,95 C 72,70 65,58 52,60 Z"
            fill="url(#kspOrangeGradient)"
          />

          {/* Inner Accent Line (Black Crescent rim) */}
          <path
            d="M 84,115 C 92,90 108,82 124,84 C 114,92 98,102 91,120 Z"
            fill="#111827"
          />

          {/* Golden Wing / Outer Flare Swoosh */}
          <path
            d="M 75,95 C 95,85 130,85 168,125 C 145,116 115,110 88,126 C 82,114 78,104 75,95 Z"
            fill="url(#kspGoldWing)"
          />

          {/* Lower Concentric Energy Arcs */}
          <path
            d="M 98,120 C 112,108 132,110 148,124 C 136,120 120,119 106,127 Z"
            fill="url(#kspSubWing)"
          />
          <path
            d="M 112,126 C 122,118 136,120 144,128 C 136,125 125,125 116,131 Z"
            fill="url(#kspOrangeGradient)"
          />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <span
            className={`font-black uppercase tracking-wider ${currentSize.textTitle} ${
              textColor
                ? textColor
                : inverted
                ? 'text-white'
                : 'text-amber-500 dark:text-amber-400'
            }`}
            style={{
              textShadow: inverted ? '0 1px 2px rgba(0,0,0,0.3)' : undefined,
              letterSpacing: '0.05em',
            }}
          >
            KARYA MANDIRI
          </span>
          <span
            className={`font-bold uppercase font-sans ${currentSize.textSub} ${
              textColor
                ? textColor
                : inverted
                ? 'text-amber-300/90'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            I N D O N E S I A
          </span>
        </div>
      )}
    </div>
  );
};
