import * as THREE from 'three';

export type RobotExpression = 'idle' | 'greet' | 'smile' | 'curious';

export class RobotModel {
  public root: THREE.Group;
  public headGroup: THREE.Group;
  public bodyGroup: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public chestCore: THREE.Mesh;
  public antennaBulb: THREE.Mesh;

  private visorCanvas: HTMLCanvasElement;
  private visorCtx: CanvasRenderingContext2D;
  private visorTexture: THREE.CanvasTexture;
  private visorMaterial: THREE.MeshStandardMaterial;

  private currentExpression: RobotExpression = 'idle';
  private blinkProgress: number = 0;
  private isBlinking: boolean = false;
  private nextBlinkTime: number = 2.5;

  private targetHeadRotY: number = 0;
  private targetHeadRotX: number = 0;
  private targetHeadRotZ: number = 0;

  constructor() {
    this.root = new THREE.Group();

    // 1. Dynamic Visor Canvas (512x256) - Soft, cute, expressive digital eyes
    this.visorCanvas = document.createElement('canvas');
    this.visorCanvas.width = 512;
    this.visorCanvas.height = 256;
    const ctx = this.visorCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context for robot visor');
    this.visorCtx = ctx;

    this.visorTexture = new THREE.CanvasTexture(this.visorCanvas);
    this.visorTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. High-Contrast, Cute & Clean Materials (Pearlescent Silver + Royal Navy + Cyan Glow)
    const pearlescentSilverMat = new THREE.MeshStandardMaterial({
      color: 0xF4F8FC, // Soft, bright, friendly pearlescent silver-white
      metalness: 0.08, // Low metalness keeps it luminous and diffuse, avoiding black reflections
      roughness: 0.22,
    });

    const royalNavyMat = new THREE.MeshStandardMaterial({
      color: 0x112D50, // Deep royal navy blue for clean contrast
      metalness: 0.12,
      roughness: 0.3,
    });

    const softSlateMat = new THREE.MeshStandardMaterial({
      color: 0x8FA4BA,
      metalness: 0.2,
      roughness: 0.35,
    });

    const cyanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
    });

    const softBlueGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
    });

    // Dark glass visor for the face screen
    this.visorMaterial = new THREE.MeshStandardMaterial({
      color: 0x081220,
      roughness: 0.08,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveMap: this.visorTexture,
      emissiveIntensity: 2.8,
    });

    // 3. Head Assembly (Oversized smooth rounded head for natural cuteness)
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.75, 0);

    // Main Head Sphere (Smooth, friendly pebble/egg shape)
    const headGeo = new THREE.SphereGeometry(0.56, 32, 32);
    headGeo.scale(1.1, 0.98, 1.05);
    const headMesh = new THREE.Mesh(headGeo, pearlescentSilverMat);
    this.headGroup.add(headMesh);

    // Deep Navy Back Headcap
    const headcapGeo = new THREE.SphereGeometry(0.57, 32, 16, Math.PI * 0.7, Math.PI * 0.6, 0, Math.PI * 0.85);
    headcapGeo.scale(1.1, 0.98, 1.05);
    const headcapMesh = new THREE.Mesh(headcapGeo, royalNavyMat);
    headcapMesh.position.set(0, 0.02, -0.06);
    this.headGroup.add(headcapMesh);

    // Front Visor Screen (Embedded friendly curved screen)
    const visorGeo = new THREE.SphereGeometry(0.48, 32, 16, Math.PI * 0.15, Math.PI * 0.7, Math.PI * 0.25, Math.PI * 0.5);
    visorGeo.scale(1.05, 0.95, 1.08);
    const visorMesh = new THREE.Mesh(visorGeo, this.visorMaterial);
    visorMesh.position.set(0, 0.02, 0.04);
    this.headGroup.add(visorMesh);

    // Visor Outer Navy Bezel Ring
    const bezelGeo = new THREE.TorusGeometry(0.44, 0.024, 16, 48, Math.PI * 0.8);
    const bezelMesh = new THREE.Mesh(bezelGeo, royalNavyMat);
    bezelMesh.position.set(0, 0.02, 0.38);
    bezelMesh.rotation.x = Math.PI * 0.04;
    this.headGroup.add(bezelMesh);

    // Cute Little Rounded Antenna on Crown
    const antennaStemGeo = new THREE.CylinderGeometry(0.025, 0.035, 0.18, 16);
    const antennaStemMesh = new THREE.Mesh(antennaStemGeo, softSlateMat);
    antennaStemMesh.position.set(0, 0.62, -0.04);
    antennaStemMesh.rotation.x = -Math.PI * 0.08;
    this.headGroup.add(antennaStemMesh);

    // Glowing Soft Cyan Antenna Bulb
    const antennaBulbGeo = new THREE.SphereGeometry(0.06, 16, 16);
    this.antennaBulb = new THREE.Mesh(antennaBulbGeo, cyanGlowMat);
    this.antennaBulb.position.set(0, 0.72, -0.08);
    this.headGroup.add(this.antennaBulb);

    // Cute Circular Ear Pods (Left & Right)
    const earGeo = new THREE.SphereGeometry(0.12, 16, 16);
    earGeo.scale(0.7, 1.0, 1.0);

    const leftEar = new THREE.Mesh(earGeo, pearlescentSilverMat);
    leftEar.position.set(-0.58, 0.02, 0);
    this.headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, pearlescentSilverMat);
    rightEar.position.set(0.58, 0.02, 0);
    this.headGroup.add(rightEar);

    // Soft Glowing Blue Ear Rings
    const earRingGeo = new THREE.TorusGeometry(0.07, 0.015, 12, 24);
    earRingGeo.rotateY(Math.PI / 2);

    const leftRing = new THREE.Mesh(earRingGeo, softBlueGlowMat);
    leftRing.position.set(-0.63, 0.02, 0);
    this.headGroup.add(leftRing);

    const rightRing = new THREE.Mesh(earRingGeo, softBlueGlowMat);
    rightRing.position.set(0.63, 0.02, 0);
    this.headGroup.add(rightRing);

    this.root.add(this.headGroup);

    // 4. Compact, Cute Rounded Body (Smaller than head for adorable chibi proportions)
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.set(0, 0.12, 0);

    // Cute Segmented Neck Ring
    const neckGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.1, 24);
    const neckMesh = new THREE.Mesh(neckGeo, royalNavyMat);
    neckMesh.position.set(0, 0.48, 0);
    this.bodyGroup.add(neckMesh);

    // Compact Chubby Torso (Silver Shell)
    const bodyGeo = new THREE.SphereGeometry(0.38, 28, 28);
    bodyGeo.scale(0.92, 0.88, 0.84);
    const bodyMesh = new THREE.Mesh(bodyGeo, pearlescentSilverMat);
    bodyMesh.position.set(0, 0.2, 0);
    this.bodyGroup.add(bodyMesh);

    // Deep Navy Front Inset Belly Panel
    const bellyGeo = new THREE.SphereGeometry(0.32, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
    bellyGeo.scale(0.85, 0.8, 0.88);
    const bellyMesh = new THREE.Mesh(bellyGeo, royalNavyMat);
    bellyMesh.position.set(0, 0.18, 0.06);
    bellyMesh.rotation.x = Math.PI * 0.45;
    this.bodyGroup.add(bellyMesh);

    // Chest Mini Glowing Arc Reactor / Heart Core (Cyan Glow)
    const coreOuterGeo = new THREE.TorusGeometry(0.08, 0.018, 16, 24);
    const coreOuterMesh = new THREE.Mesh(coreOuterGeo, softSlateMat);
    coreOuterMesh.position.set(0, 0.22, 0.32);
    this.bodyGroup.add(coreOuterMesh);

    const coreInnerGeo = new THREE.SphereGeometry(0.05, 16, 16);
    this.chestCore = new THREE.Mesh(coreInnerGeo, cyanGlowMat);
    this.chestCore.position.set(0, 0.22, 0.32);
    this.bodyGroup.add(this.chestCore);

    // Floating Levitator Thruster Ring Below Body
    const levitatorGeo = new THREE.TorusGeometry(0.18, 0.022, 16, 28);
    levitatorGeo.rotateX(Math.PI / 2);
    const levitatorMesh = new THREE.Mesh(levitatorGeo, royalNavyMat);
    levitatorMesh.position.set(0, -0.12, 0);
    this.bodyGroup.add(levitatorMesh);

    const levitatorGlowGeo = new THREE.RingGeometry(0.08, 0.18, 24);
    levitatorGlowGeo.rotateX(Math.PI / 2);
    const levitatorGlowMesh = new THREE.Mesh(levitatorGlowGeo, softBlueGlowMat);
    levitatorGlowMesh.position.set(0, -0.13, 0);
    this.bodyGroup.add(levitatorGlowMesh);

    this.root.add(this.bodyGroup);

    // 5. Short, Cute Floating Arms (Smooth rounded mitten pods)
    this.leftArm = this.createCuteArm(true, pearlescentSilverMat, royalNavyMat, cyanGlowMat);
    this.leftArm.position.set(-0.52, 0.22, 0.06);
    this.root.add(this.leftArm);

    this.rightArm = this.createCuteArm(false, pearlescentSilverMat, royalNavyMat, cyanGlowMat);
    this.rightArm.position.set(0.52, 0.22, 0.06);
    this.root.add(this.rightArm);

    // Initial Visor Render
    this.drawVisorFace('idle', 0, 0);
  }

  private createCuteArm(
    isLeft: boolean,
    silverMat: THREE.Material,
    navyMat: THREE.Material,
    glowMat: THREE.Material
  ): THREE.Group {
    const arm = new THREE.Group();

    // Cute rounded shoulder node
    const shoulderGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, navyMat);
    arm.add(shoulderMesh);

    // Short rounded forearm pod
    const armGeo = new THREE.CapsuleGeometry(0.075, 0.12, 8, 16);
    armGeo.rotateZ(isLeft ? Math.PI * 0.12 : -Math.PI * 0.12);
    const armMesh = new THREE.Mesh(armGeo, silverMat);
    armMesh.position.set(isLeft ? -0.04 : 0.04, -0.1, 0);
    arm.add(armMesh);

    // Small glowing palm emitter
    const palmGlowGeo = new THREE.SphereGeometry(0.025, 12, 12);
    const palmGlow = new THREE.Mesh(palmGlowGeo, glowMat);
    palmGlow.position.set(isLeft ? -0.04 : 0.04, -0.2, 0.03);
    arm.add(palmGlow);

    return arm;
  }

  // Draw Cute Digital Visor Expressions
  private drawVisorFace(expression: RobotExpression, pupilX: number, pupilY: number) {
    const ctx = this.visorCtx;
    const w = this.visorCanvas.width;
    const h = this.visorCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Clean, deep contrast background
    ctx.fillStyle = '#060E18';
    ctx.fillRect(0, 0, w, h);

    // Soft, bright cyan & sky blue glow
    const eyeColor = '#00F0FF';
    const softGlow = '#38BDF8';

    ctx.shadowColor = softGlow;
    ctx.shadowBlur = 25;
    ctx.fillStyle = eyeColor;
    ctx.strokeStyle = eyeColor;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const eyeCenterY = h * 0.5;
    const leftEyeX = w * 0.33;
    const rightEyeX = w * 0.67;
    const blinkScale = 1 - this.blinkProgress;

    ctx.save();
    ctx.translate(0, (1 - blinkScale) * eyeCenterY * 0.3);

    switch (expression) {
      case 'smile':
      case 'greet':
        // Cute happy upward-curved eye arcs ^ ^ and charming small smile
        this.drawHappyEyeArc(ctx, leftEyeX, eyeCenterY, blinkScale);
        this.drawHappyEyeArc(ctx, rightEyeX, eyeCenterY, blinkScale);

        if (blinkScale > 0.35) {
          // Cute little happy smile
          ctx.beginPath();
          ctx.arc(w * 0.5, eyeCenterY + 36, 22, Math.PI * 0.15, Math.PI * 0.85, false);
          ctx.stroke();

          // Soft blushing cheek dots for extra cuteness
          ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.beginPath();
          ctx.arc(leftEyeX - 32, eyeCenterY + 28, 9, 0, Math.PI * 2);
          ctx.arc(rightEyeX + 32, eyeCenterY + 28, 9, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'curious': {
        // Curious wide eyes with pupils slightly offset
        const pX = pupilX * 14;
        const pY = pupilY * 10;
        this.drawRoundCuteEye(ctx, leftEyeX + pX, eyeCenterY + pY, 26, 26 * blinkScale);
        this.drawRoundCuteEye(ctx, rightEyeX + pX, eyeCenterY + pY, 26, 26 * blinkScale);

        if (blinkScale > 0.5) {
          // Cute small curious mouth dot
          ctx.beginPath();
          ctx.arc(w * 0.5 + pX * 0.3, eyeCenterY + 38, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'idle':
      default: {
        // Calm, friendly rounded pill eyes with soft pupil highlights
        const pX = pupilX * 8;
        const pY = pupilY * 6;
        this.drawRoundCuteEye(ctx, leftEyeX + pX, eyeCenterY + pY, 24, 28 * blinkScale);
        this.drawRoundCuteEye(ctx, rightEyeX + pX, eyeCenterY + pY, 24, 28 * blinkScale);
        break;
      }
    }

    ctx.restore();
    this.visorTexture.needsUpdate = true;
  }

  private drawHappyEyeArc(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    if (scale <= 0.1) return;
    ctx.beginPath();
    ctx.arc(x, y + 8, 25, Math.PI * 1.15, Math.PI * 1.85, false);
    ctx.stroke();
  }

  private drawRoundCuteEye(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radiusX: number,
    radiusY: number
  ) {
    if (radiusY <= 2) {
      // Natural blink slit
      ctx.beginPath();
      ctx.moveTo(x - radiusX, y);
      ctx.lineTo(x + radiusX, y);
      ctx.stroke();
      return;
    }
    // Outer glowing eye capsule
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute inner white sparkle reflection
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + radiusX * 0.28, y - radiusY * 0.28, radiusX * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00F0FF';
  }

  // Master Subtle Frame Update Loop (Natural & Soft Animation)
  public update(
    time: number,
    delta: number,
    activeExpression: RobotExpression,
    cursor: { normX: number; normY: number; isNear: boolean }
  ) {
    const effectiveExpression: RobotExpression = cursor.isNear ? 'smile' : activeExpression;

    // Periodic natural blinking (~120ms)
    if (!this.isBlinking && time > this.nextBlinkTime) {
      this.isBlinking = true;
      this.blinkProgress = 0;
    }

    if (this.isBlinking) {
      this.blinkProgress += delta * 8.0;
      if (this.blinkProgress >= 1) {
        this.blinkProgress = 0;
        this.isBlinking = false;
        this.nextBlinkTime = time + 3.2 + Math.random() * 3.5;
      }
    }

    // Natural, subtle head turn toward cursor
    if (cursor.isNear) {
      this.targetHeadRotY = cursor.normX * 0.45;
      this.targetHeadRotX = -cursor.normY * 0.25;
      this.targetHeadRotZ = 0.08; // Cute inquisitive head tilt
    } else {
      this.targetHeadRotY = cursor.normX * 0.18 + Math.sin(time * 0.6) * 0.05;
      this.targetHeadRotX = -cursor.normY * 0.12 + Math.cos(time * 0.5) * 0.03;
      this.targetHeadRotZ = Math.sin(time * 0.4) * 0.02;
    }

    // Gentle damping factor for smooth, non-aggressive rotation
    const lerpFactor = 0.065;
    this.headGroup.rotation.y += (this.targetHeadRotY - this.headGroup.rotation.y) * lerpFactor;
    this.headGroup.rotation.x += (this.targetHeadRotX - this.headGroup.rotation.x) * lerpFactor;
    this.headGroup.rotation.z += (this.targetHeadRotZ - this.headGroup.rotation.z) * lerpFactor;

    // Redraw Visor Face
    this.currentExpression = effectiveExpression;
    this.drawVisorFace(this.currentExpression, cursor.normX, cursor.normY);

    // Gentle, subtle idle floating (very small, calm bobbing)
    const floatY = Math.sin(time * 1.5) * 0.028;
    const breatheY = Math.cos(time * 1.2) * 0.01;

    this.headGroup.position.y = 0.75 + floatY * 0.8;
    this.bodyGroup.position.y = 0.12 + floatY * 0.4 + breatheY;

    // Soft, natural arm movement
    const armSway = Math.sin(time * 1.8) * 0.02;
    this.leftArm.position.y = 0.22 + floatY * 0.5 - armSway;
    this.rightArm.position.y = 0.22 + floatY * 0.5 + armSway;

    if (effectiveExpression === 'smile' || effectiveExpression === 'greet') {
      // Cute friendly little wave posture
      this.rightArm.position.y += 0.05;
      this.rightArm.rotation.z = -0.18 + Math.sin(time * 3.0) * 0.03;
    } else {
      this.rightArm.rotation.z = -0.05;
    }

    // Soft pulsating glow on chest heart & antenna bulb
    const pulse = 1.6 + Math.sin(time * 2.8) * 0.35;
    this.visorMaterial.emissiveIntensity = pulse;
    (this.chestCore.material as THREE.MeshBasicMaterial).color.setRGB(
      0.0,
      0.85 * pulse,
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
