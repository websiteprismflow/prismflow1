import * as THREE from 'three';
import { RobotMood } from './types';

export class RobotModel {
  public root: THREE.Group;
  public headGroup: THREE.Group;
  public torsoGroup: THREE.Group;
  public leftHand: THREE.Group;
  public rightHand: THREE.Group;
  public chestCore: THREE.Mesh;
  public antennaTip: THREE.Mesh;

  private visorCanvas: HTMLCanvasElement;
  private visorCtx: CanvasRenderingContext2D;
  private visorTexture: THREE.CanvasTexture;
  private visorMaterial: THREE.MeshStandardMaterial;

  private currentMood: RobotMood = 'idle';
  private blinkProgress: number = 0;
  private isBlinking: boolean = false;
  private nextBlinkTime: number = 2.5;

  private targetHeadRotY: number = 0;
  private targetHeadRotX: number = 0;

  constructor() {
    this.root = new THREE.Group();

    // 1. Create Dynamic Digital Visor Texture
    this.visorCanvas = document.createElement('canvas');
    this.visorCanvas.width = 512;
    this.visorCanvas.height = 256;
    const ctx = this.visorCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context for robot visor');
    this.visorCtx = ctx;

    this.visorTexture = new THREE.CanvasTexture(this.visorCanvas);
    this.visorTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. High-end PBR Materials
    const obsidianShellMat = new THREE.MeshPhysicalMaterial({
      color: 0x0B1116,
      metalness: 0.35,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
    });

    const darkTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0x16202A,
      metalness: 0.8,
      roughness: 0.3,
    });

    const neonCyanMat = new THREE.MeshBasicMaterial({
      color: 0x3DD6DE,
    });

    const glowMintMat = new THREE.MeshBasicMaterial({
      color: 0x18B8C4,
    });

    this.visorMaterial = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.1,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveMap: this.visorTexture,
      emissiveIntensity: 2.2,
    });

    // 3. Head Assembly
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.95, 0);

    // Main Helmet Shell (Curved aerodynamic sphere)
    const helmetGeo = new THREE.SphereGeometry(0.55, 32, 32);
    helmetGeo.scale(1.0, 0.95, 1.05);
    const helmetMesh = new THREE.Mesh(helmetGeo, obsidianShellMat);
    this.headGroup.add(helmetMesh);

    // Front Visor Screen (Embedded convex curved glass)
    const visorGeo = new THREE.SphereGeometry(0.48, 32, 16, Math.PI * 0.15, Math.PI * 0.7, Math.PI * 0.25, Math.PI * 0.5);
    visorGeo.scale(1.02, 0.92, 1.08);
    const visorMesh = new THREE.Mesh(visorGeo, this.visorMaterial);
    visorMesh.position.set(0, 0.02, 0.04);
    this.headGroup.add(visorMesh);

    // Visor Outer Metallic Bezel Ring
    const bezelGeo = new THREE.TorusGeometry(0.45, 0.025, 16, 48, Math.PI * 0.8);
    const bezelMesh = new THREE.Mesh(bezelGeo, darkTitaniumMat);
    bezelMesh.position.set(0, 0.02, 0.38);
    bezelMesh.rotation.x = Math.PI * 0.05;
    this.headGroup.add(bezelMesh);

    // Crown Antenna Fin
    const antennaBaseGeo = new THREE.BoxGeometry(0.04, 0.18, 0.28);
    const antennaBaseMesh = new THREE.Mesh(antennaBaseGeo, darkTitaniumMat);
    antennaBaseMesh.position.set(0, 0.56, -0.05);
    antennaBaseMesh.rotation.x = -Math.PI * 0.1;
    this.headGroup.add(antennaBaseMesh);

    // Glowing Antenna Crystal Tip
    const crystalGeo = new THREE.OctahedronGeometry(0.06, 0);
    this.antennaTip = new THREE.Mesh(crystalGeo, neonCyanMat);
    this.antennaTip.position.set(0, 0.7, -0.1);
    this.headGroup.add(this.antennaTip);

    // Side Ear Audio-Sensory Pods (Left & Right)
    const earGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 24);
    earGeo.rotateZ(Math.PI / 2);

    const leftEar = new THREE.Mesh(earGeo, darkTitaniumMat);
    leftEar.position.set(-0.55, 0, 0);
    this.headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, darkTitaniumMat);
    rightEar.position.set(0.55, 0, 0);
    this.headGroup.add(rightEar);

    // Ear Glowing Rings
    const earRingGeo = new THREE.TorusGeometry(0.09, 0.015, 12, 24);
    earRingGeo.rotateY(Math.PI / 2);

    const leftRing = new THREE.Mesh(earRingGeo, glowMintMat);
    leftRing.position.set(-0.61, 0, 0);
    this.headGroup.add(leftRing);

    const rightRing = new THREE.Mesh(earRingGeo, glowMintMat);
    rightRing.position.set(0.61, 0, 0);
    this.headGroup.add(rightRing);

    this.root.add(this.headGroup);

    // 4. Floating Torso Assembly
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.set(0, 0.15, 0);

    // Segmented Neck Collar
    const collarGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.14, 24);
    const collarMesh = new THREE.Mesh(collarGeo, darkTitaniumMat);
    collarMesh.position.set(0, 0.65, 0);
    this.torsoGroup.add(collarMesh);

    // Chest Chassis
    const chestGeo = new THREE.CylinderGeometry(0.42, 0.28, 0.65, 24);
    chestGeo.scale(1.0, 1.0, 0.75);
    const chestMesh = new THREE.Mesh(chestGeo, obsidianShellMat);
    chestMesh.position.set(0, 0.3, 0);
    this.torsoGroup.add(chestMesh);

    // Chest Glowing Arc Reactor Core (PrismFlow Logo Symbolism)
    const coreOuterGeo = new THREE.TorusGeometry(0.12, 0.02, 16, 32);
    const coreOuterMesh = new THREE.Mesh(coreOuterGeo, darkTitaniumMat);
    coreOuterMesh.position.set(0, 0.35, 0.28);
    this.torsoGroup.add(coreOuterMesh);

    const coreInnerGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 24);
    coreInnerGeo.rotateX(Math.PI / 2);
    this.chestCore = new THREE.Mesh(coreInnerGeo, neonCyanMat);
    this.chestCore.position.set(0, 0.35, 0.28);
    this.torsoGroup.add(this.chestCore);

    // Lower Levitator Ring
    const levitatorGeo = new THREE.TorusGeometry(0.22, 0.025, 16, 32);
    levitatorGeo.rotateX(Math.PI / 2);
    const levitatorMesh = new THREE.Mesh(levitatorGeo, glowMintMat);
    levitatorMesh.position.set(0, -0.05, 0);
    this.torsoGroup.add(levitatorMesh);

    this.root.add(this.torsoGroup);

    // 5. Floating Magnetic Hands (Left & Right)
    this.leftHand = this.createFloatingHand(true, obsidianShellMat, darkTitaniumMat, glowMintMat);
    this.leftHand.position.set(-0.68, 0.3, 0.1);
    this.root.add(this.leftHand);

    this.rightHand = this.createFloatingHand(false, obsidianShellMat, darkTitaniumMat, glowMintMat);
    this.rightHand.position.set(0.68, 0.3, 0.1);
    this.root.add(this.rightHand);

    // Initial face render
    this.drawVisorFace(this.currentMood, 0, 0);
  }

  private createFloatingHand(
    isLeft: boolean,
    shellMat: THREE.Material,
    accentMat: THREE.Material,
    glowMat: THREE.Material
  ): THREE.Group {
    const hand = new THREE.Group();

    // Palm / Floating Pod
    const palmGeo = new THREE.CapsuleGeometry(0.07, 0.12, 8, 16);
    palmGeo.rotateZ(isLeft ? Math.PI * 0.1 : -Math.PI * 0.1);
    const palmMesh = new THREE.Mesh(palmGeo, shellMat);
    hand.add(palmMesh);

    // Magnetic Emitter Core
    const palmRingGeo = new THREE.RingGeometry(0.02, 0.05, 16);
    palmRingGeo.rotateY(isLeft ? -Math.PI * 0.4 : Math.PI * 0.4);
    const palmGlow = new THREE.Mesh(palmRingGeo, glowMat);
    palmGlow.position.set(isLeft ? 0.04 : -0.04, 0, 0.05);
    hand.add(palmGlow);

    // Stylized floating index & thumb segments
    const fingerGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.08, 12);
    fingerGeo.rotateZ(isLeft ? Math.PI * 0.15 : -Math.PI * 0.15);
    const fingerMesh = new THREE.Mesh(fingerGeo, accentMat);
    fingerMesh.position.set(isLeft ? 0.05 : -0.05, -0.08, 0.02);
    hand.add(fingerMesh);

    return hand;
  }

  // Draw 2D Digital Visor Expressions
  private drawVisorFace(mood: RobotMood, pupilX: number, pupilY: number) {
    const ctx = this.visorCtx;
    const w = this.visorCanvas.width;
    const h = this.visorCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background is transparent/deep dark
    ctx.fillStyle = '#020406';
    ctx.fillRect(0, 0, w, h);

    // Cyan Neon glow parameters
    const eyeCyan = '#3DD6DE';
    const mintGlow = '#18B8C4';

    ctx.shadowColor = mintGlow;
    ctx.shadowBlur = 18;
    ctx.fillStyle = eyeCyan;
    ctx.strokeStyle = eyeCyan;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const eyeCenterY = h * 0.48;
    const leftEyeX = w * 0.34;
    const rightEyeX = w * 0.66;

    const blinkScale = 1 - this.blinkProgress;

    ctx.save();
    ctx.translate(0, (1 - blinkScale) * eyeCenterY * 0.3);

    switch (mood) {
      case 'happy':
        // Happy upward curved eyes ^ ^ and subtle warm smile
        this.drawHappyEye(ctx, leftEyeX, eyeCenterY, blinkScale);
        this.drawHappyEye(ctx, rightEyeX, eyeCenterY, blinkScale);

        // Smile curve
        if (blinkScale > 0.4) {
          ctx.beginPath();
          ctx.arc(w * 0.5, eyeCenterY + 42, 28, Math.PI * 0.15, Math.PI * 0.85, false);
          ctx.stroke();
        }
        break;

      case 'curious': {
        // Focused circular optics tracking cursor offset
        const pOffsetX = pupilX * 18;
        const pOffsetY = pupilY * 14;

        this.drawCuriousEye(ctx, leftEyeX, eyeCenterY, pOffsetX, pOffsetY, blinkScale);
        this.drawCuriousEye(ctx, rightEyeX, eyeCenterY, pOffsetX, pOffsetY, blinkScale);

        // Small curious mouth dot
        if (blinkScale > 0.5) {
          ctx.beginPath();
          ctx.arc(w * 0.5 + pOffsetX * 0.4, eyeCenterY + 45, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'excited':
        // Energetic glowing eyes with upward angle
        this.drawExcitedEye(ctx, leftEyeX, eyeCenterY, true, blinkScale);
        this.drawExcitedEye(ctx, rightEyeX, eyeCenterY, false, blinkScale);

        // Vibrant smile
        ctx.beginPath();
        ctx.arc(w * 0.5, eyeCenterY + 38, 34, Math.PI * 0.1, Math.PI * 0.9, false);
        ctx.stroke();
        break;

      case 'thinking': {
        // Asymmetric thoughtful eyes (one raised, one concentrated)
        this.drawPillEye(ctx, leftEyeX, eyeCenterY - 10, 48, 22 * blinkScale);
        this.drawPillEye(ctx, rightEyeX, eyeCenterY + 5, 42, 14 * blinkScale);

        // Soft processing wave dots
        ctx.fillStyle = mintGlow;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.arc(w * 0.5 + i * 16, eyeCenterY + 45, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'confident':
        // Sleek angled high-tech visor slits
        this.drawConfidentEye(ctx, leftEyeX, eyeCenterY, true, blinkScale);
        this.drawConfidentEye(ctx, rightEyeX, eyeCenterY, false, blinkScale);

        // Confident horizontal subtle smile
        ctx.beginPath();
        ctx.moveTo(w * 0.44, eyeCenterY + 44);
        ctx.lineTo(w * 0.56, eyeCenterY + 44);
        ctx.stroke();
        break;

      case 'idle':
      default:
        // Calm horizontal rounded visor pill eyes
        this.drawPillEye(ctx, leftEyeX + pupilX * 10, eyeCenterY + pupilY * 8, 48, 20 * blinkScale);
        this.drawPillEye(ctx, rightEyeX + pupilX * 10, eyeCenterY + pupilY * 8, 48, 20 * blinkScale);
        break;
    }

    ctx.restore();

    this.visorTexture.needsUpdate = true;
  }

  private drawHappyEye(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    if (scale <= 0.1) return;
    ctx.beginPath();
    ctx.arc(x, y + 10, 24, Math.PI * 1.15, Math.PI * 1.85, false);
    ctx.stroke();
  }

  private drawCuriousEye(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pX: number,
    pY: number,
    scale: number
  ) {
    if (scale <= 0.1) return;
    // Outer optical ring
    ctx.beginPath();
    ctx.ellipse(x, y, 26, 26 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner pupil
    ctx.beginPath();
    ctx.arc(x + pX, y + pY * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawExcitedEye(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isLeft: boolean,
    scale: number
  ) {
    if (scale <= 0.1) return;
    ctx.beginPath();
    ctx.ellipse(x, y, 28, 28 * scale, isLeft ? -0.1 : 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight sparkle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + (isLeft ? -6 : 6), y - 6 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3DD6DE';
  }

  private drawConfidentEye(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isLeft: boolean,
    scale: number
  ) {
    if (scale <= 0.1) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(isLeft ? 0.15 : -0.15);
    ctx.beginPath();
    ctx.roundRect(-24, -9 * scale, 48, 18 * scale, 8);
    ctx.fill();
    ctx.restore();
  }

  private drawPillEye(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    if (height <= 2) {
      // Flat closed blink slit
      ctx.beginPath();
      ctx.moveTo(x - width / 2, y);
      ctx.lineTo(x + width / 2, y);
      ctx.stroke();
      return;
    }
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - height / 2, width, height, height / 2);
    ctx.fill();
  }

  // Master Frame Update Loop
  public update(
    time: number,
    delta: number,
    activeMood: RobotMood,
    cursor: { normX: number; normY: number; isNear: boolean; distance: number }
  ) {
    // If user cursor is close (< 280px), automatically trigger 'happy' smile reaction!
    const effectiveMood: RobotMood = cursor.isNear ? 'happy' : activeMood;

    // Periodic natural blinking
    if (!this.isBlinking && time > this.nextBlinkTime) {
      this.isBlinking = true;
      this.blinkProgress = 0;
    }

    if (this.isBlinking) {
      this.blinkProgress += delta * 7.5; // Quick natural blink (~130ms)
      if (this.blinkProgress >= 1) {
        this.blinkProgress = 0;
        this.isBlinking = false;
        this.nextBlinkTime = time + 3.0 + Math.random() * 4.0;
      }
    }

    // Smooth head tracking toward cursor
    if (cursor.isNear) {
      this.targetHeadRotY = cursor.normX * 0.65;
      this.targetHeadRotX = -cursor.normY * 0.45;
    } else {
      // Subtle ambient gaze
      this.targetHeadRotY = cursor.normX * 0.35 + Math.sin(time * 0.8) * 0.08;
      this.targetHeadRotX = -cursor.normY * 0.25 + Math.cos(time * 0.6) * 0.05;
    }

    // Damped lerp for silky smooth rotation
    const lerpFactor = 0.08;
    this.headGroup.rotation.y += (this.targetHeadRotY - this.headGroup.rotation.y) * lerpFactor;
    this.headGroup.rotation.x += (this.targetHeadRotX - this.headGroup.rotation.x) * lerpFactor;

    // Subtle gentle head tilt depending on mood
    const targetTiltZ = effectiveMood === 'curious' ? 0.12 : 0;
    this.headGroup.rotation.z += (targetTiltZ - this.headGroup.rotation.z) * lerpFactor;

    // Redraw face if mood changed or during blink / pupil tracking
    this.currentMood = effectiveMood;
    this.drawVisorFace(this.currentMood, cursor.normX, cursor.normY);

    // Floating idle bobbing & breathing
    const floatY = Math.sin(time * 1.8) * 0.06;
    const breatheY = Math.cos(time * 1.4) * 0.015;

    this.headGroup.position.y = 0.95 + floatY * 0.8;
    this.torsoGroup.position.y = 0.15 + floatY * 0.4 + breatheY;

    // Floating hands counter-movement & subtle gestures
    const handWave = Math.sin(time * 2.2) * 0.04;
    this.leftHand.position.y = 0.3 + floatY * 0.5 - handWave;
    this.rightHand.position.y = 0.3 + floatY * 0.5 + handWave;

    if (effectiveMood === 'happy' || effectiveMood === 'excited') {
      // Cheerful subtle hand lift
      this.rightHand.position.y += 0.08;
      this.rightHand.rotation.z = -0.2 + Math.sin(time * 4.0) * 0.05;
    } else {
      this.rightHand.rotation.z = -0.05;
    }

    // Antenna & Chest Core Pulsing Light
    const pulse = 1.6 + Math.sin(time * 3.5) * 0.5;
    this.visorMaterial.emissiveIntensity = pulse;
    (this.chestCore.material as THREE.MeshBasicMaterial).color.setRGB(
      0.06 * pulse,
      0.65 * pulse,
      0.75 * pulse
    );
  }

  public dispose() {
    this.visorTexture.dispose();
    this.root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }
}
