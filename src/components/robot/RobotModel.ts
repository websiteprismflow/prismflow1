import * as THREE from 'three';

export type RobotExpression = 'idle' | 'greet' | 'smile' | 'curious' | 'excited' | 'thinking';

export class RobotModel {
  public root: THREE.Group;
  public headGroup: THREE.Group;
  public bodyGroup: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;
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

    // 1. Dynamic Visor Canvas for Large, Expressive Digital Eyes & Cute Mouth
    this.visorCanvas = document.createElement('canvas');
    this.visorCanvas.width = 512;
    this.visorCanvas.height = 256;
    const ctx = this.visorCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context for robot visor');
    this.visorCtx = ctx;

    this.visorTexture = new THREE.CanvasTexture(this.visorCanvas);
    this.visorTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. High-Contrast Premium Character Materials
    // Primary: Pearlescent Silver / Soft White-Gray (High diffuse luminance)
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xF2F6FA,
      metalness: 0.08,
      roughness: 0.22,
    });

    // Secondary: Deep Royal Navy Blue
    const navyMat = new THREE.MeshStandardMaterial({
      color: 0x102D52,
      metalness: 0.14,
      roughness: 0.32,
    });

    // Technical Trim: Brushed Slate Steel
    const slateTrimMat = new THREE.MeshStandardMaterial({
      color: 0x8DA2B8,
      metalness: 0.22,
      roughness: 0.3,
    });

    // Emissive Cyan & Sky Blue
    const cyanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
    });

    const softBlueGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
    });

    // Visor Face Screen Material (Deep Dark Glass with High Emissive Map)
    this.visorMaterial = new THREE.MeshStandardMaterial({
      color: 0x060E18,
      roughness: 0.06,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveMap: this.visorTexture,
      emissiveIntensity: 3.0,
    });

    // 3. Head Assembly with Integrated Futuristic Helmet
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.78, 0);

    // Inner Face Head Sphere (Smooth rounded face)
    const faceHeadGeo = new THREE.SphereGeometry(0.54, 32, 32);
    faceHeadGeo.scale(1.08, 0.96, 1.04);
    const faceHeadMesh = new THREE.Mesh(faceHeadGeo, silverMat);
    this.headGroup.add(faceHeadMesh);

    // Curved Front Visor Screen (Clearly visible face area)
    const visorGeo = new THREE.SphereGeometry(0.48, 32, 16, Math.PI * 0.14, Math.PI * 0.72, Math.PI * 0.22, Math.PI * 0.55);
    visorGeo.scale(1.05, 0.94, 1.08);
    const visorMesh = new THREE.Mesh(visorGeo, this.visorMaterial);
    visorMesh.position.set(0, 0.02, 0.05);
    this.headGroup.add(visorMesh);

    // Futuristic Helmet / Head-Shell (Silver Outer Shell covering Crown, Back & Sides)
    const helmetCowlGeo = new THREE.SphereGeometry(0.57, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
    helmetCowlGeo.scale(1.1, 0.98, 1.06);
    const helmetCowlMesh = new THREE.Mesh(helmetCowlGeo, silverMat);
    helmetCowlMesh.position.set(0, 0.03, -0.04);
    this.headGroup.add(helmetCowlMesh);

    // Helmet Brow Visor Shield (Navy Blue curved brow accent)
    const browGeo = new THREE.TorusGeometry(0.45, 0.028, 16, 48, Math.PI * 0.75);
    const browMesh = new THREE.Mesh(browGeo, navyMat);
    browMesh.position.set(0, 0.28, 0.3);
    browMesh.rotation.x = Math.PI * 0.28;
    this.headGroup.add(browMesh);

    // Helmet Rear Guard (Navy Blue back panel)
    const rearHelmetGeo = new THREE.SphereGeometry(0.575, 32, 16, Math.PI * 0.65, Math.PI * 0.7, 0, Math.PI * 0.85);
    rearHelmetGeo.scale(1.1, 0.98, 1.06);
    const rearHelmetMesh = new THREE.Mesh(rearHelmetGeo, navyMat);
    rearHelmetMesh.position.set(0, 0.02, -0.06);
    this.headGroup.add(rearHelmetMesh);

    // Helmet Ear Sensory Pods (Silver Shell + Navy Ring)
    const earGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.12, 24);
    earGeo.rotateZ(Math.PI / 2);

    const leftEar = new THREE.Mesh(earGeo, silverMat);
    leftEar.position.set(-0.58, 0.04, 0);
    this.headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, silverMat);
    rightEar.position.set(0.58, 0.04, 0);
    this.headGroup.add(rightEar);

    // Glowing Soft Blue Ear Rings
    const earRingGeo = new THREE.TorusGeometry(0.08, 0.016, 12, 24);
    earRingGeo.rotateY(Math.PI / 2);

    const leftRing = new THREE.Mesh(earRingGeo, softBlueGlowMat);
    leftRing.position.set(-0.64, 0.04, 0);
    this.headGroup.add(leftRing);

    const rightRing = new THREE.Mesh(earRingGeo, softBlueGlowMat);
    rightRing.position.set(0.64, 0.04, 0);
    this.headGroup.add(rightRing);

    // Crown Antenna (Sleek stem + Glowing Cyan Bulb)
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.032, 0.18, 16);
    const stemMesh = new THREE.Mesh(stemGeo, slateTrimMat);
    stemMesh.position.set(0, 0.62, -0.04);
    stemMesh.rotation.x = -Math.PI * 0.08;
    this.headGroup.add(stemMesh);

    const bulbGeo = new THREE.SphereGeometry(0.06, 16, 16);
    this.antennaBulb = new THREE.Mesh(bulbGeo, cyanGlowMat);
    this.antennaBulb.position.set(0, 0.72, -0.08);
    this.headGroup.add(this.antennaBulb);

    this.root.add(this.headGroup);

    // 4. Compact, Cute Rounded Body
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.set(0, 0.18, 0);

    // Navy Blue Segmented Neck Ring
    const neckGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.1, 24);
    const neckMesh = new THREE.Mesh(neckGeo, navyMat);
    neckMesh.position.set(0, 0.44, 0);
    this.bodyGroup.add(neckMesh);

    // Compact Chubby Torso (Bright Silver Shell)
    const bodyGeo = new THREE.SphereGeometry(0.36, 28, 28);
    bodyGeo.scale(0.92, 0.86, 0.84);
    const bodyMesh = new THREE.Mesh(bodyGeo, silverMat);
    bodyMesh.position.set(0, 0.18, 0);
    this.bodyGroup.add(bodyMesh);

    // Navy Blue Front Inset Belly Armor
    const bellyGeo = new THREE.SphereGeometry(0.31, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
    bellyGeo.scale(0.85, 0.8, 0.88);
    const bellyMesh = new THREE.Mesh(bellyGeo, navyMat);
    bellyMesh.position.set(0, 0.16, 0.06);
    bellyMesh.rotation.x = Math.PI * 0.46;
    this.bodyGroup.add(bellyMesh);

    // Chest Glowing Arc Core (Cyan Glow)
    const coreOuterGeo = new THREE.TorusGeometry(0.08, 0.016, 16, 24);
    const coreOuterMesh = new THREE.Mesh(coreOuterGeo, slateTrimMat);
    coreOuterMesh.position.set(0, 0.2, 0.3);
    this.bodyGroup.add(coreOuterMesh);

    const coreInnerGeo = new THREE.SphereGeometry(0.048, 16, 16);
    this.chestCore = new THREE.Mesh(coreInnerGeo, cyanGlowMat);
    this.chestCore.position.set(0, 0.2, 0.3);
    this.bodyGroup.add(this.chestCore);

    this.root.add(this.bodyGroup);

    // 5. Short, Simple Rounded Arms & Cute Hands
    this.leftArm = this.createCuteArm(true, silverMat, navyMat, cyanGlowMat);
    this.leftArm.position.set(-0.48, 0.32, 0.04);
    this.root.add(this.leftArm);

    this.rightArm = this.createCuteArm(false, silverMat, navyMat, cyanGlowMat);
    this.rightArm.position.set(0.48, 0.32, 0.04);
    this.root.add(this.rightArm);

    // 6. Cute Compact Legs & Rounded Feet (Complete character from head to feet)
    this.leftLeg = this.createCuteLeg(true, silverMat, navyMat, softBlueGlowMat);
    this.leftLeg.position.set(-0.16, 0.05, 0);
    this.root.add(this.leftLeg);

    this.rightLeg = this.createCuteLeg(false, silverMat, navyMat, softBlueGlowMat);
    this.rightLeg.position.set(0.16, 0.05, 0);
    this.root.add(this.rightLeg);

    // Initial Face Render
    this.drawVisorFace('idle', 0, 0);
  }

  private createCuteArm(
    isLeft: boolean,
    silverMat: THREE.Material,
    navyMat: THREE.Material,
    glowMat: THREE.Material
  ): THREE.Group {
    const arm = new THREE.Group();

    // Cute rounded shoulder joint
    const shoulderGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, navyMat);
    arm.add(shoulderMesh);

    // Short rounded silver arm pod
    const armGeo = new THREE.CapsuleGeometry(0.065, 0.12, 8, 16);
    armGeo.rotateZ(isLeft ? Math.PI * 0.1 : -Math.PI * 0.1);
    const armMesh = new THREE.Mesh(armGeo, silverMat);
    armMesh.position.set(isLeft ? -0.04 : 0.04, -0.1, 0);
    arm.add(armMesh);

    // Small rounded mitten hand
    const handGeo = new THREE.SphereGeometry(0.06, 16, 16);
    handGeo.scale(0.9, 0.7, 0.85);
    const handMesh = new THREE.Mesh(handGeo, navyMat);
    handMesh.position.set(isLeft ? -0.05 : 0.05, -0.18, 0.03);
    arm.add(handMesh);

    // Small glowing palm dot
    const palmGlowGeo = new THREE.SphereGeometry(0.02, 12, 12);
    const palmGlow = new THREE.Mesh(palmGlowGeo, glowMat);
    palmGlow.position.set(isLeft ? -0.05 : 0.05, -0.19, 0.07);
    arm.add(palmGlow);

    return arm;
  }

  private createCuteLeg(
    isLeft: boolean,
    silverMat: THREE.Material,
    navyMat: THREE.Material,
    glowMat: THREE.Material
  ): THREE.Group {
    const leg = new THREE.Group();

    // Compact hip joint (Navy Blue)
    const hipGeo = new THREE.SphereGeometry(0.07, 14, 14);
    const hipMesh = new THREE.Mesh(hipGeo, navyMat);
    leg.add(hipMesh);

    // Short silver leg cylinder
    const thighGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.14, 16);
    const thighMesh = new THREE.Mesh(thighGeo, silverMat);
    thighMesh.position.set(0, -0.08, 0);
    leg.add(thighMesh);

    // Cute rounded foot (Silver shell + Navy base)
    const footGeo = new THREE.SphereGeometry(0.085, 16, 16);
    footGeo.scale(0.9, 0.55, 1.25);
    const footMesh = new THREE.Mesh(footGeo, silverMat);
    footMesh.position.set(0, -0.17, 0.03);
    leg.add(footMesh);

    // Glowing cyan hover pad under foot
    const soleGeo = new THREE.RingGeometry(0.025, 0.065, 16);
    soleGeo.rotateX(Math.PI / 2);
    const soleMesh = new THREE.Mesh(soleGeo, glowMat);
    soleMesh.position.set(0, -0.21, 0.03);
    leg.add(soleMesh);

    return leg;
  }

  // Draw Large, Expressive Digital Eyes & Cute Visible Mouth
  private drawVisorFace(expression: RobotExpression, pupilX: number, pupilY: number) {
    const ctx = this.visorCtx;
    const w = this.visorCanvas.width;
    const h = this.visorCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Deep dark visor background
    ctx.fillStyle = '#050D18';
    ctx.fillRect(0, 0, w, h);

    // Cyan Eye & Mouth Glow
    const eyeCyan = '#00F0FF';
    const softBlue = '#38BDF8';

    ctx.shadowColor = softBlue;
    ctx.shadowBlur = 24;
    ctx.fillStyle = eyeCyan;
    ctx.strokeStyle = eyeCyan;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const eyeCenterY = h * 0.44;
    const leftEyeX = w * 0.33;
    const rightEyeX = w * 0.67;
    const blinkScale = 1 - this.blinkProgress;

    ctx.save();
    ctx.translate(0, (1 - blinkScale) * eyeCenterY * 0.35);

    // 1. Draw Large Expressive Eyes Based on Expression
    switch (expression) {
      case 'smile':
      case 'greet':
        // Happy, friendly upward-curved eye arcs ^ ^
        this.drawHappyEyeArc(ctx, leftEyeX, eyeCenterY, blinkScale);
        this.drawHappyEyeArc(ctx, rightEyeX, eyeCenterY, blinkScale);

        // Visible cute smile & blushing cheeks
        if (blinkScale > 0.3) {
          ctx.beginPath();
          ctx.arc(w * 0.5, eyeCenterY + 42, 25, Math.PI * 0.15, Math.PI * 0.85, false);
          ctx.stroke();

          // Cute pinkish/cyan blushing cheek spots
          ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.beginPath();
          ctx.arc(leftEyeX - 34, eyeCenterY + 28, 10, 0, Math.PI * 2);
          ctx.arc(rightEyeX + 34, eyeCenterY + 28, 10, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'curious': {
        // Curious wide eyes with offset pupils and small mouth
        const pX = pupilX * 14;
        const pY = pupilY * 10;
        this.drawBigRoundEye(ctx, leftEyeX + pX, eyeCenterY + pY, 32, 34 * blinkScale);
        this.drawBigRoundEye(ctx, rightEyeX + pX, eyeCenterY + pY, 32, 34 * blinkScale);

        if (blinkScale > 0.4) {
          // Cute curious mouth 'o'
          ctx.beginPath();
          ctx.arc(w * 0.5 + pX * 0.3, eyeCenterY + 44, 6, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }

      case 'excited': {
        // Energetic larger eyes with extra sparkle
        const pX = pupilX * 10;
        const pY = pupilY * 8;
        this.drawBigRoundEye(ctx, leftEyeX + pX, eyeCenterY + pY, 34, 36 * blinkScale);
        this.drawBigRoundEye(ctx, rightEyeX + pX, eyeCenterY + pY, 34, 36 * blinkScale);

        if (blinkScale > 0.3) {
          // Cheerful open smile
          ctx.beginPath();
          ctx.arc(w * 0.5, eyeCenterY + 40, 28, Math.PI * 0.1, Math.PI * 0.9, false);
          ctx.stroke();
        }
        break;
      }

      case 'thinking': {
        // Thinking eyes subtly looking upward
        const pX = pupilX * 10;
        const pY = -8;
        this.drawBigRoundEye(ctx, leftEyeX + pX, eyeCenterY + pY, 30, 28 * blinkScale);
        this.drawBigRoundEye(ctx, rightEyeX + pX, eyeCenterY + pY, 30, 28 * blinkScale);

        if (blinkScale > 0.4) {
          // Thoughtful side mouth line
          ctx.beginPath();
          ctx.moveTo(w * 0.46, eyeCenterY + 44);
          ctx.lineTo(w * 0.56, eyeCenterY + 40);
          ctx.stroke();
        }
        break;
      }

      case 'idle':
      default: {
        // Calm, friendly large rounded digital eyes
        const pX = pupilX * 8;
        const pY = pupilY * 6;
        this.drawBigRoundEye(ctx, leftEyeX + pX, eyeCenterY + pY, 30, 32 * blinkScale);
        this.drawBigRoundEye(ctx, rightEyeX + pX, eyeCenterY + pY, 30, 32 * blinkScale);

        // Small, subtle cute neutral mouth curve
        if (blinkScale > 0.4) {
          ctx.beginPath();
          ctx.arc(w * 0.5, eyeCenterY + 42, 14, Math.PI * 0.2, Math.PI * 0.8, false);
          ctx.stroke();
        }
        break;
      }
    }

    ctx.restore();
    this.visorTexture.needsUpdate = true;
  }

  private drawHappyEyeArc(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    if (scale <= 0.1) return;
    ctx.beginPath();
    ctx.arc(x, y + 10, 26, Math.PI * 1.15, Math.PI * 1.85, false);
    ctx.stroke();
  }

  private drawBigRoundEye(
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

    // Outer large glowing eye capsule
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute inner white pupil reflection sparkle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + radiusX * 0.3, y - radiusY * 0.3, radiusX * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00F0FF';
  }

  // Master Subtle Frame Update Loop
  public update(
    time: number,
    delta: number,
    activeExpression: RobotExpression,
    cursor: { normX: number; normY: number; isNear: boolean }
  ) {
    const effectiveExpression: RobotExpression = cursor.isNear ? 'smile' : activeExpression;

    // Natural periodic blinking (~120ms)
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

    // Smooth head tilt and turn toward cursor
    if (cursor.isNear) {
      this.targetHeadRotY = cursor.normX * 0.45;
      this.targetHeadRotX = -cursor.normY * 0.25;
      this.targetHeadRotZ = 0.08; // Cute inquisitive head tilt
    } else {
      this.targetHeadRotY = cursor.normX * 0.18 + Math.sin(time * 0.6) * 0.05;
      this.targetHeadRotX = -cursor.normY * 0.12 + Math.cos(time * 0.5) * 0.03;
      this.targetHeadRotZ = Math.sin(time * 0.4) * 0.02;
    }

    // Damped interpolation for natural head movement
    const lerpFactor = 0.065;
    this.headGroup.rotation.y += (this.targetHeadRotY - this.headGroup.rotation.y) * lerpFactor;
    this.headGroup.rotation.x += (this.targetHeadRotX - this.headGroup.rotation.x) * lerpFactor;
    this.headGroup.rotation.z += (this.targetHeadRotZ - this.headGroup.rotation.z) * lerpFactor;

    // Redraw Visor Face
    this.currentExpression = effectiveExpression;
    this.drawVisorFace(this.currentExpression, cursor.normX, cursor.normY);

    // Gentle, subtle idle floating (calm micro bobbing)
    const floatY = Math.sin(time * 1.5) * 0.028;
    const breatheY = Math.cos(time * 1.2) * 0.01;

    this.headGroup.position.y = 0.78 + floatY * 0.8;
    this.bodyGroup.position.y = 0.18 + floatY * 0.4 + breatheY;

    // Subtle arm floating
    const armSway = Math.sin(time * 1.8) * 0.02;
    this.leftArm.position.y = 0.32 + floatY * 0.5 - armSway;
    this.rightArm.position.y = 0.32 + floatY * 0.5 + armSway;

    if (effectiveExpression === 'smile' || effectiveExpression === 'greet') {
      // Friendly subtle wave gesture
      this.rightArm.position.y += 0.06;
      this.rightArm.rotation.z = -0.2 + Math.sin(time * 3.2) * 0.04;
    } else {
      this.rightArm.rotation.z = -0.05;
    }

    // Gentle leg hover sway
    const legSway = Math.sin(time * 1.6) * 0.015;
    this.leftLeg.position.y = 0.05 + floatY * 0.3 + legSway;
    this.rightLeg.position.y = 0.05 + floatY * 0.3 - legSway;

    // Pulsating chest core & antenna bulb
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
