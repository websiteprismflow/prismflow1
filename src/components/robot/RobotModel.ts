import * as THREE from 'three';

export class RobotModel {
  public root: THREE.Group;
  public headGroup: THREE.Group;
  public bodyGroup: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public chestShield: THREE.Mesh;
  public topCrest: THREE.Mesh;
  public visorMesh: THREE.Mesh;

  private visorCanvas: HTMLCanvasElement;
  private visorCtx: CanvasRenderingContext2D;
  private visorTexture: THREE.CanvasTexture;
  private visorMaterial: THREE.MeshStandardMaterial;

  private blinkProgress: number = 0;
  private isBlinking: boolean = false;
  private nextBlinkTime: number = 3.0;

  private targetHeadRotY: number = 0;
  private targetHeadRotX: number = 0;
  private targetHeadRotZ: number = 0;

  constructor() {
    this.root = new THREE.Group();

    // 1. Dynamic Visor Canvas for Royal Blue Glass Screen + Glowing Cyan Smiling Eyes
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
      color: 0x0A266E,
      roughness: 0.12,
      metalness: 0.15,
      emissive: 0xffffff,
      emissiveMap: this.visorTexture,
      emissiveIntensity: 3.2,
    });

    // Glowing Neon Cyan Trim Material for Visor Border
    const neonCyanBorderMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
    });

    // 3. Head Assembly (Facing Forward +Z directly toward the camera/visitor)
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.68, 0);

    // Main Smooth Rounded White Head Sphere
    const headGeo = new THREE.SphereGeometry(0.54, 36, 36);
    headGeo.scale(1.06, 0.98, 0.92);
    const headMesh = new THREE.Mesh(headGeo, whiteBodyMat);
    this.headGroup.add(headMesh);

    // Top Head Fin / Crest (Rounded rectangular block on crown)
    const crestGeo = new THREE.BoxGeometry(0.18, 0.13, 0.32);
    this.topCrest = new THREE.Mesh(crestGeo, whiteBodyMat);
    this.topCrest.position.set(0, 0.52, -0.04);
    this.topCrest.rotation.x = -Math.PI * 0.08;
    this.headGroup.add(this.topCrest);

    // Curved Front Deep Blue Visor Face Screen (Facing +Z directly toward the visitor!)
    const visorGeo = new THREE.SphereGeometry(0.46, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
    visorGeo.scale(1.04, 0.82, 0.48);
    visorGeo.rotateX(Math.PI / 2); // Points dome front (+Z) toward camera!

    // Custom Planar UV Mapping so eye expressions render with zero distortion
    visorGeo.computeBoundingBox();
    const box = visorGeo.boundingBox!;
    const pos = visorGeo.attributes.position;
    const uv = visorGeo.attributes.uv;
    const width = box.max.x - box.min.x;
    const height = box.max.y - box.min.y;

    for (let i = 0; i < pos.count; i++) {
      const u = (pos.getX(i) - box.min.x) / width;
      const v = (pos.getY(i) - box.min.y) / height;
      uv.setXY(i, u, v);
    }
    uv.needsUpdate = true;

    this.visorMesh = new THREE.Mesh(visorGeo, this.visorMaterial);
    this.visorMesh.position.set(0, 0.02, 0.22);
    this.headGroup.add(this.visorMesh);

    // Subtle Neon Cyan Border Ring around Visor
    const borderGeo = new THREE.TorusGeometry(0.44, 0.016, 16, 48);
    borderGeo.scale(1.02, 0.8, 1.0);
    const borderMesh = new THREE.Mesh(borderGeo, neonCyanBorderMat);
    borderMesh.position.set(0, 0.02, 0.42);
    this.headGroup.add(borderMesh);

    // Headphone-Style Ear Cups (Left & Right)
    const earGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.14, 32);
    earGeo.rotateZ(Math.PI / 2);

    const leftEar = new THREE.Mesh(earGeo, whiteBodyMat);
    leftEar.position.set(-0.56, 0.04, 0);
    this.headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, whiteBodyMat);
    rightEar.position.set(0.56, 0.04, 0);
    this.headGroup.add(rightEar);

    // Inner Dark Navy Recess on Ear Cups
    const earRecessGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.04, 24);
    earRecessGeo.rotateZ(Math.PI / 2);

    const leftRecess = new THREE.Mesh(earRecessGeo, darkNavyMat);
    leftRecess.position.set(-0.62, 0.04, 0);
    this.headGroup.add(leftRecess);

    const rightRecess = new THREE.Mesh(earRecessGeo, darkNavyMat);
    rightRecess.position.set(0.62, 0.04, 0);
    this.headGroup.add(rightRecess);

    // Upright Teal/Cyan Ear Fins on top of Ear Cups (Signature detail from reference image!)
    const earFinGeo = new THREE.BoxGeometry(0.05, 0.28, 0.16);

    const leftEarFin = new THREE.Mesh(earFinGeo, tealAccentMat);
    leftEarFin.position.set(-0.58, 0.24, 0);
    leftEarFin.rotation.z = -Math.PI * 0.06;
    this.headGroup.add(leftEarFin);

    const rightEarFin = new THREE.Mesh(earFinGeo, tealAccentMat);
    rightEarFin.position.set(0.58, 0.24, 0);
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
    // Left Arm (Smooth rounded white mitten arm resting downward on viewer's left -X)
    this.leftArm = new THREE.Group();
    const leftArmGeo = new THREE.CapsuleGeometry(0.09, 0.26, 8, 16);
    const leftArmMesh = new THREE.Mesh(leftArmGeo, whiteBodyMat);
    leftArmMesh.position.set(-0.06, -0.12, 0);
    this.leftArm.add(leftArmMesh);
    this.leftArm.position.set(-0.46, 0.22, 0.04);
    this.leftArm.rotation.set(0.15, 0, 0.42);
    this.root.add(this.leftArm);

    // Right Arm (Waving Arm raised up in cheerful friendly wave on viewer's right +X)
    this.rightArm = new THREE.Group();
    const rightArmGeo = new THREE.CapsuleGeometry(0.095, 0.28, 8, 16);
    const rightArmMesh = new THREE.Mesh(rightArmGeo, whiteBodyMat);
    rightArmMesh.position.set(0.08, 0.12, 0);
    this.rightArm.add(rightArmMesh);
    this.rightArm.position.set(0.44, 0.25, 0.06);
    this.rightArm.rotation.set(-0.1, 0, -0.72);
    this.root.add(this.rightArm);

    // Initial Face Render (Clean, serene, cute smiling crescent eyes)
    this.drawVisorFace(0, 0);
  }

  // Draw Signature Glowing Cyan Smiling Arc Eyes from Reference Image
  private drawVisorFace(pupilX: number, pupilY: number) {
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
    ctx.shadowBlur = 30;
    ctx.fillStyle = eyeColor;
    ctx.strokeStyle = eyeColor;
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const eyeCenterY = h * 0.48;
    const leftEyeX = w * 0.33;
    const rightEyeX = w * 0.67;
    const blinkScale = 1 - this.blinkProgress;

    ctx.save();
    ctx.translate(0, (1 - blinkScale) * eyeCenterY * 0.35);

    // Iconic Happy Crescent Eyes (^ ^) matching reference image perfectly
    this.drawSmilingEyeArc(ctx, leftEyeX + pupilX * 6, eyeCenterY + pupilY * 4, blinkScale);
    this.drawSmilingEyeArc(ctx, rightEyeX + pupilX * 6, eyeCenterY + pupilY * 4, blinkScale);

    ctx.restore();
    this.visorTexture.needsUpdate = true;
  }

  // Draw the iconic happy curved eye arcs from image
  private drawSmilingEyeArc(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    if (scale <= 0.08) {
      // Clean micro slit on blink
      ctx.beginPath();
      ctx.moveTo(x - 22, y);
      ctx.lineTo(x + 22, y);
      ctx.stroke();
      return;
    }
    ctx.beginPath();
    ctx.arc(x, y + 8, 30, Math.PI * 1.15, Math.PI * 1.85, false);
    ctx.stroke();
  }

  // Master Ultra-Smooth Frame Animation Loop (Silky harmonic physics)
  public update(
    time: number,
    delta: number,
    cursor: { normX: number; normY: number }
  ) {
    // 1. Smooth, Natural Periodic Blinking
    if (!this.isBlinking && time > this.nextBlinkTime) {
      this.isBlinking = true;
      this.blinkProgress = 0;
    }

    if (this.isBlinking) {
      this.blinkProgress += delta * 7.5;
      if (this.blinkProgress >= 1) {
        this.blinkProgress = 0;
        this.isBlinking = false;
        this.nextBlinkTime = time + 3.2 + Math.random() * 3.5;
      }
    }

    // 2. Ultra-Smooth Fluid Cursor Tracking (Gentle, organic follow without jerky jumps)
    this.targetHeadRotY = cursor.normX * 0.38 + Math.sin(time * 0.7) * 0.03;
    this.targetHeadRotX = cursor.normY * 0.2 + Math.cos(time * 0.6) * 0.02;
    this.targetHeadRotZ = cursor.normX * 0.06 + Math.sin(time * 0.5) * 0.015;

    // Smooth exponential damping factor (0.045 for silky fluid motion)
    const lerpFactor = 0.045;
    this.headGroup.rotation.y += (this.targetHeadRotY - this.headGroup.rotation.y) * lerpFactor;
    this.headGroup.rotation.x += (this.targetHeadRotX - this.headGroup.rotation.x) * lerpFactor;
    this.headGroup.rotation.z += (this.targetHeadRotZ - this.headGroup.rotation.z) * lerpFactor;

    // Redraw Visor Face smoothly
    this.drawVisorFace(cursor.normX, cursor.normY);

    // 3. Smooth Harmonic Floating Physics for the Body Pod
    const floatY = Math.sin(time * 1.5) * 0.032;
    const breathe = Math.cos(time * 1.2) * 0.012;
    const bodyTilt = Math.sin(time * 0.8) * 0.015;

    this.headGroup.position.y = 0.68 + floatY * 0.8;
    this.bodyGroup.position.y = 0.12 + floatY * 0.45 + breathe;
    this.bodyGroup.rotation.z = bodyTilt;

    // 4. Silky Smooth Arm Waves
    // Right Arm: Continuous gentle, cheerful wave
    const waveSin = Math.sin(time * 2.2);
    const waveCos = Math.cos(time * 1.8);
    this.rightArm.position.y = 0.25 + floatY * 0.5;
    this.rightArm.rotation.z = -0.72 + waveSin * 0.08;
    this.rightArm.rotation.x = -0.1 + waveCos * 0.04;
    this.rightArm.rotation.y = waveSin * 0.03;

    // Left Arm: Gentle resting floating sway
    const leftArmSway = Math.sin(time * 1.5) * 0.02;
    this.leftArm.position.y = 0.22 + floatY * 0.45 - leftArmSway;
    this.leftArm.rotation.z = 0.42 + Math.cos(time * 1.3) * 0.02;
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
