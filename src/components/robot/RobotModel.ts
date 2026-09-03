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

    // 1. Dynamic Digital Visor Canvas (512x256)
    this.visorCanvas = document.createElement('canvas');
    this.visorCanvas.width = 512;
    this.visorCanvas.height = 256;
    const ctx = this.visorCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context for robot visor');
    this.visorCtx = ctx;

    this.visorTexture = new THREE.CanvasTexture(this.visorCanvas);
    this.visorTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. High-Visibility PBR Materials (Low metalness = High Diffuse Luma on Black Backgrounds)
    // Primary Body: Bright Luminous Silver / Crisp Light Gray (0xEBF2FA)
    const silverArmorMat = new THREE.MeshStandardMaterial({
      color: 0xEEF4FA, // Bright luminous silver
      metalness: 0.12, // Low metalness ensures it catches light rather than reflecting black!
      roughness: 0.22,
    });

    // Secondary Accent: Deep Rich Navy Blue (0x123154)
    const deepNavyMat = new THREE.MeshStandardMaterial({
      color: 0x133458, // Deep navy blue with clean diffuse tone
      metalness: 0.15,
      roughness: 0.32,
    });

    // Technical Trim: Brushed Steel / Slate Gray (0x96A9BD)
    const slateTrimMat = new THREE.MeshStandardMaterial({
      color: 0x94A7BA,
      metalness: 0.25,
      roughness: 0.28,
    });

    // Emissive Cyan & Sky Blue Neon Accents
    const brightCyanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
    });

    const softBlueGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
    });

    // Visor Face Screen (High Contrast Glass with Vivid Emissive Display)
    this.visorMaterial = new THREE.MeshStandardMaterial({
      color: 0x060E1A,
      roughness: 0.1,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveMap: this.visorTexture,
      emissiveIntensity: 3.2,
    });

    // 3. Head Assembly
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.98, 0);

    // Main Helmet Shell (Bright Silver Armor Dome)
    const helmetGeo = new THREE.SphereGeometry(0.58, 32, 32);
    helmetGeo.scale(1.0, 0.94, 1.05);
    const helmetMesh = new THREE.Mesh(helmetGeo, silverArmorMat);
    this.headGroup.add(helmetMesh);

    // Deep Navy Rear Cowl & Crown Lining
    const rearCowlGeo = new THREE.SphereGeometry(0.59, 32, 16, Math.PI * 0.7, Math.PI * 0.6, 0, Math.PI * 0.8);
    const rearCowlMesh = new THREE.Mesh(rearCowlGeo, deepNavyMat);
    rearCowlMesh.position.set(0, 0.02, -0.05);
    this.headGroup.add(rearCowlMesh);

    // Front Visor Screen
    const visorGeo = new THREE.SphereGeometry(0.51, 32, 16, Math.PI * 0.15, Math.PI * 0.7, Math.PI * 0.25, Math.PI * 0.5);
    visorGeo.scale(1.02, 0.92, 1.08);
    const visorMesh = new THREE.Mesh(visorGeo, this.visorMaterial);
    visorMesh.position.set(0, 0.02, 0.04);
    this.headGroup.add(visorMesh);

    // Visor Outer Bezel Ring (Deep Navy Frame with Silver Chamfer)
    const bezelGeo = new THREE.TorusGeometry(0.48, 0.032, 16, 48, Math.PI * 0.8);
    const bezelMesh = new THREE.Mesh(bezelGeo, deepNavyMat);
    bezelMesh.position.set(0, 0.02, 0.4);
    bezelMesh.rotation.x = Math.PI * 0.05;
    this.headGroup.add(bezelMesh);

    // Crown Antenna Fin (Silver Body + Navy Core)
    const antennaBaseGeo = new THREE.BoxGeometry(0.06, 0.22, 0.32);
    const antennaBaseMesh = new THREE.Mesh(antennaBaseGeo, silverArmorMat);
    antennaBaseMesh.position.set(0, 0.58, -0.05);
    antennaBaseMesh.rotation.x = -Math.PI * 0.1;
    this.headGroup.add(antennaBaseMesh);

    // Glowing Antenna Crystal Tip
    const crystalGeo = new THREE.OctahedronGeometry(0.075, 0);
    this.antennaTip = new THREE.Mesh(crystalGeo, brightCyanGlowMat);
    this.antennaTip.position.set(0, 0.76, -0.12);
    this.headGroup.add(this.antennaTip);

    // Side Ear Audio-Sensory Pods (Silver Outer + Navy Rim)
    const earGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.13, 24);
    earGeo.rotateZ(Math.PI / 2);

    const leftEar = new THREE.Mesh(earGeo, silverArmorMat);
    leftEar.position.set(-0.58, 0, 0);
    this.headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, silverArmorMat);
    rightEar.position.set(0.58, 0, 0);
    this.headGroup.add(rightEar);

    // Ear Blue Glow Rings
    const earRingGeo = new THREE.TorusGeometry(0.1, 0.02, 12, 24);
    earRingGeo.rotateY(Math.PI / 2);

    const leftRing = new THREE.Mesh(earRingGeo, softBlueGlowMat);
    leftRing.position.set(-0.65, 0, 0);
    this.headGroup.add(leftRing);

    const rightRing = new THREE.Mesh(earRingGeo, softBlueGlowMat);
    rightRing.position.set(0.65, 0, 0);
    this.headGroup.add(rightRing);

    this.root.add(this.headGroup);

    // 4. Floating Torso Assembly (Silver Armor Chest + Deep Navy Insets)
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.set(0, 0.15, 0);

    // Segmented Neck Collar (Deep Navy)
    const collarGeo = new THREE.CylinderGeometry(0.26, 0.32, 0.16, 24);
    const collarMesh = new THREE.Mesh(collarGeo, deepNavyMat);
    collarMesh.position.set(0, 0.66, 0);
    this.torsoGroup.add(collarMesh);

    // Main Chest Armor Shell (Bright Silver)
    const chestGeo = new THREE.CylinderGeometry(0.46, 0.32, 0.72, 24);
    chestGeo.scale(1.0, 1.0, 0.78);
    const chestMesh = new THREE.Mesh(chestGeo, silverArmorMat);
    chestMesh.position.set(0, 0.3, 0);
    this.torsoGroup.add(chestMesh);

    // Deep Navy Inset Breastplate Panel
    const chestPlateGeo = new THREE.BoxGeometry(0.42, 0.38, 0.14);
    const chestPlateMesh = new THREE.Mesh(chestPlateGeo, deepNavyMat);
    chestPlateMesh.position.set(0, 0.35, 0.25);
    this.torsoGroup.add(chestPlateMesh);

    // Chest Glowing Arc Reactor Core (Glowing Cyan with Silver Bezel)
    const coreOuterGeo = new THREE.TorusGeometry(0.13, 0.024, 16, 32);
    const coreOuterMesh = new THREE.Mesh(coreOuterGeo, silverArmorMat);
    coreOuterMesh.position.set(0, 0.35, 0.33);
    this.torsoGroup.add(coreOuterMesh);

    const coreInnerGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 24);
    coreInnerGeo.rotateX(Math.PI / 2);
    this.chestCore = new THREE.Mesh(coreInnerGeo, brightCyanGlowMat);
    this.chestCore.position.set(0, 0.35, 0.33);
    this.torsoGroup.add(this.chestCore);

    // Lower Levitator Thruster Ring (Silver + Blue Glow)
    const levitatorGeo = new THREE.TorusGeometry(0.26, 0.032, 16, 32);
    levitatorGeo.rotateX(Math.PI / 2);
    const levitatorMesh = new THREE.Mesh(levitatorGeo, slateTrimMat);
    levitatorMesh.position.set(0, -0.07, 0);
    this.torsoGroup.add(levitatorMesh);

    const levitatorGlowGeo = new THREE.RingGeometry(0.15, 0.26, 24);
    levitatorGlowGeo.rotateX(Math.PI / 2);
    const levitatorGlowMesh = new THREE.Mesh(levitatorGlowGeo, softBlueGlowMat);
    levitatorGlowMesh.position.set(0, -0.08, 0);
    this.torsoGroup.add(levitatorGlowMesh);

    this.root.add(this.torsoGroup);

    // 5. Floating Arms / Hands (Left & Right)
    this.leftArm = this.createArm(true, silverArmorMat, deepNavyMat, brightCyanGlowMat);
    this.leftArm.position.set(-0.76, 0.32, 0.08);
    this.root.add(this.leftArm);

    this.rightArm = this.createArm(false, silverArmorMat, deepNavyMat, brightCyanGlowMat);
    this.rightArm.position.set(0.76, 0.32, 0.08);
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
    const pauldronGeo = new THREE.SphereGeometry(0.18, 16, 16);
    pauldronGeo.scale(1.15, 0.85, 1.05);
    const pauldronMesh = new THREE.Mesh(pauldronGeo, silverMat);
    pauldronMesh.position.set(isLeft ? 0.04 : -0.04, 0.14, 0);
    armGroup.add(pauldronMesh);

    // Forearm Shell (Deep Navy with Silver Cap)
    const forearmGeo = new THREE.CapsuleGeometry(0.09, 0.2, 8, 16);
    forearmGeo.rotateZ(isLeft ? Math.PI * 0.1 : -Math.PI * 0.1);
    const forearmMesh = new THREE.Mesh(forearmGeo, navyMat);
    armGroup.add(forearmMesh);

    // Forearm Silver Stripe
    const bandGeo = new THREE.TorusGeometry(0.095, 0.016, 12, 24);
    bandGeo.rotateX(Math.PI / 2);
    const bandMesh = new THREE.Mesh(bandGeo, silverMat);
    bandMesh.position.set(0, 0.02, 0);
    armGroup.add(bandMesh);

    // Hand Emitter Core (Glowing Cyan)
    const palmGeo = new THREE.RingGeometry(0.028, 0.06, 16);
    palmGeo.rotateY(isLeft ? -Math.PI * 0.4 : Math.PI * 0.4);
    const palmGlow = new THREE.Mesh(palmGeo, glowMat);
    palmGlow.position.set(isLeft ? 0.05 : -0.05, -0.11, 0.05);
    armGroup.add(palmGlow);

    return armGroup;
  }

  // Draw 2D Digital Visor Expressions
  private drawVisorFace(expression: RobotExpression, pupilX: number, pupilY: number) {
    const ctx = this.visorCtx;
    const w = this.visorCanvas.width;
    const h = this.visorCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Deep dark contrast background
    ctx.fillStyle = '#050D18';
    ctx.fillRect(0, 0, w, h);

    // Vivid Cyan & Sky Blue Glow
    const cyanLight = '#00F0FF';
    const blueGlow = '#38BDF8';

    ctx.shadowColor = blueGlow;
    ctx.shadowBlur = 30;
    ctx.fillStyle = cyanLight;
    ctx.strokeStyle = cyanLight;
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const eyeCenterY = h * 0.48;
    const leftEyeX = w * 0.33;
    const rightEyeX = w * 0.67;
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
          ctx.arc(w * 0.5, eyeCenterY + 42, 34, Math.PI * 0.15, Math.PI * 0.85, false);
          ctx.stroke();
        }
        break;

      case 'curious': {
        const pOffsetX = pupilX * 18;
        const pOffsetY = pupilY * 14;

        this.drawCuriousEye(ctx, leftEyeX, eyeCenterY, pOffsetX, pOffsetY, blinkScale);
        this.drawCuriousEye(ctx, rightEyeX, eyeCenterY, pOffsetX, pOffsetY, blinkScale);

        if (blinkScale > 0.4) {
          ctx.beginPath();
          ctx.arc(w * 0.5 + pOffsetX * 0.4, eyeCenterY + 44, 7, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'idle':
      default:
        // Calm horizontal rounded visor eyes
        this.drawPillEye(ctx, leftEyeX + pupilX * 8, eyeCenterY + pupilY * 6, 54, 22 * blinkScale);
        this.drawPillEye(ctx, rightEyeX + pupilX * 8, eyeCenterY + pupilY * 6, 54, 22 * blinkScale);
        break;
    }

    ctx.restore();
    this.visorTexture.needsUpdate = true;
  }

  private drawSmilingEye(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    if (scale <= 0.1) return;
    ctx.beginPath();
    ctx.arc(x, y + 10, 28, Math.PI * 1.15, Math.PI * 1.85, false);
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
    ctx.ellipse(x, y, 28, 28 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + pX, y + pY * scale, 11 * scale, 0, Math.PI * 2);
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

  // Master Animation Update Loop
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
      this.targetHeadRotY = cursor.normX * 0.55;
      this.targetHeadRotX = -cursor.normY * 0.35;
    } else {
      this.targetHeadRotY = cursor.normX * 0.25 + Math.sin(time * 0.7) * 0.06;
      this.targetHeadRotX = -cursor.normY * 0.18 + Math.cos(time * 0.6) * 0.04;
    }

    const lerpFactor = 0.08;
    this.headGroup.rotation.y += (this.targetHeadRotY - this.headGroup.rotation.y) * lerpFactor;
    this.headGroup.rotation.x += (this.targetHeadRotX - this.headGroup.rotation.x) * lerpFactor;

    // Draw face
    this.currentExpression = effectiveExpression;
    this.drawVisorFace(this.currentExpression, cursor.normX, cursor.normY);

    // Floating idle physics
    const floatY = Math.sin(time * 1.8) * 0.05;
    const breatheY = Math.cos(time * 1.4) * 0.015;

    this.headGroup.position.y = 0.98 + floatY * 0.75;
    this.torsoGroup.position.y = 0.15 + floatY * 0.35 + breatheY;

    // Floating arms physics
    const armWave = Math.sin(time * 2.2) * 0.035;
    this.leftArm.position.y = 0.32 + floatY * 0.4 - armWave;
    this.rightArm.position.y = 0.32 + floatY * 0.4 + armWave;

    if (effectiveExpression === 'smile' || effectiveExpression === 'greet') {
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
      0.8 * pulse,
      1.0 * pulse
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
