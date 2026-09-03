import * as THREE from 'three';

export type RobotExpression = 'idle' | 'greet' | 'smile' | 'curious';

export class RobotModel {
  public root: THREE.Group;
  public headGroup: THREE.Group;
  public bodyGroup: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public chestShield: THREE.Mesh;
  public topCrest: THREE.Mesh;

  private visorCanvas: HTMLCanvasElement;
  private visorCtx: CanvasRenderingContext2D;
  private visorTexture: THREE.CanvasTexture;
  private visorMaterial: THREE.MeshStandardMaterial;

  private currentExpression: RobotExpression = 'smile';
  private blinkProgress: number = 0;
  private isBlinking: boolean = false;
  private nextBlinkTime: number = 2.5;

  private targetHeadRotY: number = 0;
  private targetHeadRotX: number = 0;
  private targetHeadRotZ: number = 0;

  constructor() {
    this.root = new THREE.Group();

    // 1. Dynamic Visor Canvas for Royal Blue Glass Screen + Glowing Cyan Eyes
    this.visorCanvas = document.createElement('canvas');
    this.visorCanvas.width = 512;
    this.visorCanvas.height = 256;
    const ctx = this.visorCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context for robot visor');
    this.visorCtx = ctx;

    this.visorTexture = new THREE.CanvasTexture(this.visorCanvas);
    this.visorTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. High-Quality PBR Materials matching Reference Image Exactly
    // Clean Pure White Ceramic / Matte-Gloss Body
    const whiteBodyMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.28,
      metalness: 0.04,
    });

    // Vibrant Teal / Cyan Accent (Ear Fins & Chest Emblem)
    const tealAccentMat = new THREE.MeshStandardMaterial({
      color: 0x00B8C8,
      roughness: 0.3,
      metalness: 0.05,
    });

    // Dark Navy for Ear Cup Inner Recess & Waist Line
    const darkNavyMat = new THREE.MeshStandardMaterial({
      color: 0x0B1626,
      roughness: 0.45,
      metalness: 0.1,
    });

    // Deep Royal Blue Visor Screen Material with Emissive Glow
    this.visorMaterial = new THREE.MeshStandardMaterial({
      color: 0x09225E,
      roughness: 0.12,
      metalness: 0.12,
      emissive: 0xffffff,
      emissiveMap: this.visorTexture,
      emissiveIntensity: 3.2,
    });

    // Glowing Neon Cyan Trim Material for Visor Border
    const neonCyanBorderMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
    });

    // 3. Head Assembly
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.68, 0);

    // Main Smooth Rounded White Head Sphere
    const headGeo = new THREE.SphereGeometry(0.58, 36, 36);
    headGeo.scale(1.08, 0.98, 1.05);
    const headMesh = new THREE.Mesh(headGeo, whiteBodyMat);
    this.headGroup.add(headMesh);

    // Top Head Fin / Crest (Rounded rectangular block on crown)
    const crestGeo = new THREE.BoxGeometry(0.18, 0.14, 0.34);
    this.topCrest = new THREE.Mesh(crestGeo, whiteBodyMat);
    this.topCrest.position.set(0, 0.56, -0.02);
    this.topCrest.rotation.x = -Math.PI * 0.06;
    this.headGroup.add(this.topCrest);

    // Curved Deep Blue Front Visor Screen
    const visorGeo = new THREE.SphereGeometry(0.49, 36, 20, Math.PI * 0.14, Math.PI * 0.72, Math.PI * 0.22, Math.PI * 0.56);
    visorGeo.scale(1.05, 0.95, 1.08);
    const visorMesh = new THREE.Mesh(visorGeo, this.visorMaterial);
    visorMesh.position.set(0, 0.01, 0.05);
    this.headGroup.add(visorMesh);

    // Subtle Neon Cyan Border Ring around Visor (Matches reference rim glow)
    const borderGeo = new THREE.TorusGeometry(0.46, 0.016, 16, 48, Math.PI * 0.78);
    const borderMesh = new THREE.Mesh(borderGeo, neonCyanBorderMat);
    borderMesh.position.set(0, 0.015, 0.39);
    borderMesh.rotation.x = Math.PI * 0.05;
    this.headGroup.add(borderMesh);

    // Headphone-Style Ear Cups (Left & Right)
    const earGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.14, 32);
    earGeo.rotateZ(Math.PI / 2);

    const leftEar = new THREE.Mesh(earGeo, whiteBodyMat);
    leftEar.position.set(-0.58, 0.04, 0);
    this.headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, whiteBodyMat);
    rightEar.position.set(0.58, 0.04, 0);
    this.headGroup.add(rightEar);

    // Inner Dark Navy Recess on Ear Cups
    const earRecessGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.04, 24);
    earRecessGeo.rotateZ(Math.PI / 2);

    const leftRecess = new THREE.Mesh(earRecessGeo, darkNavyMat);
    leftRecess.position.set(-0.64, 0.04, 0);
    this.headGroup.add(leftRecess);

    const rightRecess = new THREE.Mesh(earRecessGeo, darkNavyMat);
    rightRecess.position.set(0.64, 0.04, 0);
    this.headGroup.add(rightRecess);

    // Upright Teal/Cyan Ear Fins on top of Ear Cups (Signature detail from reference image!)
    const earFinGeo = new THREE.BoxGeometry(0.05, 0.28, 0.16);

    const leftEarFin = new THREE.Mesh(earFinGeo, tealAccentMat);
    leftEarFin.position.set(-0.6, 0.24, 0);
    leftEarFin.rotation.z = -Math.PI * 0.06;
    this.headGroup.add(leftEarFin);

    const rightEarFin = new THREE.Mesh(earFinGeo, tealAccentMat);
    rightEarFin.position.set(0.6, 0.24, 0);
    rightEarFin.rotation.z = Math.PI * 0.06;
    this.headGroup.add(rightEarFin);

    this.root.add(this.headGroup);

    // 4. Floating Chubby Egg-Shaped Body (Smooth rounded lower body from image, no legs)
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.set(0, 0.12, 0);

    // Main Smooth Chubby Body Pod
    const bodyGeo = new THREE.SphereGeometry(0.44, 32, 32);
    bodyGeo.scale(0.96, 1.16, 0.92);
    const bodyMesh = new THREE.Mesh(bodyGeo, whiteBodyMat);
    bodyMesh.position.set(0, 0.12, 0);
    this.bodyGroup.add(bodyMesh);

    // Dark Navy Waist Line (Divider stripe from image)
    const waistGeo = new THREE.TorusGeometry(0.42, 0.012, 16, 36);
    waistGeo.rotateX(Math.PI / 2);
    const waistMesh = new THREE.Mesh(waistGeo, darkNavyMat);
    waistMesh.position.set(0, 0.02, 0);
    this.bodyGroup.add(waistMesh);

    // Teal Chest Shield / Emblem (Signature belly badge from image)
    const shieldGeo = new THREE.CylinderGeometry(0.18, 0.13, 0.22, 24);
    shieldGeo.scale(1.0, 1.0, 0.5);
    this.chestShield = new THREE.Mesh(shieldGeo, tealAccentMat);
    this.chestShield.position.set(0, 0.14, 0.38);
    this.chestShield.rotation.x = Math.PI * 0.12;
    this.bodyGroup.add(this.chestShield);

    this.root.add(this.bodyGroup);

    // 5. Arms Matching Reference Image (Left arm resting, Right arm waving!)
    // Left Arm (Smooth rounded white mitten arm resting downward)
    this.leftArm = new THREE.Group();
    const leftArmGeo = new THREE.CapsuleGeometry(0.09, 0.26, 8, 16);
    const leftArmMesh = new THREE.Mesh(leftArmGeo, whiteBodyMat);
    leftArmMesh.position.set(-0.06, -0.12, 0);
    this.leftArm.add(leftArmMesh);
    this.leftArm.position.set(-0.46, 0.22, 0.04);
    this.leftArm.rotation.set(0.15, 0, 0.42);
    this.root.add(this.leftArm);

    // Right Arm (Waving Arm raised up in cheerful friendly wave!)
    this.rightArm = new THREE.Group();
    const rightArmGeo = new THREE.CapsuleGeometry(0.095, 0.28, 8, 16);
    const rightArmMesh = new THREE.Mesh(rightArmGeo, whiteBodyMat);
    rightArmMesh.position.set(0.08, 0.12, 0);
    this.rightArm.add(rightArmMesh);
    this.rightArm.position.set(0.44, 0.25, 0.06);
    this.rightArm.rotation.set(-0.1, 0, -0.72);
    this.root.add(this.rightArm);

    // Initial Face Render
    this.drawVisorFace(this.currentExpression, 0, 0);
  }

  // Draw Cute Glowing Cyan Arc Eyes Inside Royal Blue Visor
  private drawVisorFace(expression: RobotExpression, pupilX: number, pupilY: number) {
    const ctx = this.visorCtx;
    const w = this.visorCanvas.width;
    const h = this.visorCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Deep Royal Blue Screen Background matching reference image (#0A2464)
    ctx.fillStyle = '#09225E';
    ctx.fillRect(0, 0, w, h);

    // Glowing Aqua / Cyan Eye Stroke
    const eyeColor = '#00F5FF';
    const blueGlow = '#38BDF8';

    ctx.shadowColor = blueGlow;
    ctx.shadowBlur = 28;
    ctx.fillStyle = eyeColor;
    ctx.strokeStyle = eyeColor;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const eyeCenterY = h * 0.48;
    const leftEyeX = w * 0.33;
    const rightEyeX = w * 0.67;
    const blinkScale = 1 - this.blinkProgress;

    ctx.save();
    ctx.translate(0, (1 - blinkScale) * eyeCenterY * 0.35);

    switch (expression) {
      case 'curious': {
        // Curious rounded eyes tracking cursor
        const pX = pupilX * 14;
        const pY = pupilY * 10;
        this.drawRoundEye(ctx, leftEyeX + pX, eyeCenterY + pY, 28, 28 * blinkScale);
        this.drawRoundEye(ctx, rightEyeX + pX, eyeCenterY + pY, 28, 28 * blinkScale);
        break;
      }

      case 'smile':
      case 'greet':
      case 'idle':
      default:
        // Signature Cute Glowing Cyan Crescent Arcs ^ ^ (Exact match to reference image!)
        this.drawSmilingEyeArc(ctx, leftEyeX + pupilX * 6, eyeCenterY + pupilY * 4, blinkScale);
        this.drawSmilingEyeArc(ctx, rightEyeX + pupilX * 6, eyeCenterY + pupilY * 4, blinkScale);
        break;
    }

    ctx.restore();
    this.visorTexture.needsUpdate = true;
  }

  // Draw the iconic happy curved eye arcs from image
  private drawSmilingEyeArc(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    if (scale <= 0.1) return;
    ctx.beginPath();
    ctx.arc(x, y + 8, 30, Math.PI * 1.15, Math.PI * 1.85, false);
    ctx.stroke();
  }

  private drawRoundEye(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radiusX: number,
    radiusY: number
  ) {
    if (radiusY <= 2) {
      ctx.beginPath();
      ctx.moveTo(x - radiusX, y);
      ctx.lineTo(x + radiusX, y);
      ctx.stroke();
      return;
    }
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // White pupil sparkle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + radiusX * 0.3, y - radiusY * 0.3, radiusX * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00F5FF';
  }

  // Master Subtle Frame Update Loop (Floating bobbing, gentle wave, cursor tracking)
  public update(
    time: number,
    delta: number,
    activeExpression: RobotExpression,
    cursor: { normX: number; normY: number; isNear: boolean }
  ) {
    const effectiveExpression: RobotExpression = cursor.isNear ? 'greet' : activeExpression;

    // Periodic natural blinking
    if (!this.isBlinking && time > this.nextBlinkTime) {
      this.isBlinking = true;
      this.blinkProgress = 0;
    }

    if (this.isBlinking) {
      this.blinkProgress += delta * 8.0;
      if (this.blinkProgress >= 1) {
        this.blinkProgress = 0;
        this.isBlinking = false;
        this.nextBlinkTime = time + 3.0 + Math.random() * 3.5;
      }
    }

    // Natural, subtle head turn and inquisitiveness
    if (cursor.isNear) {
      this.targetHeadRotY = cursor.normX * 0.42;
      this.targetHeadRotX = -cursor.normY * 0.22;
      this.targetHeadRotZ = 0.06;
    } else {
      this.targetHeadRotY = cursor.normX * 0.16 + Math.sin(time * 0.6) * 0.04;
      this.targetHeadRotX = -cursor.normY * 0.1 + Math.cos(time * 0.5) * 0.03;
      this.targetHeadRotZ = Math.sin(time * 0.4) * 0.02;
    }

    const lerpFactor = 0.07;
    this.headGroup.rotation.y += (this.targetHeadRotY - this.headGroup.rotation.y) * lerpFactor;
    this.headGroup.rotation.x += (this.targetHeadRotX - this.headGroup.rotation.x) * lerpFactor;
    this.headGroup.rotation.z += (this.targetHeadRotZ - this.headGroup.rotation.z) * lerpFactor;

    // Redraw Visor Face
    this.currentExpression = effectiveExpression;
    this.drawVisorFace(this.currentExpression, cursor.normX, cursor.normY);

    // Smooth floating physics for the cute floating pod
    const floatY = Math.sin(time * 1.6) * 0.032;
    const breatheY = Math.cos(time * 1.2) * 0.012;

    this.headGroup.position.y = 0.68 + floatY * 0.85;
    this.bodyGroup.position.y = 0.12 + floatY * 0.45 + breatheY;

    // Cheerful, gentle arm wave (Right arm waving at visitor, exactly like reference image!)
    const waveSpeed = cursor.isNear ? 4.5 : 2.5;
    const waveAmplitude = cursor.isNear ? 0.12 : 0.06;
    this.rightArm.position.y = 0.25 + floatY * 0.5;
    this.rightArm.rotation.z = -0.72 + Math.sin(time * waveSpeed) * waveAmplitude;

    // Left arm gentle resting sway
    const leftArmSway = Math.sin(time * 1.6) * 0.02;
    this.leftArm.position.y = 0.22 + floatY * 0.45 - leftArmSway;
    this.leftArm.rotation.z = 0.42 + Math.cos(time * 1.4) * 0.015;
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
