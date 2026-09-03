import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { RobotModel } from './RobotModel';
import { SectionRobotState } from './types';

interface RobotCanvasProps {
  currentSection: SectionRobotState;
  cursor: {
    normX: number;
    normY: number;
    isNear: boolean;
    distance: number;
  };
}

export const RobotCanvas: React.FC<RobotCanvasProps> = ({
  currentSection,
  cursor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<RobotModel | null>(null);
  const targetPosRef = useRef(currentSection.position);
  const targetRotRef = useRef(currentSection.rotation);
  const moodRef = useRef(currentSection.mood);

  useEffect(() => {
    targetPosRef.current = currentSection.position;
    targetRotRef.current = currentSection.rotation;
    moodRef.current = currentSection.mood;
  }, [currentSection]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 0.4, 5.2);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Studio PBR Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x091420, 1.6);
    scene.add(ambientLight);

    // Key Light (Cold Cyan)
    const keyLight = new THREE.DirectionalLight(0x3dd6de, 2.8);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    // Fill Light (Deep Mint Blue)
    const fillLight = new THREE.DirectionalLight(0x0077b6, 2.2);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    // Sharp Rim Light (Atmospheric SaaS Edge Glow)
    const rimLight = new THREE.DirectionalLight(0x18b8c4, 3.5);
    rimLight.position.set(0, 6, -4);
    scene.add(rimLight);

    // 4. Construct Robot Model
    const robot = new RobotModel();
    robot.root.position.set(
      targetPosRef.current.x,
      targetPosRef.current.y,
      targetPosRef.current.z
    );
    robot.root.rotation.set(
      targetRotRef.current.x,
      targetRotRef.current.y,
      targetRotRef.current.z
    );
    scene.add(robot.root);
    robotRef.current = robot;

    // 5. Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let isVisible = true;

    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        clock.start();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Smooth interpolation toward section coordinates & rotation
      const lerpSpd = 0.05;
      robot.root.position.x += (targetPosRef.current.x - robot.root.position.x) * lerpSpd;
      robot.root.position.y += (targetPosRef.current.y - robot.root.position.y) * lerpSpd;
      robot.root.position.z += (targetPosRef.current.z - robot.root.position.z) * lerpSpd;

      robot.root.rotation.x += (targetRotRef.current.x - robot.root.rotation.x) * lerpSpd;
      robot.root.rotation.y += (targetRotRef.current.y - robot.root.rotation.y) * lerpSpd;
      robot.root.rotation.z += (targetRotRef.current.z - robot.root.rotation.z) * lerpSpd;

      // Update robot internals (facial visor, breathing, floating physics, cursor proximity)
      robot.update(time, delta, moodRef.current, cursor);

      renderer.render(scene, camera);
    };

    render();

    // 6. Resize Observer
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
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
      robot.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full pointer-events-none"
      style={{ overflow: 'hidden' }}
    />
  );
};
