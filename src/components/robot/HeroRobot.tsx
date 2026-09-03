import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Bot, Sparkles } from 'lucide-react';
import { RobotModel, RobotExpression } from './RobotModel';

export const HeroRobot: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<RobotModel | null>(null);

  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });

  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [robotMood, setRobotMood] = useState<RobotExpression>('idle');
  const [isCursorNear, setIsCursorNear] = useState(false);

  // 1. Strictly Desktop-Only Guard
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Greeting Sequence on Home/Hero Entry
  useEffect(() => {
    if (!isDesktop) return;

    // After 800ms: Robot smiles and greets the user
    const greetTimer = setTimeout(() => {
      setRobotMood('greet');
      setShowSpeechBubble(true);
    }, 800);

    // After 6s: Returns to calm idle state while speech bubble remains cleanly
    const idleReturnTimer = setTimeout(() => {
      setRobotMood('idle');
    }, 6500);

    return () => {
      clearTimeout(greetTimer);
      clearTimeout(idleReturnTimer);
    };
  }, [isDesktop]);

  // 3. Three.js High-Contrast Setup & Render Loop
  useEffect(() => {
    if (!isDesktop) return;
    const container = containerRef.current;
    if (!container) return;

    // Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 0.45, 4.4);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Realistic High-Contrast Studio Lighting (Reveals Silver + Deep Navy Armor)
    const ambientLight = new THREE.AmbientLight(0x1a2636, 2.0);
    scene.add(ambientLight);

    // Front Key Light (Crisp White / Silver illumination for face & chest)
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(3, 4, 4.5);
    scene.add(keyLight);

    // Fill Light (Soft Royal Sky Blue from opposite angle)
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    fillLight.position.set(-3.5, -1.5, 3);
    scene.add(fillLight);

    // Sharp Cyan Rim / Edge Light (Creates crisp contrast against dark background)
    const rimLight = new THREE.DirectionalLight(0x00e5ff, 4.2);
    rimLight.position.set(0, 5, -3.5);
    scene.add(rimLight);

    // Construct Silver/Navy Robot Model
    const robot = new RobotModel();
    robot.root.position.set(0, -0.2, 0);
    robot.root.rotation.set(0.04, -0.2, 0);
    scene.add(robot.root);
    robotRef.current = robot;

    // Cursor tracking state
    const cursorState = {
      normX: 0,
      normY: 0,
      isNear: false,
    };

    let leaveTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      cursorState.normX = Math.max(-1, Math.min(1, deltaX / (window.innerWidth * 0.4)));
      cursorState.normY = Math.max(-1, Math.min(1, deltaY / (window.innerHeight * 0.4)));

      if (dist < 280) {
        if (leaveTimeout) {
          clearTimeout(leaveTimeout);
          leaveTimeout = null;
        }
        cursorState.isNear = true;
        setIsCursorNear(true);
      } else {
        if (!leaveTimeout) {
          leaveTimeout = setTimeout(() => {
            cursorState.isNear = false;
            setIsCursorNear(false);
            leaveTimeout = null;
          }, 400);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Render loop
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let isVisible = true;

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

      // Current mood priority: hover smile > active mood
      const activeMood: RobotExpression = cursorState.isNear ? 'smile' : robotMood;
      robot.update(time, delta, activeMood, cursorState);

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
      if (leaveTimeout) clearTimeout(leaveTimeout);
      robot.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDesktop, robotMood]);

  if (!isDesktop) {
    return null;
  }

  return (
    <div className="relative w-full max-w-[460px] xl:max-w-[540px] 2xl:max-w-[580px] h-[520px] xl:h-[580px] flex items-center justify-center select-none pointer-events-none">
      
      {/* Subtle Backlight Atmospheric Glow for the Robot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-gradient-to-tr from-[#0077B6]/20 via-[#18B8C4]/15 to-transparent rounded-full blur-[90px] pointer-events-none -z-10" />

      {/* Floating Greeting Speech Bubble */}
      <div
        className={`absolute top-4 -left-4 xl:-left-8 max-w-[280px] xl:max-w-[320px] transition-all duration-700 transform pointer-events-auto z-20 ${
          showSpeechBubble
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-3 scale-95'
        }`}
      >
        <div className="relative p-4 rounded-2xl bg-[#0B141E]/90 backdrop-blur-xl border border-white/15 shadow-[0_12px_40px_rgba(0,119,182,0.25)] flex items-start gap-3">
          
          {/* Avatar Icon with Pulsing Cyan Beacon */}
          <div className="relative mt-0.5 shrink-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0077B6]/40 to-[#18B8C4]/30 border border-[#3DD6DE]/40 flex items-center justify-center">
              {isCursorNear ? (
                <Sparkles size={14} className="text-[#3DD6DE] animate-pulse" />
              ) : (
                <Bot size={15} className="text-[#38BDF8]" />
              )}
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00E5FF] ring-2 ring-[#0B141E] animate-ping" />
          </div>

          {/* Dialogue Text */}
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3DD6DE]">
                PrismFlow AI
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08] text-slate-300 font-medium">
                {isCursorNear ? 'Happy' : 'Assistant'}
              </span>
            </div>

            <p className="text-sm font-semibold text-[#F5F7FA] leading-snug">
              "Hi, welcome to the PrismFlow World. I'll guide you through this website."
            </p>
          </div>

          {/* Pointing triangle pointer toward the robot */}
          <div className="absolute -bottom-2 right-16 w-4 h-4 bg-[#0B141E] border-b border-r border-white/15 rotate-45" />
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-full pointer-events-auto cursor-pointer"
      />
    </div>
  );
};
