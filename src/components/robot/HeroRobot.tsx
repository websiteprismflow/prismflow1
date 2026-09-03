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

    // After 700ms: Robot smiles and friendly compact greeting bubble appears
    const greetTimer = setTimeout(() => {
      setRobotMood('greet');
      setShowSpeechBubble(true);
    }, 700);

    // After 7s: Returns to calm idle state while speech bubble remains cleanly
    const idleReturnTimer = setTimeout(() => {
      setRobotMood('idle');
    }, 7000);

    return () => {
      clearTimeout(greetTimer);
      clearTimeout(idleReturnTimer);
    };
  }, [isDesktop]);

  // 3. Three.js Compact, Cute Setup & Render Loop
  useEffect(() => {
    if (!isDesktop) return;
    const container = containerRef.current;
    if (!container) return;

    // Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    // Adjusted camera distance for a cute, compact supporting character
    camera.position.set(0, 0.42, 3.8);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Soft, Realistic Studio Lighting (Bright, approachable & clearly visible)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e3a8a, 2.6);
    scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(0x22354c, 1.8);
    scene.add(ambientLight);

    // Front Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.6);
    keyLight.position.set(2.5, 3.8, 4.0);
    scene.add(keyLight);

    // Soft Sky Blue Fill Light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
    fillLight.position.set(-3.0, -0.5, 3.0);
    scene.add(fillLight);

    // Soft Cyan Rim Light (Accentuates the cute rounded silhouette against dark background)
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 3.8);
    rimLight.position.set(0, 4.0, -3.0);
    scene.add(rimLight);

    // Construct Cute Mini Robot Model
    const robot = new RobotModel();
    // Compact scale for an adorable companion occupying ~18% of Hero space
    robot.root.scale.set(0.88, 0.88, 0.88);
    robot.root.position.set(0, -0.22, 0);
    robot.root.rotation.set(0.04, -0.15, 0);
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

      cursorState.normX = Math.max(-1, Math.min(1, deltaX / (window.innerWidth * 0.35)));
      cursorState.normY = Math.max(-1, Math.min(1, deltaY / (window.innerHeight * 0.35)));

      if (dist < 240) {
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
          }, 350);
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
    <div className="relative w-full max-w-[290px] lg:max-w-[330px] xl:max-w-[360px] h-[390px] xl:h-[430px] flex flex-col items-center justify-end select-none pointer-events-none box-border">
      
      {/* Subtle Backlight Atmospheric Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-gradient-to-tr from-[#0077B6]/20 via-[#18B8C4]/15 to-transparent rounded-full blur-[70px] pointer-events-none -z-10" />

      {/* Small, Cute, Elegant Floating Speech Bubble */}
      <div
        className={`absolute top-2 left-1/2 -translate-x-1/2 w-[90%] max-w-[290px] transition-all duration-600 transform pointer-events-auto z-30 box-border ${
          showSpeechBubble
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-3 scale-95'
        }`}
      >
        <div className="relative px-3.5 py-3 rounded-2xl bg-[#0A131F]/90 backdrop-blur-xl border border-white/15 shadow-[0_12px_36px_rgba(0,119,182,0.25)] flex items-start gap-2.5 box-border">
          
          {/* Cute Mini Avatar Icon */}
          <div className="relative mt-0.5 shrink-0 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0077B6]/40 to-[#18B8C4]/30 border border-[#3DD6DE]/40 flex items-center justify-center">
              {isCursorNear ? (
                <Sparkles size={13} className="text-[#3DD6DE] animate-pulse" />
              ) : (
                <Bot size={14} className="text-[#38BDF8]" />
              )}
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00E5FF] ring-2 ring-[#0A131F] animate-ping" />
          </div>

          {/* Dialogue Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3DD6DE]">
                PrismFlow AI
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/[0.08] text-slate-300 font-medium">
                {isCursorNear ? 'Happy' : 'Guide'}
              </span>
            </div>

            <p className="text-xs font-medium text-[#F0F5FA] leading-snug break-words whitespace-normal">
              "Hi! Welcome to the PrismFlow World. I'll guide you through this website."
            </p>
          </div>

          {/* Cute Little Downward Pointer Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0A131F] border-b border-r border-white/15 rotate-45" />
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-full pointer-events-auto cursor-pointer flex items-center justify-center"
      />
    </div>
  );
};
