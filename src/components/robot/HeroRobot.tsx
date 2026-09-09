import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { RobotModel } from './RobotModel';

type SectionState = 'hero' | 'services' | 'portfolio' | 'testimonials' | 'contact';

const SECTION_TEXTS: Record<SectionState, string> = {
  hero: 'Hi, welcome to the world of Prism Flow 👋',
  services: 'What we can build for you ✨',
  portfolio: "Things we've brought to life 🚀",
  testimonials: 'What our lovely clients say about us ⭐',
  contact: "Let's build together 🤝",
};

export const HeroRobot: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<RobotModel | null>(null);

  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });

  // Current active section text state
  const [activeText, setActiveText] = useState<SectionState>('hero');
  const [textOpacity, setTextOpacity] = useState(1);

  // 1. Strictly Desktop-Only Guard
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Three.js Setup & Smooth Multi-Section Travel Render Loop
  useEffect(() => {
    if (!isDesktop) return;
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!container || !wrapper) return;

    // Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      34,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 0.42, 3.4);

    // High-Quality WebGL Renderer (100% transparent)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Studio Lighting matching the 3D Reference Image
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x0ea5e9, 2.8);
    scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(0x22354c, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(2.0, 3.8, 4.0);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x06b6d4, 2.6);
    fillLight.position.set(-3.2, -0.5, 3.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 3.6);
    rimLight.position.set(0, 4.2, -3.2);
    scene.add(rimLight);

    // Construct Exact Robot Model matching Reference Image
    const robot = new RobotModel();
    robot.root.scale.set(0.92, 0.92, 0.92);
    robot.root.position.set(0, -0.15, 0);
    robot.root.rotation.set(0.04, -0.12, 0.02);
    scene.add(robot.root);
    robotRef.current = robot;

    // Smooth Cursor Tracking state
    const cursorState = {
      normX: 0,
      normY: 0,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      cursorState.normX = Math.max(-1, Math.min(1, deltaX / (window.innerWidth * 0.4)));
      cursorState.normY = Math.max(-1, Math.min(1, deltaY / (window.innerHeight * 0.4)));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Render loop & Smooth Scroll Positioning across 3 Sections
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let isVisible = true;

    // Smoothed coordinates
    let currentX = -9999;
    let currentY = -9999;
    let currentOpacity = 1;
    let lastSection: SectionState = 'hero';

    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) clock.start();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // 1. Calculate Target Position between Hero -> Services -> Portfolio -> Testimonials -> Contact Anchors
      const heroTarget = document.getElementById('hero-robot-target');
      const servicesTarget = document.getElementById('services-robot-target');
      const portfolioTarget = document.getElementById('portfolio-robot-target');
      const testimonialsTarget = document.getElementById('testimonials-robot-target');
      const contactTarget = document.getElementById('contact-robot-target');

      if (heroTarget && servicesTarget && portfolioTarget) {
        const heroRect = heroTarget.getBoundingClientRect();
        const servicesRect = servicesTarget.getBoundingClientRect();
        const portfolioRect = portfolioTarget.getBoundingClientRect();
        const testimonialsRect = testimonialsTarget?.getBoundingClientRect();
        const contactRect = contactTarget?.getBoundingClientRect();

        const windowH = window.innerHeight;
        const settleY = 160;

        // Transition 1: Hero -> Services
        const startY1 = windowH * 0.85;
        let t1 = (startY1 - servicesRect.top) / (startY1 - settleY);
        t1 = Math.max(0, Math.min(1, t1));
        const smoothT1 = t1 * t1 * (3 - 2 * t1);

        // Transition 2: Services -> Portfolio
        const startY2 = windowH * 0.85;
        let t2 = (startY2 - portfolioRect.top) / (startY2 - settleY);
        t2 = Math.max(0, Math.min(1, t2));
        const smoothT2 = t2 * t2 * (3 - 2 * t2);

        // Transition 3: Portfolio -> Testimonials
        let smoothT3 = 0;
        if (testimonialsRect) {
          const startY3 = windowH * 0.85;
          let t3 = (startY3 - testimonialsRect.top) / (startY3 - settleY);
          t3 = Math.max(0, Math.min(1, t3));
          smoothT3 = t3 * t3 * (3 - 2 * t3);
        }

        // Transition 4: Testimonials -> Contact
        let smoothT4 = 0;
        if (contactRect) {
          const startY4 = windowH * 0.85;
          let t4 = (startY4 - contactRect.top) / (startY4 - settleY);
          t4 = Math.max(0, Math.min(1, t4));
          smoothT4 = t4 * t4 * (3 - 2 * t4);
        }

        let targetX: number;
        let targetY: number;
        let currentSection: SectionState = 'hero';

        if (contactRect && testimonialsRect && smoothT4 > 0) {
          // Between Testimonials (left side) and Contact (right side)
          targetX = testimonialsRect.left + (contactRect.left - testimonialsRect.left) * smoothT4;
          targetY = testimonialsRect.top + (contactRect.top - testimonialsRect.top) * smoothT4;
          currentSection = smoothT4 > 0.5 ? 'contact' : 'testimonials';
        } else if (testimonialsRect && smoothT3 > 0) {
          // Between Portfolio (right side) and Testimonials (left side)
          targetX = portfolioRect.left + (testimonialsRect.left - portfolioRect.left) * smoothT3;
          targetY = portfolioRect.top + (testimonialsRect.top - portfolioRect.top) * smoothT3;
          currentSection = smoothT3 > 0.5 ? 'testimonials' : 'portfolio';
        } else if (t2 > 0) {
          // Between Services and Portfolio
          targetX = servicesRect.left + (portfolioRect.left - servicesRect.left) * smoothT2;
          targetY = servicesRect.top + (portfolioRect.top - servicesRect.top) * smoothT2;
          currentSection = smoothT2 > 0.5 ? 'portfolio' : 'services';
        } else {
          // Between Hero and Services
          targetX = heroRect.left + (servicesRect.left - heroRect.left) * smoothT1;
          targetY = heroRect.top + (servicesRect.top - heroRect.top) * smoothT1;
          currentSection = smoothT1 > 0.5 ? 'services' : 'hero';
        }

        // Smooth base orientation:
        // In Hero (right side), body angles slightly left (-0.12).
        // At Services (left side), body smoothly angles towards right (+0.14).
        // At Portfolio (right side), body angles towards left (-0.12).
        // At Testimonials (left side), body angles towards right (+0.14).
        // At Contact (right side), body returns to facing left (-0.12).
        let baseRotY = -0.12;
        if (smoothT4 > 0) {
          baseRotY = 0.14 + (-0.12 - 0.14) * smoothT4;
        } else if (smoothT3 > 0) {
          baseRotY = -0.12 + (0.14 - (-0.12)) * smoothT3;
        } else if (smoothT2 > 0) {
          baseRotY = 0.14 + (-0.12 - 0.14) * smoothT2;
        } else {
          baseRotY = -0.12 + (0.14 - (-0.12)) * smoothT1;
        }
        robot.root.rotation.y = baseRotY;

        // Opacity: Fades out smoothly when user scrolls past the active section
        let targetOpacity = 1;
        if (contactRect) {
          if (contactRect.bottom < 260) {
            targetOpacity = Math.max(0, Math.min(1, (contactRect.bottom - 40) / 220));
          }
        } else if (testimonialsRect) {
          if (testimonialsRect.bottom < 260) {
            targetOpacity = Math.max(0, Math.min(1, (testimonialsRect.bottom - 40) / 220));
          }
        } else if (portfolioRect.bottom < 320) {
          targetOpacity = Math.max(0, Math.min(1, (portfolioRect.bottom - 40) / 260));
        }

        // Initialize position on first frame without sudden jump
        if (currentX < -5000) {
          currentX = targetX;
          currentY = targetY;
          currentOpacity = targetOpacity;
        } else {
          // Silky smooth lerp (0.13 gives high responsiveness and zero jitter)
          currentX += (targetX - currentX) * 0.13;
          currentY += (targetY - currentY) * 0.13;
          currentOpacity += (targetOpacity - currentOpacity) * 0.1;
        }

        // Apply hardware-accelerated transform
        wrapper.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        wrapper.style.opacity = `${currentOpacity}`;
        wrapper.style.visibility = currentOpacity > 0.01 ? 'visible' : 'hidden';

        // 2. Smooth Text Crossfade between sections
        if (currentSection !== lastSection) {
          lastSection = currentSection;
          setTextOpacity(0);
          setTimeout(() => {
            setActiveText(currentSection);
            setTextOpacity(1);
          }, 200);
        }
      }

      // Update robot with smooth, fluid animations
      robot.update(time, delta, cursorState);

      renderer.render(scene, camera);
    };

    render();

    // Resize listener
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      robot.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDesktop]);

  if (!isDesktop) {
    return null;
  }

  return (
    <div
      ref={wrapperRef}
      className="fixed top-0 left-0 z-30 pointer-events-none will-change-transform"
      style={{ opacity: 0 }}
    >
      <div className="relative w-[300px] lg:w-[330px] xl:w-[360px] h-[380px] xl:h-[420px] flex flex-col items-center justify-center select-none box-border">
        
        {/* Subtle Backlight Atmospheric Glow for Depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-gradient-to-tr from-[#0077B6]/20 via-[#18B8C4]/15 to-transparent rounded-full blur-[70px] pointer-events-none -z-10" />

        {/* Elegant Minimalist Welcome / Section Pill with Smooth Crossfade */}
        <div className="absolute -top-2 lg:-top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none whitespace-nowrap transition-opacity duration-300">
          <div
            style={{ opacity: textOpacity }}
            className="px-4.5 py-2 sm:px-5 sm:py-2 rounded-full bg-[#0A1422]/90 backdrop-blur-md border border-white/20 shadow-[0_8px_28px_rgba(0,180,216,0.25)] flex items-center gap-2.5 transition-all duration-300"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00F0FF]" />
            </span>
            <span className="text-sm lg:text-base xl:text-[17px] font-semibold text-white tracking-tight">
              {SECTION_TEXTS[activeText]}
            </span>
          </div>
        </div>

        {/* 3D WebGL Canvas Viewport */}
        <div
          ref={containerRef}
          className="w-full h-full pointer-events-auto cursor-default flex items-center justify-center"
        />
      </div>
    </div>
  );
};
