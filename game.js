// ===== NBA 2K STYLE PROFESSIONAL BASKETBALL GAME =====
// Ultra-realistic 3D basketball with stadium, crowd, and pro graphics
// ENHANCED WITH ULTRA HIGH GRAPHICS

// Game State
let scene, camera, renderer, composer;
let bloomPass, renderPass, fxaaPass;
let court,
  ball,
  players = [],
  homeTeam = [],
  awayTeam = [];
let crowd = [],
  spotlights = [],
  jumbotron,
  courtReflection;
let gameState = {
  homeScore: 0,
  awayScore: 0,
  quarter: 1,
  gameTime: 300,
  shotClock: 24,
  possession: "home",
  ballHandler: null,
  controlledPlayer: null,
  gameActive: false,
  paused: false,
};

let keys = {};
let quarterLength = 5 * 60;

// Enhanced Player Class with ULTRA-REALISTIC human model (NBA style)
class Player {
  constructor(team, number, position, x, z) {
    this.team = team;
    this.number = number;
    this.position = position;
    this.stats = { points: 0, assists: 0, rebounds: 0, steals: 0 };

    // Create ultra-realistic human 3D model
    this.mesh = new THREE.Group();
    this.mesh.position.set(x, 0, z);
    scene.add(this.mesh);

    const color = team === "home" ? 0x1e3a8a : 0xdc2626; // Deep blue vs Red

    // Varied realistic skin tones for diversity
    const skinTones = [
      0xffe0bd, 0xffcd94, 0xeac086, 0xd4a574, 0xc68642, 0xa67c52, 0x8d5524,
      0x6b4423, 0x4a2f1e,
    ];
    const skinColor = skinTones[number % skinTones.length];

    // Varied hair colors
    const hairColors = [
      0x0a0a0a, 0x1c1c1c, 0x2b1b17, 0x3d2817, 0x4a2511, 0x6a3410,
    ];
    const hairColor = hairColors[number % hairColors.length];

    // === REALISTIC BODY STRUCTURE ===

    // HEAD - Realistic human head shape
    const headGroup = new THREE.Group();
    const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    headGeometry.scale(1, 1.1, 0.95); // Oval head shape
    const headMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.65,
      metalness: 0.0,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.castShadow = true;
    head.receiveShadow = true;
    headGroup.add(head);
    headGroup.position.y = 2.05;
    this.mesh.add(headGroup);

    // FACIAL FEATURES
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.04, 12, 12);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.08, 0.08, 0.22);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.08, 0.08, 0.22);
    headGroup.add(rightEye);

    // Pupils
    const pupilGeometry = new THREE.SphereGeometry(0.02, 10, 10);
    const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });

    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.08, 0.08, 0.25);
    headGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.08, 0.08, 0.25);
    headGroup.add(rightPupil);

    // Nose
    const noseGeometry = new THREE.ConeGeometry(0.03, 0.1, 4);
    noseGeometry.rotateX(Math.PI / 2);
    const nose = new THREE.Mesh(
      noseGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
      })
    );
    nose.position.set(0, 0, 0.24);
    headGroup.add(nose);

    // Mouth
    const mouthGeometry = new THREE.BoxGeometry(0.12, 0.025, 0.03);
    const mouth = new THREE.Mesh(
      mouthGeometry,
      new THREE.MeshStandardMaterial({
        color: 0xaa5555,
        roughness: 0.5,
      })
    );
    mouth.position.set(0, -0.05, 0.24);
    headGroup.add(mouth);

    // Ears
    const earGeometry = new THREE.SphereGeometry(0.06, 10, 10);
    earGeometry.scale(0.5, 1, 0.4);

    const leftEar = new THREE.Mesh(earGeometry, headMaterial);
    leftEar.position.set(-0.25, 0.05, 0);
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, headMaterial);
    rightEar.position.set(0.25, 0.05, 0);
    headGroup.add(rightEar);

    // HAIR - Realistic styled hair
    const hairGeometry = new THREE.SphereGeometry(
      0.27,
      20,
      20,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.6
    );
    const hair = new THREE.Mesh(
      hairGeometry,
      new THREE.MeshStandardMaterial({
        color: hairColor,
        roughness: 0.95,
      })
    );
    hair.position.y = 0.15;
    hair.castShadow = true;
    headGroup.add(hair);

    // NECK - Connects head to body
    const neckGeometry = new THREE.CylinderGeometry(0.11, 0.13, 0.2, 16);
    const neck = new THREE.Mesh(
      neckGeometry,
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.7,
      })
    );
    neck.position.y = 1.8;
    neck.castShadow = true;
    this.mesh.add(neck);

    // SHOULDERS - Wide athletic shoulders
    const shoulderGeometry = new THREE.SphereGeometry(0.18, 16, 16);
    const shoulderMaterial = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
      metalness: 0.1,
    });

    const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    leftShoulder.position.set(-0.5, 1.7, 0);
    leftShoulder.castShadow = true;
    this.mesh.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    rightShoulder.position.set(0.5, 1.7, 0);
    rightShoulder.castShadow = true;
    this.mesh.add(rightShoulder);

    // UPPER TORSO - Athletic chest (wider at top)
    const chestGeometry = new THREE.CylinderGeometry(0.42, 0.38, 0.5, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.55,
      metalness: 0.12,
    });
    const chest = new THREE.Mesh(chestGeometry, bodyMaterial);
    chest.position.y = 1.55;
    chest.castShadow = true;
    chest.receiveShadow = true;
    this.mesh.add(chest);

    // LOWER TORSO - Waist (narrower)
    const waistGeometry = new THREE.CylinderGeometry(0.35, 0.38, 0.4, 16);
    const waist = new THREE.Mesh(waistGeometry, bodyMaterial);
    waist.position.y = 1.1;
    waist.castShadow = true;
    waist.receiveShadow = true;
    this.mesh.add(waist);

    // JERSEY NUMBER on chest
    const numberCanvas = document.createElement("canvas");
    numberCanvas.width = 128;
    numberCanvas.height = 128;
    const ctx = numberCanvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.font = "bold 90px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(number, 64, 64);

    const numberTexture = new THREE.CanvasTexture(numberCanvas);
    const numberPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.3),
      new THREE.MeshBasicMaterial({ map: numberTexture, transparent: true })
    );
    numberPlane.position.set(0, 1.6, 0.43);
    this.mesh.add(numberPlane);

    // ARMS - Upper arms (attached to shoulders)
    const armMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.65,
    });
    const upperArmGeometry = new THREE.CylinderGeometry(0.09, 0.085, 0.55, 14);

    const leftUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
    leftUpperArm.position.set(-0.5, 1.3, 0);
    leftUpperArm.castShadow = true;
    leftUpperArm.receiveShadow = true;
    this.mesh.add(leftUpperArm);

    const rightUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
    rightUpperArm.position.set(0.5, 1.3, 0);
    rightUpperArm.castShadow = true;
    rightUpperArm.receiveShadow = true;
    this.mesh.add(rightUpperArm);

    // FOREARMS
    const forearmGeometry = new THREE.CylinderGeometry(0.075, 0.08, 0.45, 12);

    const leftForearm = new THREE.Mesh(forearmGeometry, armMaterial);
    leftForearm.position.set(-0.5, 0.8, 0);
    leftForearm.castShadow = true;
    this.mesh.add(leftForearm);

    const rightForearm = new THREE.Mesh(forearmGeometry, armMaterial);
    rightForearm.position.set(0.5, 0.8, 0);
    rightForearm.castShadow = true;
    this.mesh.add(rightForearm);

    // HANDS
    const handGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    handGeometry.scale(1, 1.2, 0.6);

    const leftHand = new THREE.Mesh(handGeometry, armMaterial);
    leftHand.position.set(-0.5, 0.52, 0);
    leftHand.castShadow = true;
    this.mesh.add(leftHand);

    const rightHand = new THREE.Mesh(handGeometry, armMaterial);
    rightHand.position.set(0.5, 0.52, 0);
    rightHand.castShadow = true;
    this.mesh.add(rightHand);

    // HIPS/SHORTS - Connection between torso and legs
    const hipsGeometry = new THREE.CylinderGeometry(0.38, 0.36, 0.25, 16);
    const hips = new THREE.Mesh(hipsGeometry, bodyMaterial);
    hips.position.y = 0.825;
    hips.castShadow = true;
    this.mesh.add(hips);

    // UPPER LEGS - Thighs (basketball shorts)
    const thighGeometry = new THREE.CylinderGeometry(0.13, 0.115, 0.45, 14);

    const leftThigh = new THREE.Mesh(thighGeometry, bodyMaterial);
    leftThigh.position.set(-0.18, 0.5, 0);
    leftThigh.castShadow = true;
    leftThigh.receiveShadow = true;
    this.mesh.add(leftThigh);

    const rightThigh = new THREE.Mesh(thighGeometry, bodyMaterial);
    rightThigh.position.set(0.18, 0.5, 0);
    rightThigh.castShadow = true;
    rightThigh.receiveShadow = true;
    this.mesh.add(rightThigh);

    // LOWER LEGS - Calves (exposed skin)
    const calfGeometry = new THREE.CylinderGeometry(0.095, 0.09, 0.5, 12);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.7,
    });

    const leftCalf = new THREE.Mesh(calfGeometry, legMaterial);
    leftCalf.position.set(-0.18, 0.15, 0);
    leftCalf.castShadow = true;
    this.mesh.add(leftCalf);

    const rightCalf = new THREE.Mesh(calfGeometry, legMaterial);
    rightCalf.position.set(0.18, 0.15, 0);
    rightCalf.castShadow = true;
    this.mesh.add(rightCalf);

    // BASKETBALL SHOES - High-top athletic shoes
    const shoeGeometry = new THREE.BoxGeometry(0.18, 0.15, 0.32);
    const shoeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.25,
    });

    const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    leftShoe.position.set(-0.18, -0.05, 0.03);
    leftShoe.castShadow = true;
    this.mesh.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    rightShoe.position.set(0.18, -0.05, 0.03);
    rightShoe.castShadow = true;
    this.mesh.add(rightShoe);

    // Shoe soles (black rubber)
    const soleGeometry = new THREE.BoxGeometry(0.2, 0.04, 0.34);
    const soleMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.95,
    });

    const leftSole = new THREE.Mesh(soleGeometry, soleMaterial);
    leftSole.position.set(-0.18, -0.13, 0.03);
    leftSole.castShadow = true;
    this.mesh.add(leftSole);

    const rightSole = new THREE.Mesh(soleGeometry, soleMaterial);
    rightSole.position.set(0.18, -0.13, 0.03);
    rightSole.castShadow = true;
    this.mesh.add(rightSole);

    // Store all body parts for animation
    this.bodyParts = {
      headGroup,
      head,
      neck,
      leftShoulder,
      rightShoulder,
      chest,
      waist,
      hips,
      leftUpperArm,
      rightUpperArm,
      leftForearm,
      rightForearm,
      leftHand,
      rightHand,
      leftThigh,
      rightThigh,
      leftCalf,
      rightCalf,
      leftShoe,
      rightShoe,
      leftPupil,
      rightPupil,
    };

    // Movement properties
    this.velocity = new THREE.Vector3();
    this.speed = 0.18;
    this.hasBall = false;
    this.target = null;
    this.aiState = "idle";
  }

  update() {
    // Update position
    this.mesh.position.add(this.velocity);
    this.velocity.multiplyScalar(0.88); // Better friction

    // Realistic athletic animation
    const chest = new THREE.Mesh(chestGeometry, bodyMaterial);
    chest.position.y = 1.65;
    chest.castShadow = true;
    chest.receiveShadow = true;
    this.mesh.add(chest);

    // LOWER TORSO - Waist (slightly narrower)
    const waistGeometry = new THREE.BoxGeometry(0.6, 0.45, 0.38);
    const waist = new THREE.Mesh(waistGeometry, bodyMaterial);
    waist.position.y = 1.15;
    waist.castShadow = true;
    waist.receiveShadow = true;
    this.mesh.add(waist);

    // SHOULDERS - Broader athletic shoulders
    const shoulderGeometry = new THREE.SphereGeometry(0.15, 16, 16);

    const leftShoulder = new THREE.Mesh(shoulderGeometry, bodyMaterial);
    leftShoulder.position.set(-0.45, 1.75, 0);
    leftShoulder.castShadow = true;
    this.mesh.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeometry, bodyMaterial);
    rightShoulder.position.set(0.45, 1.75, 0);
    rightShoulder.castShadow = true;
    this.mesh.add(rightShoulder);

    // Jersey number on front chest
    const numberCanvas = document.createElement("canvas");
    numberCanvas.width = 128;
    numberCanvas.height = 128;
    const ctx = numberCanvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.font = "bold 80px Arial";
    ctx.textAlign = "center";
    ctx.fillText(number, 64, 90);

    const numberTexture = new THREE.CanvasTexture(numberCanvas);
    const numberMaterial = new THREE.MeshBasicMaterial({
      map: numberTexture,
      transparent: true,
    });
    const numberPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.35, 0.35),
      numberMaterial
    );
    numberPlane.position.set(0, 1.65, 0.21);
    this.mesh.add(numberPlane);

    // HEAD - More realistic oval shape
    const headGeometry = new THREE.SphereGeometry(0.28, 32, 32);
    headGeometry.scale(1, 1.15, 0.95); // Make it more oval
    const headMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.6,
      metalness: 0.0,
      envMapIntensity: 0.4,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.15;
    head.castShadow = true;
    head.receiveShadow = true;
    this.mesh.add(head);

    // EYES - Two spheres for realistic eyes
    const eyeWhiteGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
    });

    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    leftEyeWhite.position.set(-0.1, 2.2, 0.23);
    this.mesh.add(leftEyeWhite);

    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    rightEyeWhite.position.set(0.1, 2.2, 0.23);
    this.mesh.add(rightEyeWhite);

    // Eye pupils
    const pupilGeometry = new THREE.SphereGeometry(0.03, 12, 12);
    const pupilMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d2d2d,
      roughness: 0.1,
    });

    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.1, 2.2, 0.28);
    this.mesh.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.1, 2.2, 0.28);
    this.mesh.add(rightPupil);

    // NOSE - Small pyramid shape
    const noseGeometry = new THREE.ConeGeometry(0.04, 0.12, 4);
    noseGeometry.rotateX(Math.PI / 2);
    const noseMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.7,
    });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 2.1, 0.25);
    this.mesh.add(nose);

    // MOUTH - Simple line with lips
    const mouthGeometry = new THREE.BoxGeometry(0.15, 0.03, 0.05);
    const mouthMaterial = new THREE.MeshStandardMaterial({
      color: 0xaa6655,
      roughness: 0.5,
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 2.0, 0.26);
    this.mesh.add(mouth);

    // EYEBROWS - For expression
    const browGeometry = new THREE.BoxGeometry(0.12, 0.02, 0.02);
    const browMaterial = new THREE.MeshStandardMaterial({
      color: hairColor,
      roughness: 0.9,
    });

    const leftBrow = new THREE.Mesh(browGeometry, browMaterial);
    leftBrow.position.set(-0.1, 2.28, 0.25);
    leftBrow.rotation.z = -0.1;
    this.mesh.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeometry, browMaterial);
    rightBrow.position.set(0.1, 2.28, 0.25);
    rightBrow.rotation.z = 0.1;
    this.mesh.add(rightBrow);

    // EARS - Small cylinders on sides
    const earGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    earGeometry.scale(0.5, 1, 0.3);
    const earMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.7,
    });

    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.28, 2.15, 0);
    this.mesh.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.28, 2.15, 0);
    this.mesh.add(rightEar);

    // HAIR - More realistic style
    const hairGeometry = new THREE.SphereGeometry(
      0.3,
      16,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.55
    );
    const hairMaterial = new THREE.MeshStandardMaterial({
      color: hairColor,
      roughness: 0.9,
    });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 2.32;
    hair.castShadow = true;
    this.mesh.add(hair);

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.12, 0.14, 0.25, 12);
    const neckMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.7,
    });
    const neck = new THREE.Mesh(neckGeometry, neckMaterial);
    neck.position.y = 1.85;
    neck.castShadow = true;
    this.mesh.add(neck);

    // Arms - More realistic with muscle definition
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.09, 0.75, 16);
    const armMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.7,
      metalness: 0.0,
    });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.45, 1.4, 0);
    leftArm.castShadow = true;
    leftArm.receiveShadow = true;
    this.mesh.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.45, 1.4, 0);
    rightArm.castShadow = true;
    rightArm.receiveShadow = true;
    this.mesh.add(rightArm);

    // Forearms for more detail
    const forearmGeometry = new THREE.CylinderGeometry(0.08, 0.09, 0.4, 16);
    const leftForearm = new THREE.Mesh(forearmGeometry, armMaterial);
    leftForearm.position.set(-0.45, 0.85, 0);
    leftForearm.castShadow = true;
    this.mesh.add(leftForearm);

    const rightForearm = new THREE.Mesh(forearmGeometry, armMaterial);
    rightForearm.position.set(0.45, 0.85, 0);
    rightForearm.castShadow = true;
    this.mesh.add(rightForearm);

    // Hands
    const handGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    const leftHand = new THREE.Mesh(handGeometry, armMaterial);
    leftHand.position.set(-0.45, 0.6, 0);
    leftHand.castShadow = true;
    this.mesh.add(leftHand);

    const rightHand = new THREE.Mesh(handGeometry, armMaterial);
    rightHand.position.set(0.45, 0.6, 0);
    rightHand.castShadow = true;
    this.mesh.add(rightHand);

    // Legs - Athletic with better proportions
    const legGeometry = new THREE.CylinderGeometry(0.14, 0.12, 0.85, 16);
    const legMaterial = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.5,
      metalness: 0.15,
    });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.2, 0.52, 0);
    leftLeg.castShadow = true;
    leftLeg.receiveShadow = true;
    this.mesh.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.2, 0.52, 0);
    rightLeg.castShadow = true;
    rightLeg.receiveShadow = true;
    this.mesh.add(rightLeg);

    // Basketball Shoes - Nike/Jordan style with detail
    const shoeGeometry = new THREE.BoxGeometry(0.2, 0.18, 0.35);
    const shoeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.3,
      envMapIntensity: 0.6,
    });

    const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    leftShoe.position.set(-0.2, 0.1, 0.05);
    leftShoe.castShadow = true;
    leftShoe.receiveShadow = true;
    this.mesh.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    rightShoe.position.set(0.2, 0.1, 0.05);
    rightShoe.castShadow = true;
    rightShoe.receiveShadow = true;
    this.mesh.add(rightShoe);

    // Shoe soles - rubber material
    const soleGeometry = new THREE.BoxGeometry(0.22, 0.05, 0.37);
    const soleMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.9,
      metalness: 0.1,
    });

    const leftSole = new THREE.Mesh(soleGeometry, soleMaterial);
    leftSole.position.set(-0.2, 0.025, 0.05);
    leftSole.castShadow = true;
    this.mesh.add(leftSole);

    const rightSole = new THREE.Mesh(soleGeometry, soleMaterial);
    rightSole.position.set(0.2, 0.025, 0.05);
    rightSole.castShadow = true;
    this.mesh.add(rightSole);

    // Store body parts for animation
    this.bodyParts = {
      chest,
      waist,
      leftShoulder,
      rightShoulder,
      head,
      neck,
      leftArm,
      rightArm,
      leftForearm,
      rightForearm,
      leftHand,
      rightHand,
      leftLeg,
      rightLeg,
      hair,
      nose,
      mouth,
      leftEyeWhite,
      rightEyeWhite,
      leftPupil,
      rightPupil,
    };

    // Movement properties
    this.velocity = new THREE.Vector3();
    this.speed = 0.18;
    this.hasBall = false;
    this.target = null;
    this.aiState = "idle";
  }

  update() {
    // Update position
    this.mesh.position.add(this.velocity);
    this.velocity.multiplyScalar(0.88); // Better friction

    // Realistic athletic animation
    if (this.velocity.length() > 0.01) {
      const time = Date.now() * 0.007;
      const speed = this.velocity.length();

      // Natural running arm swing
      this.bodyParts.leftUpperArm.rotation.x = Math.sin(time * 2.2) * 0.6;
      this.bodyParts.rightUpperArm.rotation.x = -Math.sin(time * 2.2) * 0.6;
      this.bodyParts.leftForearm.rotation.x = Math.max(
        0,
        Math.sin(time * 2.2) * 0.4
      );
      this.bodyParts.rightForearm.rotation.x = Math.max(
        0,
        -Math.sin(time * 2.2) * 0.4
      );

      // Leg movement - realistic running
      this.bodyParts.leftThigh.rotation.x = Math.sin(time * 2.2) * 0.5;
      this.bodyParts.rightThigh.rotation.x = -Math.sin(time * 2.2) * 0.5;
      this.bodyParts.leftCalf.rotation.x = Math.max(
        0,
        Math.sin(time * 2.2) * 0.3
      );
      this.bodyParts.rightCalf.rotation.x = Math.max(
        0,
        -Math.sin(time * 2.2) * 0.3
      );

      // Body lean forward when sprinting
      this.bodyParts.chest.rotation.x = speed * 0.25;
      this.bodyParts.waist.rotation.x = speed * 0.15;

      // Slight shoulder rotation
      this.bodyParts.leftShoulder.rotation.z = Math.sin(time * 2.2) * 0.1;
      this.bodyParts.rightShoulder.rotation.z = -Math.sin(time * 2.2) * 0.1;

      // Head bob and movement
      this.bodyParts.headGroup.position.y =
        2.05 + Math.abs(Math.sin(time * 2.2)) * 0.04;
    } else {
      // Return to neutral stance smoothly
      this.bodyParts.leftUpperArm.rotation.x *= 0.9;
      this.bodyParts.rightUpperArm.rotation.x *= 0.9;
      this.bodyParts.leftForearm.rotation.x *= 0.9;
      this.bodyParts.rightForearm.rotation.x *= 0.9;
      this.bodyParts.leftThigh.rotation.x *= 0.9;
      this.bodyParts.rightThigh.rotation.x *= 0.9;
      this.bodyParts.leftCalf.rotation.x *= 0.9;
      this.bodyParts.rightCalf.rotation.x *= 0.9;
      this.bodyParts.chest.rotation.x *= 0.9;
      this.bodyParts.waist.rotation.x *= 0.9;
      this.bodyParts.leftShoulder.rotation.z *= 0.9;
      this.bodyParts.rightShoulder.rotation.z *= 0.9;
      this.bodyParts.headGroup.position.y = 2.05;
    }

    // Keep on court
    this.mesh.position.x = Math.max(-13, Math.min(13, this.mesh.position.x));
    this.mesh.position.z = Math.max(-7, Math.min(7, this.mesh.position.z));

    // AI behavior
    if (this !== gameState.controlledPlayer && gameState.gameActive) {
      this.runAI();
    }
  }

  runAI() {
    if (this.hasBall) {
      this.aiWithBall();
    } else if (this.team === gameState.possession) {
      this.aiOffense();
    } else {
      this.aiDefense();
    }
  }

  aiWithBall() {
    // Decide: shoot, pass, or dribble
    const hoopPos =
      this.team === "home"
        ? new THREE.Vector3(0, 3, -6)
        : new THREE.Vector3(0, 3, 6);
    const distToHoop = this.mesh.position.distanceTo(
      new THREE.Vector3(hoopPos.x, 0, hoopPos.z)
    );

    if (distToHoop < 5 && Math.random() < 0.02) {
      this.shoot();
    } else {
      // Move toward hoop
      const direction = new THREE.Vector3();
      direction.subVectors(hoopPos, this.mesh.position).normalize();
      this.velocity.add(direction.multiplyScalar(this.speed * 0.5));
    }
  }

  aiOffense() {
    // Move to open space
    if (!ball.inAir) {
      const target = this.getOffensivePosition();
      const direction = new THREE.Vector3();
      direction.subVectors(target, this.mesh.position).normalize();
      this.velocity.add(direction.multiplyScalar(this.speed * 0.3));
    }
  }

  aiDefense() {
    // Guard opponent or ball
    const target = ball.mesh.position.clone();
    target.y = 0;
    const direction = new THREE.Vector3();
    direction.subVectors(target, this.mesh.position).normalize();
    if (this.mesh.position.distanceTo(target) > 2) {
      this.velocity.add(direction.multiplyScalar(this.speed * 0.4));
    }
  }

  getOffensivePosition() {
    const side = this.team === "home" ? -1 : 1;
    const positions = {
      PG: new THREE.Vector3(0, 0, side * 3),
      SG: new THREE.Vector3(4, 0, side * 2),
      SF: new THREE.Vector3(-4, 0, side * 2),
      PF: new THREE.Vector3(3, 0, side * 5),
      C: new THREE.Vector3(-3, 0, side * 5),
    };
    return positions[this.position] || new THREE.Vector3(0, 0, 0);
  }

  shoot() {
    if (!this.hasBall) return;

    const hoopPos =
      this.team === "home"
        ? new THREE.Vector3(0, 3, -6)
        : new THREE.Vector3(0, 3, 6);
    const distance = this.mesh.position.distanceTo(
      new THREE.Vector3(hoopPos.x, 0, hoopPos.z)
    );

    // Calculate shot accuracy based on distance
    const accuracy = Math.max(0.3, 1 - distance / 15);
    const make = Math.random() < accuracy;

    ball.shoot(hoopPos, make);
    this.hasBall = false;
    gameState.ballHandler = null;

    showMessage("SHOT!");
  }

  pass() {
    if (!this.hasBall) return;

    // Find closest teammate
    const teammates = this.team === "home" ? homeTeam : awayTeam;
    let closest = null;
    let closestDist = Infinity;

    teammates.forEach((teammate) => {
      if (teammate !== this) {
        const dist = this.mesh.position.distanceTo(teammate.mesh.position);
        if (dist < closestDist) {
          closestDist = dist;
          closest = teammate;
        }
      }
    });

    if (closest) {
      ball.passto(closest);
      this.hasBall = false;
      this.stats.assists++;
      updatePlayerStats();
    }
  }
}

// Ball Class
class Ball {
  constructor() {
    // Create realistic basketball
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);

    // Basketball texture pattern
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Orange basketball
    ctx.fillStyle = "#ff6b35";
    ctx.fillRect(0, 0, 512, 512);

    // Black lines
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;

    // Curved lines
    ctx.beginPath();
    ctx.arc(256, 256, 200, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(256, 56);
    ctx.lineTo(256, 456);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(56, 256);
    ctx.lineTo(456, 256);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.05,
      normalScale: new THREE.Vector2(0.3, 0.3),
      envMapIntensity: 0.6,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 0.3, 0);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    this.velocity = new THREE.Vector3();
    this.inAir = false;
    this.targetPlayer = null;
  }

  update() {
    if (this.inAir) {
      this.mesh.position.add(this.velocity);
      this.velocity.y -= 0.02; // Gravity

      // Spin the ball when in air
      this.mesh.rotation.x += 0.15;
      this.mesh.rotation.z += 0.1;

      // Check if ball lands
      if (this.mesh.position.y <= 0.3) {
        this.mesh.position.y = 0.3;
        this.inAir = false;
        this.velocity.set(0, 0, 0);
        checkScore();
        findNearestPlayerForBall();
      }
    } else if (gameState.ballHandler) {
      // Dribbling animation when player is moving with ball
      const isMoving = gameState.ballHandler.velocity.length() > 0.01;

      if (isMoving) {
        // Dribble animation - ball bounces
        const time = Date.now() * 0.01;
        const bounceHeight = Math.abs(Math.sin(time)) * 0.6;

        this.mesh.position.copy(gameState.ballHandler.mesh.position);
        this.mesh.position.y = 0.3 + bounceHeight; // Bounce between ground and hand
        this.mesh.position.x += 0.3;

        // Rotate ball during dribble
        this.mesh.rotation.x += 0.1;
      } else {
        // Holding ball in hand when standing still
        this.mesh.position.copy(gameState.ballHandler.mesh.position);
        this.mesh.position.y = 1.8;
        this.mesh.position.x += 0.4; // In right hand
      }
    }
  }

  shoot(target, willMake) {
    this.inAir = true;
    const direction = new THREE.Vector3();
    direction.subVectors(target, this.mesh.position);

    const distance = direction.length();
    direction.normalize();

    // Add arc to shot
    this.velocity.copy(direction.multiplyScalar(0.3));
    this.velocity.y = 0.35 + distance * 0.02;

    // Add randomness if miss
    if (!willMake) {
      this.velocity.x += (Math.random() - 0.5) * 0.15;
      this.velocity.z += (Math.random() - 0.5) * 0.15;
    }
  }

  passto(player) {
    this.inAir = true;
    this.targetPlayer = player;
    const direction = new THREE.Vector3();
    direction.subVectors(player.mesh.position, this.mesh.position);
    direction.normalize();

    this.velocity.copy(direction.multiplyScalar(0.25));
    this.velocity.y = 0.15;

    setTimeout(() => {
      if (this.targetPlayer) {
        giveBallToPlayer(this.targetPlayer);
      }
    }, 500);
  }
}

// Ball trail effect
let ballTrail = [];
const maxTrailLength = 15;

function updateBallTrail() {
  if (ball.inAir && ball.velocity.length() > 0.1) {
    // Add trail point
    const trailPoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      new THREE.MeshBasicMaterial({
        color: 0xff6b35,
        transparent: true,
        opacity: 0.5,
      })
    );
    trailPoint.position.copy(ball.mesh.position);
    scene.add(trailPoint);
    ballTrail.push({ mesh: trailPoint, life: 1.0 });

    // Remove old trail points
    if (ballTrail.length > maxTrailLength) {
      const old = ballTrail.shift();
      scene.remove(old.mesh);
    }
  }

  // Update trail opacity
  ballTrail.forEach((point, index) => {
    point.life -= 0.08;
    point.mesh.material.opacity = point.life * 0.5;
    point.mesh.scale.setScalar(point.life);

    if (point.life <= 0) {
      scene.remove(point.mesh);
      ballTrail.splice(index, 1);
    }
  });
}

// Initialize Game
function init() {
  // Scene with professional atmosphere
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);
  scene.fog = new THREE.Fog(0x0a0a0a, 40, 80);

  // Camera - NBA 2K broadcast angle
  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 18, 22);
  camera.lookAt(0, 0, 0);

  // Renderer with ultra-high quality
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  // Post-processing for ultra-realistic graphics
  setupPostProcessing();

  // Professional Stadium Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Main arena light from above
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
  mainLight.position.set(0, 30, 0);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 4096;
  mainLight.shadow.mapSize.height = 4096;
  mainLight.shadow.camera.left = -25;
  mainLight.shadow.camera.right = 25;
  mainLight.shadow.camera.top = 25;
  mainLight.shadow.camera.bottom = -25;
  mainLight.shadow.bias = -0.0001;
  scene.add(mainLight);

  // Stadium spotlights - Four corners like real arena
  const spotlightPositions = [
    [-15, 25, -10],
    [15, 25, -10],
    [-15, 25, 10],
    [15, 25, 10],
  ];

  spotlightPositions.forEach((pos) => {
    const spotlight = new THREE.SpotLight(0xffffee, 1.2);
    spotlight.position.set(pos[0], pos[1], pos[2]);
    spotlight.angle = Math.PI / 5;
    spotlight.penumbra = 0.3;
    spotlight.decay = 2;
    spotlight.distance = 50;
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 2048;
    spotlight.shadow.mapSize.height = 2048;
    scene.add(spotlight);
    spotlights.push(spotlight);

    // Add visible light beam
    const lightBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 4, 25, 8, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xffffaa,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
      })
    );
    lightBeam.position.set(pos[0], pos[1] - 12.5, pos[2]);
    scene.add(lightBeam);
  });

  // Add rim lights for atmosphere
  const rimLight1 = new THREE.DirectionalLight(0x4488ff, 0.5);
  rimLight1.position.set(-20, 10, 0);
  scene.add(rimLight1);

  const rimLight2 = new THREE.DirectionalLight(0xff4444, 0.5);
  rimLight2.position.set(20, 10, 0);
  scene.add(rimLight2);

  // Create stadium environment
  createStadium();
  createCrowd();
  createJumbotron();

  // Create court
  createCourt();

  // Create hoops
  createHoop(new THREE.Vector3(0, 3, -6), "home");
  createHoop(new THREE.Vector3(0, 3, 6), "away");

  // Create players
  createTeams();

  // Create ball
  ball = new Ball();

  // Event listeners
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("resize", onWindowResize);

  // Menu buttons
  const startBtn = document.getElementById("startGameBtn");
  const playAgainBtn = document.getElementById("playAgainBtn");

  if (startBtn) {
    startBtn.addEventListener("click", startGame);
    console.log("✅ Start button event listener attached");
  } else {
    console.error("❌ Start button not found!");
  }

  if (playAgainBtn) {
    playAgainBtn.addEventListener("click", resetGame);
  }

  // Start animation
  animate();
}

// Setup Post-Processing for Ultra-High Graphics
function setupPostProcessing() {
  // Check if post-processing libraries are available
  if (
    typeof THREE.EffectComposer === "undefined" ||
    typeof THREE.RenderPass === "undefined" ||
    typeof THREE.UnrealBloomPass === "undefined"
  ) {
    console.warn(
      "⚠️ Post-processing libraries not loaded. Using standard rendering."
    );
    return;
  }

  try {
    // Create effect composer
    composer = new THREE.EffectComposer(renderer);

    // Render pass - main scene render
    renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Bloom pass for glowing lights and realistic lighting
    bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.6, // strength
      0.8, // radius
      0.3 // threshold
    );
    composer.addPass(bloomPass);

    // Final pass to screen
    const copyPass = new THREE.ShaderPass(THREE.CopyShader);
    copyPass.renderToScreen = true;
    composer.addPass(copyPass);

    console.log("✨ Ultra-High Graphics Post-Processing Enabled");
  } catch (error) {
    console.warn(
      "⚠️ Post-processing setup failed. Using standard rendering.",
      error
    );
    composer = null;
  }
}

// Create Professional Stadium Structure
function createStadium() {
  // Arena floor base
  const floorGeometry = new THREE.CircleGeometry(45, 64);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.9,
    metalness: 0.1,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  floor.receiveShadow = true;
  scene.add(floor);

  // Seating tiers - Multiple levels like real arena
  const seatLevels = [
    { radius: 18, height: 2, color: 0x2a2a3a },
    { radius: 22, height: 5, color: 0x252535 },
    { radius: 26, height: 8, color: 0x202030 },
    { radius: 30, height: 11, color: 0x1a1a2a },
  ];

  seatLevels.forEach((level) => {
    const seatingGeometry = new THREE.CylinderGeometry(
      level.radius,
      level.radius,
      3,
      64,
      1,
      true
    );
    const seatingMaterial = new THREE.MeshStandardMaterial({
      color: level.color,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const seating = new THREE.Mesh(seatingGeometry, seatingMaterial);
    seating.position.y = level.height;
    scene.add(seating);

    // Add row dividers for detail
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      const divider = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 3, level.radius * 0.3),
        new THREE.MeshStandardMaterial({ color: 0x151520 })
      );
      divider.position.x = Math.cos(angle) * level.radius;
      divider.position.z = Math.sin(angle) * level.radius;
      divider.position.y = level.height;
      divider.rotation.y = angle;
      scene.add(divider);
    }
  });

  // Upper arena structure
  const upperStructure = new THREE.Mesh(
    new THREE.CylinderGeometry(32, 30, 8, 64, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 0.9,
      side: THREE.DoubleSide,
    })
  );
  upperStructure.position.y = 20;
  scene.add(upperStructure);

  // Ceiling with exposed beams
  const ceiling = new THREE.Mesh(
    new THREE.CylinderGeometry(32, 32, 1, 64),
    new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 1.0,
    })
  );
  ceiling.position.y = 28;
  scene.add(ceiling);

  // Add rafters/beams
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 60),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    );
    beam.position.y = 26;
    beam.rotation.y = angle;
    scene.add(beam);
  }

  // Sponsor boards around arena
  const sponsorTexts = ["NIKE", "GATORADE", "STATE FARM", "AT&T"];
  sponsorTexts.forEach((text, i) => {
    const angle = (i / 4) * Math.PI * 2;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1a1a2a";
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, 256, 80);

    const texture = new THREE.CanvasTexture(canvas);
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 2),
      new THREE.MeshBasicMaterial({ map: texture })
    );
    board.position.x = Math.cos(angle) * 17;
    board.position.z = Math.sin(angle) * 17;
    board.position.y = 10;
    board.rotation.y = angle + Math.PI;
    scene.add(board);
  });
}

// Create Realistic Crowd
function createCrowd() {
  const crowdColors = [
    0xff3333, 0x3333ff, 0xffaa00, 0x33ff33, 0xff33ff, 0x33ffff,
  ];

  // Fill seating areas with crowd
  for (let tier = 0; tier < 4; tier++) {
    const radius = 18 + tier * 4;
    const height = 2 + tier * 3;
    const numPeople = 80 + tier * 20;

    for (let i = 0; i < numPeople; i++) {
      const angle = (i / numPeople) * Math.PI * 2;
      const radiusVar = radius + (Math.random() - 0.5) * 2;

      // Simple person representation
      const person = new THREE.Group();

      // Body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.5, 0.2),
        new THREE.MeshStandardMaterial({
          color: crowdColors[Math.floor(Math.random() * crowdColors.length)],
          roughness: 0.8,
        })
      );
      body.position.y = 0.3;
      person.add(body);

      // Head
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffdbac })
      );
      head.position.y = 0.65;
      person.add(head);

      person.position.x = Math.cos(angle) * radiusVar;
      person.position.z = Math.sin(angle) * radiusVar;
      person.position.y = height;
      person.rotation.y = angle + Math.PI + (Math.random() - 0.5) * 0.5;

      scene.add(person);
      crowd.push(person);
    }
  }
}

// Create Center Jumbotron
function createJumbotron() {
  // Main jumbotron structure
  const jumbotronGroup = new THREE.Group();

  // Screen panels - four sides
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    // Scoreboard display
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, "#1a1a2a");
    gradient.addColorStop(1, "#0a0a1a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("WIZARDS ARENA", 256, 80);

    ctx.font = "bold 72px Arial";
    ctx.fillStyle = "#ffd700";
    ctx.fillText("0 - 0", 256, 180);

    const texture = new THREE.CanvasTexture(canvas);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 3),
      new THREE.MeshBasicMaterial({
        map: texture,
        emissive: 0x444444,
        emissiveIntensity: 0.5,
      })
    );

    screen.position.x = Math.cos(angle) * 3;
    screen.position.z = Math.sin(angle) * 3;
    screen.rotation.y = angle + Math.PI;

    jumbotronGroup.add(screen);
  }

  // Jumbotron frame
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(7, 0.5, 7),
    new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.2,
    })
  );
  jumbotronGroup.add(frame);

  jumbotronGroup.position.y = 22;
  scene.add(jumbotronGroup);
  jumbotron = jumbotronGroup;
}

function createCourt() {
  // Professional hardwood court floor
  const courtGeometry = new THREE.PlaneGeometry(28, 15);

  // Create realistic wood texture
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Hardwood base color with gradient
  const gradient = ctx.createLinearGradient(0, 0, 1024, 512);
  gradient.addColorStop(0, "#daa06d");
  gradient.addColorStop(0.5, "#c8936b");
  gradient.addColorStop(1, "#daa06d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 512);

  // Add wood grain texture
  for (let i = 0; i < 200; i++) {
    ctx.strokeStyle = `rgba(139, 90, 43, ${Math.random() * 0.15})`;
    ctx.lineWidth = Math.random() * 2 + 0.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * 1024, Math.random() * 512);
    ctx.lineTo(Math.random() * 1024, Math.random() * 512);
    ctx.stroke();
  }

  // Add wood plank lines
  for (let i = 0; i < 15; i++) {
    ctx.strokeStyle = "rgba(139, 90, 43, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, i * 35);
    ctx.lineTo(1024, i * 35);
    ctx.stroke();
  }

  // Add glossy finish effect
  const glossGradient = ctx.createRadialGradient(512, 256, 50, 512, 256, 400);
  glossGradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
  glossGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glossGradient;
  ctx.fillRect(0, 0, 1024, 512);

  const courtTexture = new THREE.CanvasTexture(canvas);
  courtTexture.wrapS = THREE.RepeatWrapping;
  courtTexture.wrapT = THREE.RepeatWrapping;

  const courtMaterial = new THREE.MeshStandardMaterial({
    map: courtTexture,
    roughness: 0.15,
    metalness: 0.35,
    envMapIntensity: 1.2,
    clearcoat: 0.3,
    clearcoatRoughness: 0.1,
  });

  court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.rotation.x = -Math.PI / 2;
  court.receiveShadow = true;
  scene.add(court);

  // Court border - dark wood
  const borderMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a3728,
    roughness: 0.8,
  });
  const borderThickness = 0.8;

  const sideBorder1 = new THREE.Mesh(
    new THREE.PlaneGeometry(28, borderThickness),
    borderMaterial
  );
  sideBorder1.rotation.x = -Math.PI / 2;
  sideBorder1.position.set(0, 0.01, -7.5 - borderThickness / 2);
  sideBorder1.receiveShadow = true;
  scene.add(sideBorder1);

  const sideBorder2 = new THREE.Mesh(
    new THREE.PlaneGeometry(28, borderThickness),
    borderMaterial
  );
  sideBorder2.rotation.x = -Math.PI / 2;
  sideBorder2.position.set(0, 0.01, 7.5 + borderThickness / 2);
  sideBorder2.receiveShadow = true;
  scene.add(sideBorder2);

  // Court lines - Bright white like NBA
  const lineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
  });

  // Center line
  const centerLine = new THREE.Mesh(
    new THREE.PlaneGeometry(0.12, 15),
    lineMaterial
  );
  centerLine.rotation.x = -Math.PI / 2;
  centerLine.position.y = 0.02;
  scene.add(centerLine);

  // Center circle
  const centerCircle = new THREE.Mesh(
    new THREE.RingGeometry(1.8, 1.92, 64),
    lineMaterial
  );
  centerCircle.rotation.x = -Math.PI / 2;
  centerCircle.position.y = 0.02;
  scene.add(centerCircle);

  // Team logo at center - Wizards style
  const logoCanvas = document.createElement("canvas");
  logoCanvas.width = 256;
  logoCanvas.height = 256;
  const logoCtx = logoCanvas.getContext("2d");

  // Draw team logo circle
  const logoGradient = logoCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
  logoGradient.addColorStop(0, "#1e3a8a");
  logoGradient.addColorStop(0.7, "#1e40af");
  logoGradient.addColorStop(1, "#1e3a8a");
  logoCtx.fillStyle = logoGradient;
  logoCtx.beginPath();
  logoCtx.arc(128, 128, 120, 0, Math.PI * 2);
  logoCtx.fill();

  // Add decorative ring
  logoCtx.strokeStyle = "#dc2626";
  logoCtx.lineWidth = 8;
  logoCtx.beginPath();
  logoCtx.arc(128, 128, 110, 0, Math.PI * 2);
  logoCtx.stroke();

  // Add team text
  logoCtx.fillStyle = "#ffffff";
  logoCtx.font = "bold 48px Arial";
  logoCtx.textAlign = "center";
  logoCtx.fillText("WIZARDS", 128, 120);
  logoCtx.font = "bold 32px Arial";
  logoCtx.fillText("ARENA", 128, 160);

  const logoTexture = new THREE.CanvasTexture(logoCanvas);
  const logo = new THREE.Mesh(
    new THREE.CircleGeometry(1.6, 64),
    new THREE.MeshBasicMaterial({
      map: logoTexture,
      transparent: true,
      opacity: 0.9,
    })
  );
  logo.rotation.x = -Math.PI / 2;
  logo.position.y = 0.03;
  scene.add(logo);

  // Three-point lines with proper NBA dimensions
  const threePointGeometry = new THREE.TorusGeometry(
    6.75,
    0.06,
    8,
    64,
    Math.PI
  );

  const threeLine1 = new THREE.Mesh(threePointGeometry, lineMaterial);
  threeLine1.rotation.x = Math.PI / 2;
  threeLine1.position.set(0, 0.02, -6.5);
  scene.add(threeLine1);

  const threeLine2 = new THREE.Mesh(threePointGeometry, lineMaterial);
  threeLine2.rotation.x = Math.PI / 2;
  threeLine2.rotation.z = Math.PI;
  threeLine2.position.set(0, 0.02, 6.5);
  scene.add(threeLine2);

  // Paint/key areas - team colors
  const paintGeometry = new THREE.PlaneGeometry(4.8, 5.8);

  // Home paint (blue)
  const homePaintMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    transparent: true,
    opacity: 0.4,
    roughness: 0.3,
    metalness: 0.1,
  });
  const paint1 = new THREE.Mesh(paintGeometry, homePaintMaterial);
  paint1.rotation.x = -Math.PI / 2;
  paint1.position.set(0, 0.015, -6.5);
  paint1.receiveShadow = true;
  scene.add(paint1);

  // Away paint (red)
  const awayPaintMaterial = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    transparent: true,
    opacity: 0.4,
    roughness: 0.3,
    metalness: 0.1,
  });
  const paint2 = new THREE.Mesh(paintGeometry, awayPaintMaterial);
  paint2.rotation.x = -Math.PI / 2;
  paint2.position.set(0, 0.015, 6.5);
  paint2.receiveShadow = true;
  scene.add(paint2);

  // Free throw circles
  const ftCircle1 = new THREE.Mesh(
    new THREE.RingGeometry(1.8, 1.92, 64, 1, 0, Math.PI),
    lineMaterial
  );
  ftCircle1.rotation.x = -Math.PI / 2;
  ftCircle1.position.set(0, 0.02, -4);
  scene.add(ftCircle1);

  const ftCircle2 = new THREE.Mesh(
    new THREE.RingGeometry(1.8, 1.92, 64, 1, 0, Math.PI),
    lineMaterial
  );
  ftCircle2.rotation.x = -Math.PI / 2;
  ftCircle2.rotation.z = Math.PI;
  ftCircle2.position.set(0, 0.02, 4);
  scene.add(ftCircle2);

  // Free throw line
  const ftLine1 = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 0.1),
    lineMaterial
  );
  ftLine1.rotation.x = -Math.PI / 2;
  ftLine1.position.set(0, 0.02, -5.8);
  scene.add(ftLine1);

  const ftLine2 = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 0.1),
    lineMaterial
  );
  ftLine2.rotation.x = -Math.PI / 2;
  ftLine2.position.set(0, 0.02, 5.8);
  scene.add(ftLine2);
}

function createHoop(position, team) {
  // Professional backboard
  const backboardGeometry = new THREE.BoxGeometry(3.5, 2.2, 0.15);
  const backboardMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    roughness: 0.3,
    metalness: 0.5,
  });
  const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
  backboard.position.copy(position);
  backboard.position.y += 1.2;
  backboard.castShadow = true;
  backboard.receiveShadow = true;
  scene.add(backboard);

  // Backboard frame
  const frameGeometry = new THREE.BoxGeometry(3.6, 2.3, 0.1);
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xff4500,
    metalness: 0.8,
    roughness: 0.2,
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.copy(position);
  frame.position.y += 1.2;
  frame.position.z += team === "home" ? 0.05 : -0.05;
  scene.add(frame);

  // Rim - Orange
  const rimGeometry = new THREE.TorusGeometry(0.45, 0.06, 8, 32);
  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6347,
    metalness: 0.7,
    roughness: 0.3,
  });
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.position.copy(position);
  rim.rotation.x = Math.PI / 2;
  rim.castShadow = true;
  scene.add(rim);

  // Net - White chain net
  const netGeometry = new THREE.CylinderGeometry(0.45, 0.52, 0.6, 12, 3, true);
  const netMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.7,
  });
  const net = new THREE.Mesh(netGeometry, netMaterial);
  net.position.copy(position);
  net.position.y -= 0.3;
  scene.add(net);

  // Support structure
  const supportGeometry = new THREE.BoxGeometry(0.3, 3, 0.3);
  const supportMaterial = new THREE.MeshStandardMaterial({
    color: 0x404040,
    metalness: 0.6,
    roughness: 0.4,
  });
  const support = new THREE.Mesh(supportGeometry, supportMaterial);
  support.position.copy(position);
  support.position.y = 1.5;
  support.position.z += team === "home" ? 0.8 : -0.8;
  support.castShadow = true;
  scene.add(support);

  // Arm connecting backboard to support
  const armGeometry = new THREE.BoxGeometry(0.2, 0.2, 1);
  const arm = new THREE.Mesh(armGeometry, supportMaterial);
  arm.position.copy(position);
  arm.position.y = 3;
  arm.position.z += team === "home" ? 0.4 : -0.4;
  scene.add(arm);
}

function createTeams() {
  // Home team (green) - bottom of screen
  const homePositions = [
    { pos: "PG", x: 0, z: 4 },
    { pos: "SG", x: -4, z: 3 },
    { pos: "SF", x: 4, z: 3 },
    { pos: "PF", x: -3, z: 5 },
    { pos: "C", x: 3, z: 5 },
  ];

  homePositions.forEach((p, i) => {
    const player = new Player("home", i + 1, p.pos, p.x, p.z);
    homeTeam.push(player);
    players.push(player);
  });

  // Away team (red) - top of screen
  const awayPositions = [
    { pos: "PG", x: 0, z: -4 },
    { pos: "SG", x: -4, z: -3 },
    { pos: "SF", x: 4, z: -3 },
    { pos: "PF", x: -3, z: -5 },
    { pos: "C", x: 3, z: -5 },
  ];

  awayPositions.forEach((p, i) => {
    const player = new Player("away", i + 1, p.pos, p.x, p.z);
    awayTeam.push(player);
    players.push(player);
  });

  // Set controlled player
  gameState.controlledPlayer = homeTeam[0];
}

function startGame() {
  console.log("🎮 Starting game...");

  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("gameHUD").style.display = "block";

  quarterLength = parseInt(document.getElementById("quarterLength").value) * 60;
  gameState.gameTime = quarterLength;
  gameState.gameActive = true;

  // Give ball to home team
  giveBallToPlayer(homeTeam[0]);

  updateUI();

  console.log("✅ Game started!");
}

function giveBallToPlayer(player) {
  gameState.ballHandler = player;
  player.hasBall = true;
  gameState.possession = player.team;
  gameState.shotClock = 24;

  document.getElementById("possession").textContent = `${
    player.team === "home" ? "⬆️ HOME" : "⬇️ AWAY"
  } BALL`;
}

function findNearestPlayerForBall() {
  let nearest = null;
  let nearestDist = Infinity;

  players.forEach((player) => {
    const dist = player.mesh.position.distanceTo(ball.mesh.position);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = player;
    }
  });

  if (nearest && nearestDist < 1.5) {
    giveBallToPlayer(nearest);
  }
}

function checkScore() {
  const homeHoop = new THREE.Vector3(0, 3, -6);
  const awayHoop = new THREE.Vector3(0, 3, 6);

  const distToHomeHoop = ball.mesh.position.distanceTo(homeHoop);
  const distToAwayHoop = ball.mesh.position.distanceTo(awayHoop);

  if (distToHomeHoop < 0.5 && ball.mesh.position.y > 2.5) {
    // Away team scored
    gameState.awayScore += 2;
    showMessage("AWAY SCORES! 🏀");
    if (gameState.ballHandler) {
      gameState.ballHandler.stats.points += 2;
    }
    updateUI();
  } else if (distToAwayHoop < 0.5 && ball.mesh.position.y > 2.5) {
    // Home team scored
    gameState.homeScore += 2;
    showMessage("HOME SCORES! 🏀");
    if (gameState.ballHandler) {
      gameState.ballHandler.stats.points += 2;
    }
    updateUI();
  }
}

function updateUI() {
  document.getElementById("homeScore").textContent = gameState.homeScore;
  document.getElementById("awayScore").textContent = gameState.awayScore;
  document.getElementById("quarter").textContent = `Q${gameState.quarter}`;

  const minutes = Math.floor(gameState.gameTime / 60);
  const seconds = gameState.gameTime % 60;
  document.getElementById("gameClock").textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  document.getElementById("shotClock").textContent = gameState.shotClock;

  if (gameState.shotClock < 5) {
    document.getElementById("shotClock").classList.add("warning");
  } else {
    document.getElementById("shotClock").classList.remove("warning");
  }
}

function updatePlayerStats() {
  if (gameState.controlledPlayer) {
    document.getElementById(
      "controlledPlayerName"
    ).textContent = `Player #${gameState.controlledPlayer.number} (${gameState.controlledPlayer.position})`;
    document.getElementById("playerPoints").textContent =
      gameState.controlledPlayer.stats.points;
    document.getElementById("playerAssists").textContent =
      gameState.controlledPlayer.stats.assists;
  }
}

function showMessage(text) {
  const msg = document.getElementById("gameMessage");
  msg.textContent = text;
  setTimeout(() => {
    msg.textContent = "";
  }, 2000);
}

function endGame() {
  gameState.gameActive = false;
  document.getElementById("gameOverScreen").style.display = "block";
  document.getElementById("homeFinalScore").textContent = gameState.homeScore;
  document.getElementById("awayFinalScore").textContent = gameState.awayScore;

  if (gameState.homeScore > gameState.awayScore) {
    document.getElementById("winnerText").textContent = "HOME TEAM WINS! 🏆";
  } else if (gameState.awayScore > gameState.homeScore) {
    document.getElementById("winnerText").textContent = "AWAY TEAM WINS! 🏆";
  } else {
    document.getElementById("winnerText").textContent = "TIE GAME!";
  }
}

function resetGame() {
  gameState.homeScore = 0;
  gameState.awayScore = 0;
  gameState.quarter = 1;
  gameState.gameTime = quarterLength;
  gameState.shotClock = 24;

  document.getElementById("gameOverScreen").style.display = "none";
  document.getElementById("mainMenu").style.display = "block";
  document.getElementById("gameHUD").style.display = "none";

  // Reset player positions
  players.forEach((player) => {
    player.stats = { points: 0, assists: 0, rebounds: 0, steals: 0 };
  });
}

// Input handling
function onKeyDown(e) {
  keys[e.key.toLowerCase()] = true;

  if (!gameState.controlledPlayer) return;

  if (e.key === " ") {
    e.preventDefault();
    if (gameState.controlledPlayer.hasBall) {
      gameState.controlledPlayer.shoot();
    }
  } else if (e.key.toLowerCase() === "p") {
    if (gameState.controlledPlayer.hasBall) {
      gameState.controlledPlayer.pass();
    }
  } else if (e.key === "Tab") {
    e.preventDefault();
    switchControlledPlayer();
  }
}

function onKeyUp(e) {
  keys[e.key.toLowerCase()] = false;
}

function switchControlledPlayer() {
  const team = gameState.controlledPlayer.team === "home" ? homeTeam : awayTeam;
  const currentIndex = team.indexOf(gameState.controlledPlayer);
  const nextIndex = (currentIndex + 1) % team.length;
  gameState.controlledPlayer = team[nextIndex];
  updatePlayerStats();
}

function updateControlledPlayer() {
  if (!gameState.controlledPlayer) return;

  const player = gameState.controlledPlayer;
  const moveSpeed = player.speed;

  if (keys["w"]) player.velocity.z -= moveSpeed;
  if (keys["s"]) player.velocity.z += moveSpeed;
  if (keys["a"]) player.velocity.x -= moveSpeed;
  if (keys["d"]) player.velocity.x += moveSpeed;
}

function updateGameClock() {
  if (!gameState.gameActive) return;

  gameState.gameTime--;
  gameState.shotClock--;

  if (gameState.shotClock <= 0) {
    showMessage("SHOT CLOCK VIOLATION!");
    gameState.possession = gameState.possession === "home" ? "away" : "home";
    const newTeam = gameState.possession === "home" ? homeTeam : awayTeam;
    giveBallToPlayer(newTeam[0]);
  }

  if (gameState.gameTime <= 0) {
    if (gameState.quarter < 4) {
      gameState.quarter++;
      gameState.gameTime = quarterLength;
      showMessage(`END OF Q${gameState.quarter - 1}`);
    } else {
      endGame();
    }
  }

  updateUI();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Update post-processing on resize
  if (composer) {
    composer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Animation loop
let lastTime = Date.now();
let clockTicker = 0;

function animate() {
  requestAnimationFrame(animate);

  if (gameState.gameActive) {
    updateControlledPlayer();

    // Update all players
    players.forEach((player) => player.update());

    // Update ball
    ball.update();

    // Update ball trail effect
    updateBallTrail();

    // Update game clock every second
    clockTicker++;
    if (clockTicker >= 60) {
      updateGameClock();
      clockTicker = 0;
    }
  }

  // Render with post-processing for ultra-realistic graphics
  if (composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

// Initialize when page loads
try {
  init();
  console.log("✅ Game initialized successfully!");
} catch (error) {
  console.error("❌ Game initialization failed:", error);
  alert(
    "Failed to load the game. Please check the console for details and refresh the page."
  );
}
