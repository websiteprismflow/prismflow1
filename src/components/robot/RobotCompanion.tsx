import React, { useState, useEffect } from 'react';
import { RobotCanvas } from './RobotCanvas';
import { RobotDialogue } from './RobotDialogue';
import { useRobotScroll } from './useRobotScroll';
import { useRobotCursor } from './useRobotCursor';

export const RobotCompanion: React.FC = () => {
  // 1. Strictly Desktop-Only Guard (Completely disabled & unmounted on mobile/tablet < 1024px)
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Approximate screen position of the 3D robot on desktop (right-center of screen)
  const robotScreenPos = {
    x: typeof window !== 'undefined' ? window.innerWidth * 0.78 : 1200,
    y: typeof window !== 'undefined' ? window.innerHeight * 0.45 : 450,
  };

  const { currentSection } = useRobotScroll();
  const cursor = useRobotCursor(robotScreenPos);

  // Return strictly null on mobile - ZERO canvas, ZERO WebGL, ZERO animation overhead
  if (!isDesktop) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-20 hidden lg:block overflow-hidden">
      {/* 3D WebGL Canvas Layer */}
      <RobotCanvas currentSection={currentSection} cursor={cursor} />

      {/* Floating Storytelling Dialogue */}
      <RobotDialogue
        message={currentSection.message}
        subMessage={currentSection.subMessage}
        mood={currentSection.mood}
        isNear={cursor.isNear}
      />
    </div>
  );
};
