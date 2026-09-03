import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { RobotModel } from './RobotModel';

export const HeroRobot: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<RobotModel | null>(null);

  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });

  // 1. Strictly Desktop-Only Guard
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Three.js Setup & Ultra-Smooth Render Loop
  useEffect(() => {
    if (!isDesktop) return;
    const container = containerRef.current;
    if (!container) return;

    // Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      34,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    // Camera framing matched to reference image (front-facing, clear view of cute chibi character)
    camera.position.set(0, 0.42, 3.4);

    // High-Quality WebGL Renderer (100% transparent, zero background)
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

    // Crisp Front Key Light (Highlights glossy white helmet & royal blue visor)
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(2.0, 3.8, 4.0);
    scene.add(keyLight);

    // Soft Cyan Fill Light
    const fillLight = new THREE.DirectionalLight(0x06b6d4, 2.6);
    fillLight.position.set(-3.2, -0.5, 3.2);
    scene.add(fillLight);

    // Sky Blue Rim Light (Outlines the white rounded silhouette)
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
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      cursorState.normX = Math.max(-1, Math.min(1, deltaX / (window.innerWidth * 0.4)));
      cursorState.normY = Math.max(-1, Math.min(1, deltaY / (window.innerHeight * 0.4)));
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
    <div className="relative w-full max-w-[290px] lg:max-w-[320px] xl:max-w-[350px] h-[380px] xl:h-[420px] flex flex-col items-center justify-center select-none pointer-events-none box-border">
      
      {/* Subtle Backlight Atmospheric Glow for Depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-gradient-to-tr from-[#0077B6]/20 via-[#18B8C4]/15 to-transparent rounded-full blur-[70px] pointer-events-none -z-10" />

      {/* 3D WebGL Canvas Viewport (Zero speech bubble, zero guide tags, 100% smooth 3D character) */}
      <div
        ref={containerRef}
        className="w-full h-full pointer-events-auto cursor-default flex items-center justify-center"
      />
    </div>
  );
};
