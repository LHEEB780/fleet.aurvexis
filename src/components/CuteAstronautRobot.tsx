import React from 'react';

export type RobotColor = 'violet' | 'amber' | 'emerald' | 'sky' | 'rose' | 'teal';
export type RobotSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type RobotExpression = 'happy' | 'winking' | 'smart' | 'focused';

interface CuteAstronautRobotProps {
  color?: RobotColor;
  size?: RobotSize;
  expression?: RobotExpression;
  className?: string;
  animate?: boolean;
  showAmbientGlow?: boolean;
  showFloorShadow?: boolean;
}

const COLOR_CONFIGS: Record<RobotColor, {
  accent: string;
  accentDark: string;
  glow: string;
  glowRgba: string;
  eyeColor: string;
  suitStripe: string;
  ambientShadow: string;
}> = {
  violet: {
    accent: '#8B5CF6',
    accentDark: '#6D28D9',
    glow: '#A78BFA',
    glowRgba: 'rgba(139, 92, 246, 0.35)',
    eyeColor: '#DDD6FE',
    suitStripe: '#7C3AED',
    ambientShadow: 'rgba(124, 58, 237, 0.28)'
  },
  amber: {
    accent: '#F59E0B',
    accentDark: '#D97706',
    glow: '#FCD34D',
    glowRgba: 'rgba(245, 158, 11, 0.35)',
    eyeColor: '#FEF3C7',
    suitStripe: '#EA580C',
    ambientShadow: 'rgba(234, 88, 12, 0.28)'
  },
  emerald: {
    accent: '#10B981',
    accentDark: '#059669',
    glow: '#6EE7B7',
    glowRgba: 'rgba(16, 185, 129, 0.35)',
    eyeColor: '#D1FAE5',
    suitStripe: '#0D9488',
    ambientShadow: 'rgba(16, 185, 129, 0.28)'
  },
  sky: {
    accent: '#0EA5E9',
    accentDark: '#0284C7',
    glow: '#7DD3FC',
    glowRgba: 'rgba(14, 165, 233, 0.35)',
    eyeColor: '#E0F2FE',
    suitStripe: '#0369A1',
    ambientShadow: 'rgba(14, 165, 233, 0.28)'
  },
  rose: {
    accent: '#F43F5E',
    accentDark: '#E11D48',
    glow: '#FDA4AF',
    glowRgba: 'rgba(244, 63, 94, 0.32)',
    eyeColor: '#FFE4E6',
    suitStripe: '#BE123C',
    ambientShadow: 'rgba(244, 63, 94, 0.25)'
  },
  teal: {
    accent: '#14B8A6',
    accentDark: '#0D9488',
    glow: '#5EEAD4',
    glowRgba: 'rgba(20, 184, 166, 0.35)',
    eyeColor: '#CCFBF1',
    suitStripe: '#0F766E',
    ambientShadow: 'rgba(20, 184, 166, 0.28)'
  }
};

const SIZE_MAP: Record<RobotSize, { px: number; viewBox: string }> = {
  xs: { px: 28, viewBox: '0 0 100 120' },
  sm: { px: 38, viewBox: '0 0 100 120' },
  md: { px: 52, viewBox: '0 0 100 120' },
  lg: { px: 72, viewBox: '0 0 100 120' },
  xl: { px: 96, viewBox: '0 0 100 120' }
};

export default function CuteAstronautRobot({
  color = 'violet',
  size = 'md',
  expression = 'happy',
  className = '',
  animate = true,
  showAmbientGlow = true,
  showFloorShadow = true
}: CuteAstronautRobotProps) {
  const cfg = COLOR_CONFIGS[color] || COLOR_CONFIGS.violet;
  const { px } = SIZE_MAP[size] || SIZE_MAP.md;
  const uniqueId = React.useId().replace(/:/g, '_');

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: px, height: px * 1.15 }}
    >
      {/* Soft Ambient Eye-Friendly Glow behind the robot */}
      {showAmbientGlow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40 pointer-events-none transition-all duration-300"
          style={{
            backgroundColor: cfg.accent,
            transform: 'scale(0.85)'
          }}
        />
      )}

      {/* SVG Cute 3D Astronaut Robot */}
      <svg
        viewBox="0 0 100 120"
        className={`w-full h-full relative z-10 transition-transform ${animate ? 'animate-floating-slow' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Suit highlights gradient */}
          <linearGradient id={`suit_grad_${uniqueId}`} x1="20" y1="10" x2="80" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.65" stopColor="#F1F5F9" />
            <stop offset="1" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Helmet curvature gradient */}
          <linearGradient id={`helmet_grad_${uniqueId}`} x1="30" y1="10" x2="75" y2="65" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.5" stopColor="#F8FAFC" />
            <stop offset="1" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Dark Glossy Visor Gradient */}
          <linearGradient id={`visor_grad_${uniqueId}`} x1="50" y1="20" x2="50" y2="54" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E2433" />
            <stop offset="0.6" stopColor="#0F141F" />
            <stop offset="1" stopColor="#080B11" />
          </linearGradient>

          {/* Visor Glass Flare */}
          <linearGradient id={`flare_grad_${uniqueId}`} x1="35" y1="22" x2="65" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity="0.38" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Accent Ribbon Gradient */}
          <linearGradient id={`accent_grad_${uniqueId}`} x1="30" y1="58" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor={cfg.accent} />
            <stop offset="1" stopColor={cfg.accentDark} />
          </linearGradient>

          {/* LED Glow Filter for Eyes & Smile */}
          <filter id={`led_glow_${uniqueId}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- 1. Small Astronaut Arms --- */}
        {/* Left Arm */}
        <path
          d="M 27 65 C 20 68 17 76 21 82 C 24 86 28 85 30 81 Z"
          fill={`url(#suit_grad_${uniqueId})`}
          stroke="#94A3B8"
          strokeWidth="1.2"
        />
        {/* Left Hand / Glove */}
        <ellipse cx="21" cy="82" rx="4.5" ry="4" fill="#94A3B8" />

        {/* Right Arm */}
        <path
          d="M 73 65 C 80 68 83 76 79 82 C 76 86 72 85 70 81 Z"
          fill={`url(#suit_grad_${uniqueId})`}
          stroke="#94A3B8"
          strokeWidth="1.2"
        />
        {/* Right Hand / Glove */}
        <ellipse cx="79" cy="82" rx="4.5" ry="4" fill="#94A3B8" />

        {/* --- 2. Little Astronaut Boots / Legs --- */}
        {/* Left Boot */}
        <rect x="34" y="93" width="13" height="12" rx="5" fill="#64748B" stroke="#475569" strokeWidth="1" />
        <rect x="32" y="100" width="16" height="5" rx="2.5" fill="#475569" />

        {/* Right Boot */}
        <rect x="53" y="93" width="13" height="12" rx="5" fill="#64748B" stroke="#475569" strokeWidth="1" />
        <rect x="52" y="100" width="16" height="5" rx="2.5" fill="#475569" />

        {/* --- 3. Chubby Astronaut Body / Torso --- */}
        <path
          d="M 30 62 C 30 58 70 58 70 62 C 74 72 74 88 68 94 C 64 97 36 97 32 94 C 26 88 26 72 30 62 Z"
          fill={`url(#suit_grad_${uniqueId})`}
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />

        {/* Chest Panel / Harness Stripes (Orange / Themed) */}
        <path
          d="M 33 63 Q 50 67 67 63"
          stroke={cfg.suitStripe}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 36 68 Q 50 71 64 68"
          stroke={cfg.accent}
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Chest Device Display with mini indicators */}
        <rect x="42" y="73" width="16" height="10" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="0.8" />
        {/* Mini status LEDs on chest */}
        <circle cx="46" cy="78" r="1.5" fill={cfg.glow} />
        <circle cx="50" cy="78" r="1.2" fill="#22C55E" />
        <circle cx="54" cy="78" r="1.2" fill="#38BDF8" />

        {/* --- 4. Neck Collar Ring --- */}
        <ellipse cx="50" cy="58" rx="22" ry="6" fill={`url(#accent_grad_${uniqueId})`} stroke={cfg.accentDark} strokeWidth="1" />

        {/* --- 5. Helmet Side Ear Pods / Antenna Dials --- */}
        {/* Left Ear Pod */}
        <ellipse cx="20" cy="36" rx="5" ry="8" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" />
        <ellipse cx="19" cy="36" rx="2.8" ry="5" fill={cfg.accent} />

        {/* Right Ear Pod */}
        <ellipse cx="80" cy="36" rx="5" ry="8" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" />
        <ellipse cx="81" cy="36" rx="2.8" ry="5" fill={cfg.accent} />

        {/* --- 6. Round Astronaut Helmet --- */}
        <ellipse
          cx="50"
          cy="36"
          rx="31"
          ry="26"
          fill={`url(#helmet_grad_${uniqueId})`}
          stroke="#CBD5E1"
          strokeWidth="1.6"
        />

        {/* Helmet Top Specular Arc */}
        <path
          d="M 34 16 C 42 12 58 12 66 16"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* --- 7. Dark Glossy Visor Screen --- */}
        <ellipse
          cx="50"
          cy="37"
          rx="24"
          ry="19"
          fill={`url(#visor_grad_${uniqueId})`}
          stroke="#334155"
          strokeWidth="1.2"
        />

        {/* Visor Glass Top Specular Glaze */}
        <path
          d="M 33 28 C 42 22 58 22 67 28 C 65 32 35 32 33 28 Z"
          fill={`url(#flare_grad_${uniqueId})`}
        />

        {/* --- 8. Cute Glowing LED Eyes & Smile --- */}
        <g filter={`url(#led_glow_${uniqueId})`}>
          {expression === 'winking' ? (
            <>
              {/* Left Eye: Big Warm Glowing Oval */}
              <ellipse cx="42" cy="35" rx="3.5" ry="4.5" fill={cfg.glow} />
              <ellipse cx="43" cy="33.5" rx="1.2" ry="1.5" fill="#FFFFFF" />
              {/* Right Eye: Cute Wink Arc */}
              <path
                d="M 54 36 Q 59 31 64 36"
                stroke={cfg.glow}
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </>
          ) : expression === 'focused' ? (
            <>
              {/* Left Focused Eye */}
              <ellipse cx="42" cy="35" rx="3.8" ry="3.8" fill={cfg.glow} />
              <circle cx="43" cy="34" r="1.3" fill="#FFFFFF" />
              {/* Right Focused Eye */}
              <ellipse cx="58" cy="35" rx="3.8" ry="3.8" fill={cfg.glow} />
              <circle cx="59" cy="34" r="1.3" fill="#FFFFFF" />
            </>
          ) : (
            <>
              {/* Standard Happy/Warm Cute Eyes like in Photo */}
              {/* Left Eye */}
              <ellipse cx="41" cy="36" rx="4" ry="4.8" fill={cfg.glow} />
              <circle cx="42.5" cy="34.5" r="1.4" fill="#FFFFFF" />

              {/* Right Eye */}
              <ellipse cx="59" cy="36" rx="4" ry="4.8" fill={cfg.glow} />
              <circle cx="60.5" cy="34.5" r="1.4" fill="#FFFFFF" />
            </>
          )}

          {/* Cute Glowing Smile */}
          <path
            d="M 46 44 Q 50 48 54 44"
            stroke={cfg.glow}
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>

      {/* Ground / Contact Shadow */}
      {showFloorShadow && (
        <div
          className="w-8 h-1.5 rounded-full blur-xs mx-auto -mt-0.5 opacity-35"
          style={{ backgroundColor: cfg.ambientShadow }}
        />
      )}
    </div>
  );
}
