import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

interface AiRobotProps {
  className?: string;
}

type RobotMood = 'idle' | 'happy' | 'sad';

export const AiRobot: React.FC<AiRobotProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mood, setMood] = useState<RobotMood>('idle');
  const [eyeOffset, setEyeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play subtle futuristic synth tone when happy if sound is enabled
  const playFriendlyChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Ignore audio failure
    }
  }, [soundEnabled]);

  // Periodic natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4500);
    return () => clearInterval(blinkInterval);
  }, []);

  // Desktop Mouse Movement Tracker
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const robotCenterX = rect.left + rect.width / 2;
      const robotCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - robotCenterX;
      const deltaY = e.clientY - robotCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Eye tracking clamped range (-14 to 14)
      const maxEyeDisplacement = 14;
      const angle = Math.atan2(deltaY, deltaX);
      const eyeDisplacement = Math.min(distance / 25, maxEyeDisplacement);
      
      setEyeOffset({
        x: Math.cos(angle) * eyeDisplacement,
        y: Math.sin(angle) * eyeDisplacement
      });

      // Subtle 3D head perspective tilt
      setHeadTilt({
        x: Math.max(-8, Math.min(8, deltaX / 50)),
        y: Math.max(-6, Math.min(6, deltaY / 50))
      });

      // Proximity reactions
      if (distance < 240) {
        if (mood !== 'happy') {
          setMood('happy');
          setShowHeart(true);
          playFriendlyChime();
        }
        clearTimeout(timeoutId);
      } else if (distance > 500) {
        if (mood === 'happy') {
          setMood('sad');
          setShowHeart(false);
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setMood('idle');
          }, 3500);
        }
      }
    };

    const handleMouseLeave = () => {
      setMood('sad');
      setShowHeart(false);
      setTimeout(() => {
        setMood('idle');
        setEyeOffset({ x: 0, y: 0 });
        setHeadTilt({ x: 0, y: 0 });
      }, 2500);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timeoutId);
    };
  }, [mood, playFriendlyChime]);

  // Touch Interaction for Mobile
  const handleTouchTrigger = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    setMood('happy');
    setShowHeart(true);
    playFriendlyChime();
    
    // Quick eye wink / look straight at user
    setEyeOffset({ x: 0, y: -2 });
    setHeadTilt({ x: 0, y: -3 });

    setTimeout(() => {
      setShowHeart(false);
      setMood('idle');
      setEyeOffset({ x: 0, y: 0 });
      setHeadTilt({ x: 0, y: 0 });
    }, 3000);
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleTouchTrigger}
      onTouchStart={handleTouchTrigger}
      className={`relative select-none flex flex-col items-center justify-center cursor-pointer group ${className}`}
      title="Prism Flow AI Assistant (Tap or move cursor near me!)"
    >
      {/* Sound Toggle Easter Egg */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSoundEnabled(!soundEnabled);
        }}
        className="absolute -top-3 right-4 z-20 p-1.5 rounded-full bg-bg-elevated/80 border border-white/10 text-text-muted hover:text-mint-primary hover:border-mint-primary/40 transition-all opacity-40 hover:opacity-100 text-xs flex items-center gap-1 backdrop-blur-md"
        aria-label="Toggle robot sound effects"
      >
        {soundEnabled ? <Volume2 size={13} className="text-mint-primary" /> : <VolumeX size={13} />}
        <span className="text-[10px] hidden sm:inline">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
      </button>

      {/* Atmospheric Ambient Glow behind robot */}
      <div 
        className={`absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full pointer-events-none transition-all duration-700 -z-10 blur-3xl ${
          mood === 'happy'
            ? 'bg-gradient-to-t from-cyan-primary/30 via-cyan-secondary/25 to-mint-primary/20 scale-110 opacity-90'
            : mood === 'sad'
            ? 'bg-gradient-to-b from-cyan-primary/10 to-transparent scale-90 opacity-40'
            : 'bg-gradient-to-t from-cyan-primary/20 via-cyan-secondary/10 to-mint-primary/10 scale-100 opacity-60'
        }`}
      />

      {/* Floating Mascot Body */}
      <div 
        className="relative transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `perspective(600px) rotateY(${headTilt.x}deg) rotateX(${-headTilt.y}deg) translateY(${
            mood === 'happy' ? '-8px' : mood === 'sad' ? '4px' : '0px'
          })`
        }}
      >
        {/* Floating Heart / Sparkle reaction badge */}
        <div 
          className={`absolute -top-4 -right-1 z-30 transition-all duration-500 transform ${
            showHeart ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-75 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-elevated/90 border border-mint-primary/40 shadow-mint-glow text-mint-primary text-[11px] font-medium backdrop-blur-md animate-bounce">
            <Sparkles size={11} className="text-mint-primary" />
            <span>Intelligent!</span>
          </div>
        </div>

        {/* 2D Vector Robot Mascot SVG */}
        <svg 
          viewBox="0 0 280 290" 
          className="w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 drop-shadow-2xl transition-all duration-300"
        >
          <defs>
            {/* Body Gradients */}
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#142834" />
              <stop offset="60%" stopColor="#0B1A22" />
              <stop offset="100%" stopColor="#061016" />
            </linearGradient>

            <linearGradient id="visorGlass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#04090D" />
              <stop offset="100%" stopColor="#08141C" />
            </linearGradient>

            {/* Signature Vertical Glow Gradients */}
            <linearGradient id="signaturePrism" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7CFF6A" />
              <stop offset="50%" stopColor="#18B8C4" />
              <stop offset="100%" stopColor="#0F8F9C" />
            </linearGradient>

            <linearGradient id="antennaGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A3FF85" />
              <stop offset="100%" stopColor="#18B8C4" />
            </linearGradient>

            {/* Eye Glow Filter */}
            <filter id="eyeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="bodyShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#0F8F9C" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Floating Propulsion Ring / Pedestal Aura */}
          <ellipse 
            cx="140" 
            cy="265" 
            rx={mood === 'happy' ? "55" : "45"} 
            ry="9" 
            fill="url(#signaturePrism)" 
            opacity={mood === 'happy' ? "0.6" : "0.35"} 
            filter="url(#eyeGlow)"
            className="transition-all duration-500"
          />

          {/* Left & Right Futuristic Float Thrusters */}
          <path 
            d="M 52 170 C 42 170 38 185 45 202 C 49 210 58 214 62 210 Z" 
            fill="#0E232E" 
            stroke="url(#signaturePrism)" 
            strokeWidth="1.5" 
          />
          <circle cx="53" cy="198" r="3" fill="#7CFF6A" filter="url(#eyeGlow)" />

          <path 
            d="M 228 170 C 238 170 242 185 235 202 C 231 210 222 214 218 210 Z" 
            fill="#0E232E" 
            stroke="url(#signaturePrism)" 
            strokeWidth="1.5" 
          />
          <circle cx="227" cy="198" r="3" fill="#7CFF6A" filter="url(#eyeGlow)" />

          {/* Top Sensor Antenna */}
          <line x1="140" y1="42" x2="140" y2="18" stroke="#18B8C4" strokeWidth="3" strokeLinecap="round" />
          <circle 
            cx="140" 
            cy="14" 
            r={mood === 'happy' ? "7" : "5.5"} 
            fill="url(#antennaGlow)" 
            filter="url(#eyeGlow)"
            className="transition-all duration-300"
          />

          {/* Robot Main Head Chassis */}
          <rect 
            x="58" 
            y="42" 
            width="164" 
            height="182" 
            rx="52" 
            fill="url(#bodyGrad)" 
            stroke="rgba(255, 255, 255, 0.12)" 
            strokeWidth="1.5"
            filter="url(#bodyShadow)"
          />

          {/* Top Head Highlight Trim */}
          <path 
            d="M 90 44 Q 140 40 190 44" 
            stroke="url(#signaturePrism)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            opacity="0.8" 
          />

          {/* Curved Glass Visor Screen */}
          <rect 
            x="76" 
            y="68" 
            width="128" 
            height="98" 
            rx="32" 
            fill="url(#visorGlass)" 
            stroke="rgba(24, 184, 196, 0.3)" 
            strokeWidth="1.5" 
          />

          {/* Visor Glare Reflection */}
          <path 
            d="M 88 78 Q 140 70 192 78 Q 180 90 150 86 Q 105 88 88 78 Z" 
            fill="rgba(255, 255, 255, 0.08)" 
          />

          {/* ================= EYES & EXPRESSIONS ================= */}
          <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`} className="transition-transform duration-100 ease-out">
            {isBlinking ? (
              // Blink State
              <g stroke="#3DD6DE" strokeWidth="3.5" strokeLinecap="round" filter="url(#eyeGlow)">
                <line x1="102" y1="112" x2="124" y2="112" />
                <line x1="156" y1="112" x2="178" y2="112" />
              </g>
            ) : mood === 'happy' ? (
              // Happy Mood: Joyful curved arches + bright mint glow
              <g stroke="#7CFF6A" strokeWidth="4.5" strokeLinecap="round" fill="none" filter="url(#eyeGlow)">
                <path d="M 102 116 Q 113 100 124 116" />
                <path d="M 156 116 Q 167 100 178 116" />
                {/* Cute blushes */}
                <circle cx="96" cy="126" r="4.5" fill="#18B8C4" opacity="0.6" stroke="none" />
                <circle cx="184" cy="126" r="4.5" fill="#18B8C4" opacity="0.6" stroke="none" />
              </g>
            ) : mood === 'sad' ? (
              // Sad / Pout Mood: Drooped eyes
              <g stroke="#18B8C4" strokeWidth="4" strokeLinecap="round" fill="none" filter="url(#eyeGlow)">
                <path d="M 102 108 Q 113 118 124 108" />
                <path d="M 156 108 Q 167 118 178 108" />
              </g>
            ) : (
              // Idle / Neutral Mood: Expressive cyan ovals with light green pupil glints
              <g filter="url(#eyeGlow)">
                {/* Left Eye */}
                <rect x="103" y="100" width="18" height="24" rx="9" fill="#18B8C4" />
                <circle cx="109" cy="107" r="3.5" fill="#7CFF6A" />

                {/* Right Eye */}
                <rect x="159" y="100" width="18" height="24" rx="9" fill="#18B8C4" />
                <circle cx="165" cy="107" r="3.5" fill="#7CFF6A" />
              </g>
            )}
          </g>

          {/* ================= MOUTH / LOWER VISOR ================= */}
          {mood === 'happy' ? (
            <path 
              d="M 130 144 Q 140 153 150 144" 
              stroke="#7CFF6A" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              fill="none" 
              filter="url(#eyeGlow)" 
            />
          ) : mood === 'sad' ? (
            <path 
              d="M 132 148 Q 140 143 148 148" 
              stroke="#18B8C4" 
              strokeWidth="2" 
              strokeLinecap="round" 
              fill="none" 
              opacity="0.8" 
            />
          ) : (
            <line 
              x1="135" 
              y1="146" 
              x2="145" 
              y2="146" 
              stroke="#18B8C4" 
              strokeWidth="2" 
              strokeLinecap="round" 
              opacity="0.5" 
            />
          )}

          {/* Chest Prism Flow Core Badge */}
          <g transform="translate(140, 194)">
            {/* Micro Prism Triangular Emblem */}
            <polygon 
              points="0,-10 9,6 -9,6" 
              fill="url(#signaturePrism)" 
              opacity="0.9" 
              filter="url(#eyeGlow)"
            />
            <circle cx="0" cy="1" r="2" fill="#050505" />
          </g>

          {/* Lower Chassis Subtle Ventilation Accents */}
          <line x1="105" y1="212" x2="117" y2="212" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="125" y1="212" x2="155" y2="212" stroke="rgba(24,184,196,0.3)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="163" y1="212" x2="175" y2="212" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Interactive Hint Pill */}
      <div className="mt-2 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide text-text-secondary bg-white/[0.03] border border-white/10 group-hover:border-cyan-secondary/40 transition-colors">
          <span className={`w-1.5 h-1.5 rounded-full ${mood === 'happy' ? 'bg-mint-primary animate-ping' : 'bg-cyan-secondary'}`} />
          {mood === 'happy' ? 'AI Assistant: Excited!' : mood === 'sad' ? 'AI Assistant: Looking for you...' : 'Hover or tap me'}
        </span>
      </div>
    </div>
  );
};
