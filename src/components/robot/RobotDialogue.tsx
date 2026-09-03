import React, { useState, useEffect } from 'react';
import { Sparkles, Bot } from 'lucide-react';
import { RobotMood } from './types';

interface RobotDialogueProps {
  message: string;
  subMessage?: string;
  mood: RobotMood;
  isNear: boolean;
}

export const RobotDialogue: React.FC<RobotDialogueProps> = ({
  message,
  subMessage,
  mood,
  isNear,
}) => {
  const [displayedMessage, setDisplayedMessage] = useState(message);
  const [displayedSub, setDisplayedSub] = useState(subMessage);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setDisplayedMessage(isNear ? 'Hey there! Nice to meet you.' : message);
      setDisplayedSub(isNear ? 'Exploring PrismFlow together' : subMessage);
      setIsVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [message, subMessage, isNear]);

  return (
    <div
      className={`absolute top-28 right-16 xl:right-28 2xl:right-36 max-w-xs transition-all duration-500 transform pointer-events-auto select-none ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
      }`}
    >
      <div className="relative p-4 rounded-2xl bg-[#0B1116]/85 backdrop-blur-xl border border-white/12 shadow-[0_8px_32px_rgba(0,119,182,0.15)] flex items-start gap-3">
        {/* Glow indicator orb */}
        <div className="relative mt-0.5 shrink-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-primary/30 to-mint-primary/20 border border-cyan-highlight/30 flex items-center justify-center">
            {isNear ? (
              <Sparkles size={14} className="text-cyan-highlight animate-bounce" />
            ) : (
              <Bot size={15} className="text-mint-secondary" />
            )}
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-highlight ring-2 ring-[#0B1116] animate-pulse" />
        </div>

        {/* Message Content */}
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-highlight">
              PrismFlow AI
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] text-text-muted capitalize">
              {isNear ? 'happy' : mood}
            </span>
          </div>

          <p className="text-sm font-semibold text-text-primary leading-snug">
            {displayedMessage}
          </p>

          {displayedSub && (
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              {displayedSub}
            </p>
          )}
        </div>

        {/* Subtle decorative bottom arrow pointing toward robot */}
        <div className="absolute -bottom-2 right-12 w-4 h-4 bg-[#0B1116] border-b border-r border-white/12 rotate-45" />
      </div>
    </div>
  );
};
