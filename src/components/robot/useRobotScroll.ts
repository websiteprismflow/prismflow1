import { useState, useEffect } from 'react';
import { SectionRobotState } from './types';

const SECTIONS_CONFIG: SectionRobotState[] = [
  {
    id: 'hero',
    mood: 'idle',
    message: 'Meet PrismFlow.',
    subMessage: 'Intelligent Web Systems & AI Agents',
    position: { x: 1.65, y: 0.15, z: 0 },
    rotation: { x: 0.02, y: -0.32, z: 0 },
  },
  {
    id: 'services',
    mood: 'excited',
    message: 'We build intelligent digital systems.',
    subMessage: 'High-performance SaaS, Agents & Automation',
    position: { x: 1.5, y: -0.1, z: 0 },
    rotation: { x: 0.1, y: -0.45, z: 0.05 },
  },
  {
    id: 'work',
    mood: 'curious',
    message: "See what we've built.",
    subMessage: 'Engineered for speed, scale & modern UX',
    position: { x: 1.55, y: 0.05, z: 0 },
    rotation: { x: -0.05, y: -0.35, z: 0 },
  },
  {
    id: 'contact',
    mood: 'confident',
    message: 'Ready to build something intelligent?',
    subMessage: "Let's bring your next system to life",
    position: { x: 1.45, y: 0.2, z: 0 },
    rotation: { x: 0.04, y: -0.25, z: 0 },
  },
];

export const useRobotScroll = () => {
  const [currentSection, setCurrentSection] = useState<SectionRobotState>(SECTIONS_CONFIG[0]);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    const checkActiveSection = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const totalDocHeight = document.documentElement.scrollHeight - windowHeight;

      if (totalDocHeight > 0) {
        setScrollProgress(Math.min(1, Math.max(0, scrollY / totalDocHeight)));
      }

      // Check which section is closest to viewport center
      const viewportMid = scrollY + windowHeight * 0.45;

      for (let i = SECTIONS_CONFIG.length - 1; i >= 0; i--) {
        const config = SECTIONS_CONFIG[i];
        const el = document.getElementById(config.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const elementTop = rect.top + scrollY;

          if (viewportMid >= elementTop - 150) {
            setCurrentSection(config);
            return;
          }
        }
      }

      // Default to Hero
      setCurrentSection(SECTIONS_CONFIG[0]);
    };

    window.addEventListener('scroll', checkActiveSection, { passive: true });
    window.addEventListener('resize', checkActiveSection, { passive: true });
    checkActiveSection();

    return () => {
      window.removeEventListener('scroll', checkActiveSection);
      window.removeEventListener('resize', checkActiveSection);
    };
  }, []);

  return { currentSection, scrollProgress };
};
