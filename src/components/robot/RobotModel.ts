import * as THREE from 'three';

export type RobotExpression = 'idle' | 'greet' | 'smile' | 'curious';

export class RobotModel {
  public root: THREE.Group;
  public headGroup: THREE.Group;
  public torsoGroup: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public chestCore: THREE.Mesh;
  public antennaTip: THREE.Mesh;

  private visorCanvas: HTMLCanvasElement;
  private visorCtx: CanvasRenderingContext2D;
  private visorTexture: THREE.CanvasTexture;
  private visorMaterial: THREE.MeshStandardMaterial;

  private currentExpression: RobotExpression = 'idle';
  private blinkProgress: number = 0;
  private isBlinking: boolean = false;
  private nextBlinkTime: number = 2.0;

  private targetHeadRotY: number = 0;
  private targetHeadRotX: number = 0;

  constructor() {
    this.root = new THREE.Group();

    // 1. Dynamic High-Contrast Digital Visor Canvas (512x256)
    this.visorCanvas = document.createElement('canvas');
    this.visorCanvas.width = 512;
    this.visorCanvas.height = 256;
    const ctx = this.visorCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context for robot visor');
    this.visorCtx = ctx;

    this.visorTexture = new THREE.CanvasTexture(this.visorCanvas);
    this.visorTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. High-Contrast Premium Color Palette (Silver/Light Gray + Deep Navy)
    // Silver / Light Metallic Gray Armor Plates
    const silverArmorMat = new THREE.MeshStandardMaterial({
      color: 0xDAE3ED, // Bright premium silver / light gray
      metalness: 0.65,
      roughness: 0.2,
    });

    // Deep Navy / Dark Blue Accent Panels
    const deepNavyMat = new THREE.MeshStandardMaterial({
      color: 0x0A223E, // Deep rich navy blue
      metalness: 0.45,
      roughness: 0.3,
    });

    // Medium Technical Slate Gray for Joints & Trim
    const slateTrimMat = new THREE.MeshStandardMaterial({
      color: 0x73879C,
      metalness: 0.55,
      roughness: 0.35,
    });

    // Vivid Glowing Cyan / Blue Accents
    const brightCyanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
    });

    const softBlueGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
    });

    // Glass Visor with High-Contrast Emissive Display
    this.visorMaterial = new THREE.MeshStandardMaterial({
      color: 0x030810,
      roughness: 0.08,
      metalness: 0.2,
      emissive: 0xffffff,
      emissiveMap: this.visorTexture,
      emissiveIntensity: 2.5,
    });

    // 3. Head Assembly
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.96, 0);

    // Main Helmet Dome (Bright Silver Armor)
    const helmetGeo = new THREE.SphereGeometry(0.56, 32, 32);
    helmetGeo.scale(1.0, 0.94, 1.05);
    const helmetMesh = new THREE.Mesh(helmetGeo, silverArmorMat);
    this.headGroup.add(helmetMesh);

    // Deep Navy Rear Cowl / Trim
    const rearCowlGeo = new THREE.SphereGeometry(0.57, 32, 16, Math.PI * 0.7, Math.PI * 0.6, 0, Math.PI * 0.8);
    const rearCowlMesh = new THREE.Mesh(rearCowlGeo, deepNavyMat);
    rearCowlMesh.position.set(0, 0.02, -0.05);
    this.headGroup.add(rearCowlMesh);

    // Front Visor Screen
    const visorGeo = new THREE.SphereGeometry(0.49, 32, 16, Math.PI * 0.15, Math.PI * 0.7, Math.PI * 0.25, Math.PI * 0.5);
    visorGeo.scale(1.02, 0.92, 1.08);
    const visorMesh = new THREE.Mesh(visorGeo, this.visorMaterial);
    visorMesh.position.set(0, 0.02, 0.04);
    this.headGroup.add(visorMesh);

    // Visor Outer Metallic Bezel Ring (Deep Navy + Silver Trim)
    const bezelGeo = new THREE.TorusGeometry(0.46, 0.028, 16, 48, Math.PI * 0.8);
    const bezelMesh = new THREE.Mesh(bezelGeo, deepNavyMat);
    bezelMesh.position.set(0, 0.02, 0.38);
    bezelMesh.rotation.x = Math.PI * 0.05;
    this.headGroup.add(bezelMesh);

    // Crown Antenna Fin (Silver Base + Navy Trim)
    const antennaBaseGeo = new THREE.BoxGeometry(0.05, 0.2, 0.3);
    const antennaBaseMesh = new THREE.Mesh(antennaBaseGeo, silverArmorMat);
    antennaBaseMesh.position.set(0, 0.56, -0.05);
    antennaBaseMesh.rotation.x = -Math.PI * 0.1;
    this.headGroup.add(antennaBaseMesh);

    // Glowing Antenna Crystal Tip
    const crystalGeo = new THREE.OctahedronGeometry(0.065, 0);
    this.antennaTip = new THREE.Mesh(crystalGeo, brightCyanGlowMat);
    this.antennaTip.position.set(0, 0.72, -0.11);
    this.headGroup.add(this.antennaTip);

    // Side Ear Audio-Sensory Pods (Silver Outer + Navy Core)
    const earGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 24);
    earGeo.rotateZ(Math.PI / 2);

    const leftEar = new THREE.Mesh(earGeo, silverArmorMat);
    leftEar.position.set(-0.55, 0, 0);
    this.headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, silverArmorMat);
    rightEar.position.set(0.55, 0, 0);
    this.headGroup.add(rightEar);

    // Ear Blue Glow Rings
    const earRingGeo = new THREE.TorusGeometry(0.095, 0.018, 12, 24);
    earRingGeo.rotateY(Math.PI / 2);

    const leftRing = new THREE.Mesh(earRingGeo, softBlueGlowMat);
    leftRing.position.set(-0.62, 0, 0);
    this.headGroup.add(leftRing);

    const rightRing = new THREE.Mesh(earRingGeo, softBlueGlowMat);
    rightRing.position.set(0.62, 0, 0);
    this.headGroup.add(rightRing);

    this.root.add(this.headGroup);

    // 4. Floating Torso Assembly (Silver Armor Chest + Deep Navy Core)
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.set(0, 0.15, 0);

    // Segmented Neck Collar (Deep Navy)
    const collarGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.15, 24);
    const collarMesh = new THREE.Mesh(collarGeo, deepNavyMat);
    collarMesh.position.set(0, 0.65, 0);
    this.torsoGroup.add(collarMesh);

    // Main Chest Armor Plate (Bright Silver)
    const chestGeo = new THREE.CylinderGeometry(0.44, 0.3, 0.68, 24);
    chestGeo.scale(1.0, 1.0, 0.76);
    const chestMesh = new THREE.Mesh(chestGeo, silverArmorMat);
    chestMesh.position.set(0, 0.3, 0);
    this.torsoGroup.add(chestMesh);

    // Deep Navy Inset Breastplate Panel
    const chestPlateGeo = new THREE.BoxGeometry(0.4, 0.36, 0.12);
    const chestPlateMesh = new THREE.Mesh(chestPlateGeo, deepNavyMat);
    chestPlateMesh.position.set(0, 0.35, 0.24);
    this.torsoGroup.add(chestPlateMesh);

    // Chest Glowing Arc Core (Cyan/Blue Reactor)
    const coreOuterGeo = new THREE.TorusGeometry(0.12, 0.022, 16, 32);
    const coreOuterMesh = new THREE.Mesh(coreOuterGeo, silverArmorMat);
    coreOuterMesh.position.set(0, 0.35, 0.31);
    this.torsoGroup.add(coreOuterMesh);

    const coreInnerGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 24);
    coreInnerGeo.rotateX(Math.PI / 2);
    this.chestCore = new THREE.Mesh(coreInnerGeo, brightCyanGlowMat);
    this.chestCore.position.set(0, 0.35, 0.31);
    this.torsoGroup.add(this.chestCore);

    // Lower Levitator Thruster Ring (Silver + Blue Glow)
    const levitatorGeo = new THREE.TorusGeometry(0.24, 0.03, 16, 32);
    levitatorGeo.rotateX(Math.PI / 2);
    const levitatorMesh = new THREE.Mesh(levitatorGeo, slateTrimMat);
    levitatorMesh.position.set(0, -0.06, 0);
    this.torsoGroup.add(levitatorMesh);

    const levitatorGlowGeo = new THREE.RingGeometry(0.14, 0.24, 24);
    levitatorGlowGeo.rotateX(Math.PI / 2);
    const levitatorGlowMesh = new THREE.Mesh(levitatorGlowGeo, softBlueGlowMat);
    levitatorGlowMesh.position.set(0, -0.07, 0);
    this.torsoGroup.add(levitatorGlowMesh);

    this.root.add(this.torsoGroup);

    // 5. Floating Arms / Hands (Left & Right)
    this.leftArm = this.createArm(true, silverArmorMat, deepNavyMat, brightCyanGlowMat);
    this.leftArm.position.set(-0.72, 0.32, 0.08);
    this.root.add(this.leftArm);

    this.rightArm = this.createArm(false, silverArmorMat, deepNavyMat, brightCyanGlowMat);
    this.rightArm.position.set(0.72, 0.32, 0.08);
    this.root.add(this.rightArm);

    // Initial Face Render
    this.drawVisorFace('idle', 0, 0);
  }

  private createArm(
    isLeft: boolean,
    silverMat: THREE.Material,
    navyMat: THREE.Material,
    glowMat: THREE.Material
  ): THREE.Group {
    const armGroup = new THREE.Group();

    // Floating Shoulder Pauldron (Bright Silver Armor)
    const pauldronGeo = new THREE.SphereGeometry(0.16, 16, 16);
    pauldronGeo.scale(1.1, 0.8, 1.0);
    const pauldronMesh = new THREE.Mesh(pauldronGeo, silverMat);
    pauldronMesh.position.set(isLeft ? 0.04 : -0.04, 0.12, 0);
    armGroup.add(pauldronMesh);

    // Forearm Shell (Deep Navy with Silver Cap)
    const forearmGeo = new THREE.CapsuleGeometry(0.08, 0.18, 8, 16);
    forearmGeo.rotateZ(isLeft ? Math.PI * 0.1 : -Math.PI * 0.1);
    const forearmMesh = new THREE.Mesh(forearmGeo, navyMat);
    armGroup.add(forearmMesh);

    // Forearm Silver Stripe
    const bandGeo = new THREE.TorusGeometry(0.085, 0.015, 12, 24);
    bandGeo.rotateX(Math.PI / 2);
    const bandMesh = new THREE.Mesh(bandGeo, silverMat);
    bandMesh.position.set(0, 0.02, 0);
    armGroup.add(bandMesh);

    // Hand Emitter Core (Glowing Cyan)
    const palmGeo = new THREE.RingGeometry(0.025, 0.055, 16);
    palmGeo.rotateY(isLeft ? -Math.PI * 0.4 : Math.PI * 0.4);
    const palmGlow = new THREE.Mesh(palmGeo, glowMat);
    palmGlow.position.set(isLeft ? 0.05 : -0.05, -0.1, 0.05);
    armGroup.add(palmGlow);

    return armGroup;
  }

  // Draw 2D Digital Visor Expressions
  private drawVisorFace(expression: RobotExpression, pupilX: number, pupilY: number) {
    const ctx = this.visorCtx;
    const w = this.visorCanvas.width;
    const h = this.visorCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Deep dark background for rich contrast
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, w, h);

    // Bright cyan glow
    const cyanLight = '#00E5FF';
    const blueGlow = '#38BDF8';

    ctx.shadowColor = blueGlow;
    ctx.shadowBlur = 24;
    ctx.fillStyle = cyanLight;
    ctx.strokeStyle = cyanLight;
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const eyeCenterY = h * 0.48;
    const leftEyeX = w * 0.34;
    const rightEyeX = w * 0.66;
    const blinkScale = 1 - this.blinkProgress;

    ctx.save();
    ctx.translate(0, (1 - blinkScale) * eyeCenterY * 0.3);

    switch (expression) {
      case 'smile':
      case 'greet':
        // Warm smiling eyes ^ ^ and cheerful mouth
        this.drawSmilingEye(ctx, leftEyeX, eyeCenterY, blinkScale);
        this.drawSmilingEye(ctx, rightEyeX, eyeCenterY, blinkScale);

        if (blinkScale > 0.3) {
          ctx.beginPath();
          ctx.arc(w * 0.5, eyeCenterY + 40, 30, Math.PI * 0.15, Math.PI * 0.85, false);
          ctx.stroke();
        }
        break;

      case 'curious': {
        // Focused circular optics tracking cursor offset
        const pOffsetX = pupilX * 18;
        const pOffsetY = pupilY * 14;

        this.drawCuriousEye(ctx, leftEyeX, eyeCenterY, pOffsetX, pOffsetY, blinkScale);
        this.drawCuriousEye(ctx, rightEyeX, eyeCenterY, pOffsetX, pOffsetY, blinkScale);

        if (blinkScale > 0.4) {
          ctx.beginPath();
          ctx.arc(w * 0.5 + pOffsetX * 0.4, eyeCenterY + 44, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'idle':
      default:
        // Calm horizontal rounded visor eyes
        this.drawPillEye(ctx, leftEyeX + pupilX * 8, eyeCenterY + pupilY * 6, 50, 20 * blinkScale);
        this.drawPillEye(ctx, rightEyeX + pupilX * 8, eyeCenterY + pupilY * 6, 50, 20 * blinkScale);
        break;
    }

    ctx.restore();
    this.visorTexture.needsUpdate = true;
  }

  private drawSmilingEye(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    if (scale <= 0.1) return;
    ctx.beginPath();
    ctx.arc(x, y + 10, 26, Math.PI * 1.15, Math.PI * 1.85, false);
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
    ctx.beginPath();
    ctx.ellipse(x, y, 26, 26 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + pX, y + pY * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPillEye(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    if (height <= 2) {
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

  // Update Animation Loop
  public update(
    time: number,
    delta: number,
    activeExpression: RobotExpression,
    cursor: { normX: number; normY: number; isNear: boolean }
  ) {
    const effectiveExpression: RobotExpression = cursor.isNear ? 'smile' : activeExpression;

    // Natural periodic blinking
    if (!this.isBlinking && time > this.nextBlinkTime) {
      this.isBlinking = true;
      this.blinkProgress = 0;
    }

    if (this.isBlinking) {
      this.blinkProgress += delta * 7.5;
      if (this.blinkProgress >= 1) {
        this.blinkProgress = 0;
        this.isBlinking = false;
        this.nextBlinkTime = time + 3.0 + Math.random() * 3.5;
      }
    }

    // Head tracking toward cursor
    if (cursor.isNear) {
      this.targetHeadRotY = cursor.normX * 0.6;
      this.targetHeadRotX = -cursor.normY * 0.4;
    } else {
      this.targetHeadRotY = cursor.normX * 0.3 + Math.sin(time * 0.7) * 0.08;
      this.targetHeadRotX = -cursor.normY * 0.2 + Math.cos(time * 0.6) * 0.05;
    }

    const lerpFactor = 0.08;
    this.headGroup.rotation.y += (this.targetHeadRotY - this.headGroup.rotation.y) * lerpFactor;
    this.headGroup.rotation.x += (this.targetHeadRotX - this.headGroup.rotation.x) * lerpFactor;

    // Draw face
    this.currentExpression = effectiveExpression;
    this.drawVisorFace(this.currentExpression, cursor.normX, cursor.normY);

    // Floating idle physics
    const floatY = Math.sin(time * 1.8) * 0.06;
    const breatheY = Math.cos(time * 1.4) * 0.018;

    this.headGroup.position.y = 0.96 + floatY * 0.75;
    this.torsoGroup.position.y = 0.15 + floatY * 0.35 + breatheY;

    // Floating arms physics
    const armWave = Math.sin(time * 2.2) * 0.04;
    this.leftArm.position.y = 0.32 + floatY * 0.4 - armWave;
    this.rightArm.position.y = 0.32 + floatY * 0.4 + armWave;

    if (effectiveExpression === 'smile' || effectiveExpression === 'greet') {
      // Cheerful subtle greeting hand posture
      this.rightArm.position.y += 0.08;
      this.rightArm.rotation.z = -0.22 + Math.sin(time * 3.5) * 0.04;
    } else {
      this.rightArm.rotation.z = -0.06;
    }

    // Emissive Pulsing Core
    const pulse = 1.8 + Math.sin(time * 3.2) * 0.4;
    this.visorMaterial.emissiveIntensity = pulse;
    (this.chestCore.material as THREE.MeshBasicMaterial).color.setRGB(
      0.0,
      0.7 * pulse,
      0.9 * pulse
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
