// Three.js Setup
let scene, camera, renderer, particles, particleSystem;
let particleGeometry, particleMaterial;
let particleCount = 5000;
let particlePositions = [];
let particleVelocities = [];
let targetPositions = [];
let currentShape = 'heart';
let expansionFactor = 1;
let rotationSpeed = 0;
let exploding = false;

// Hand tracking
let hands, camera_stream;
let handDetected = false;
let gestureState = {
    indexUp: false,
    peace: false,
    iLoveYou: false,
    openPalm: false,
    fist: false,
    threeFingers: false  // New gesture for bouquet
};

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0008);
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Create particles
    createParticles();
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xff69b4, 1, 100);
    pointLight.position.set(0, 0, 50);
    scene.add(pointLight);
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.getElementById('shapeSelect').addEventListener('change', (e) => {
        currentShape = e.target.value;
        updateParticlePositions();
    });
    document.getElementById('resetBtn').addEventListener('click', resetCamera);
    
    // Start animation
    animate();
}

function createParticles() {
    particleGeometry = new THREE.BufferGeometry();
    particlePositions = new Float32Array(particleCount * 3);
    particleVelocities = [];
    targetPositions = [];
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 100;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        
        particleVelocities.push(new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
        ));
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    // Create material
    particleMaterial = new THREE.PointsMaterial({
        size: 0.5,
        color: 0xff69b4,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    
    updateParticlePositions();
}

function updateParticlePositions() {
    targetPositions = [];
    
    for (let i = 0; i < particleCount; i++) {
        let pos;
        
        switch(currentShape) {
            case 'heart':
                pos = getHeartPosition(i);
                break;
            case 'iloveyou':
                pos = getILoveYouPosition(i);
                break;
            case 'valentines':
                pos = getValentinesPosition(i);
                break;
            case 'bouquet':
                pos = getBouquetPosition(i);
                break;
            default:
                pos = getHeartPosition(i);
        }
        
        targetPositions.push(pos);
    }
}

function getHeartPosition(i) {
    const scale = 3; // Reduced from 6 to 4 to make it even smaller
    
    // Create a filled heart by distributing particles in 3D volume
    const t = (i / particleCount) * Math.PI * 2;
    const u = Math.random(); // Random depth
    const v = Math.random(); // Random fill
    
    // Heart parametric equations
    const baseX = scale * 16 * Math.pow(Math.sin(t), 3);
    const baseY = scale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    
    // Fill the heart by scaling inward
    const fillFactor = Math.sqrt(v); // Use sqrt for more even distribution
    const x = baseX * fillFactor;
    const y = baseY * fillFactor;
    const z = (Math.random() - 0.5) * 8 * fillFactor; // Depth scales with fill
    
    return new THREE.Vector3(x, y - 5, z);
}

function getILoveYouPosition(i) {
    // Create letter particles for "I LOVE YOU"
    const text = "ILOVEYOU";
    const letterSpacing = 10;
    const totalWidth = text.length * letterSpacing;
    const startX = -totalWidth / 2;
    
    // Calculate particles per letter more carefully
    const particlesPerLetter = particleCount / text.length;
    const letterIndex = Math.floor(i / particlesPerLetter);
    
    // Ensure we don't go beyond the text length
    if (letterIndex >= text.length) {
        // Extra particles go to the last letter
        const baseX = startX + (text.length - 1) * letterSpacing;
        const localIndex = i - Math.floor(particlesPerLetter * (text.length - 1));
        return getLetterPosition(text[text.length - 1], baseX, localIndex, Math.ceil(particlesPerLetter));
    }
    
    const localIndex = i - Math.floor(letterIndex * particlesPerLetter);
    const letter = text[letterIndex];
    const baseX = startX + letterIndex * letterSpacing;
    
    // Create letter shapes
    return getLetterPosition(letter, baseX, localIndex, Math.ceil(particlesPerLetter));
}

function getValentinesPosition(i) {
    // Create letter particles for "VALENTINES"
    const text = "VALENTINE";
    const letterSpacing = 7;
    const totalWidth = text.length * letterSpacing;
    const startX = -totalWidth / 2;
    
    // Calculate particles per letter more carefully
    const particlesPerLetter = particleCount / text.length;
    const letterIndex = Math.floor(i / particlesPerLetter);
    
    // Ensure we don't go beyond the text length
    if (letterIndex >= text.length) {
        // Extra particles go to the last letter
        const baseX = startX + (text.length - 1) * letterSpacing;
        const localIndex = i - Math.floor(particlesPerLetter * (text.length - 1));
        return getLetterPosition(text[text.length - 1], baseX, localIndex, Math.ceil(particlesPerLetter));
    }
    
    const localIndex = i - Math.floor(letterIndex * particlesPerLetter);
    const letter = text[letterIndex];
    const baseX = startX + letterIndex * letterSpacing;
    
    // Create letter shapes
    return getLetterPosition(letter, baseX, localIndex, Math.ceil(particlesPerLetter));
}

function getBouquetPosition(i) {
    // Create a single beautiful rose
    const particlesForStem = particleCount * 0.25; // 25% for stem
    const particlesForLeaves = particleCount * 0.15; // 15% for leaves
    const particlesForRose = particleCount - particlesForStem - particlesForLeaves; // 60% for rose bloom
    
    if (i < particlesForStem) {
        // STEM - curved upward
        const stemProgress = i / particlesForStem;
        const stemHeight = 30;
        const curve = Math.sin(stemProgress * Math.PI) * 2; // Gentle S-curve
        
        return new THREE.Vector3(
            curve,
            -15 + stemHeight * stemProgress,
            (Math.random() - 0.5) * 0.5
        );
    } else if (i < particlesForStem + particlesForLeaves) {
        // LEAVES - two leaves on the stem
        const leafIndex = i - particlesForStem;
        const leafSide = leafIndex < particlesForLeaves / 2 ? -1 : 1; // Left or right leaf
        const localIndex = leafIndex % (particlesForLeaves / 2);
        const leafProgress = localIndex / (particlesForLeaves / 2);
        
        const leafAngle = leafProgress * Math.PI;
        const leafSize = 3 * Math.sin(leafAngle); // Oval leaf shape
        
        return new THREE.Vector3(
            leafSide * leafSize,
            -5, // Middle of stem
            (Math.random() - 0.5) * 0.5
        );
    } else {
        // ROSE BLOOM - spiral petals
        const bloomIndex = i - particlesForStem - particlesForLeaves;
        const bloomProgress = bloomIndex / particlesForRose;
        
        // Create spiral rose pattern
        const spiralTurns = 5;
        const angle = bloomProgress * Math.PI * 2 * spiralTurns;
        const radius = 6 * Math.sqrt(bloomProgress); // Grows outward
        
        // Add petal-like variation
        const petalCount = 8;
        const petalVariation = Math.sin(angle * petalCount) * 0.5;
        const actualRadius = radius * (1 + petalVariation);
        
        return new THREE.Vector3(
            actualRadius * Math.cos(angle),
            15 + actualRadius * Math.sin(angle), // Rose at top
            (Math.random() - 0.5) * 3 - bloomProgress * 2 // Depth variation
        );
    }
}

function getLetterPosition(letter, baseX, index, total) {
    const t = (index / total) * Math.PI * 2;
    
    switch(letter) {
        case 'A':
            if (index < total / 3) {
                return new THREE.Vector3(
                    baseX - 2 + (index / (total / 3)) * 2,
                    -5 + (index / (total / 3)) * 10,
                    (Math.random() - 0.5) * 2
                );
            } else if (index < 2 * total / 3) {
                return new THREE.Vector3(
                    baseX + ((index - total / 3) / (total / 3)) * 2,
                    5 - ((index - total / 3) / (total / 3)) * 10,
                    (Math.random() - 0.5) * 2
                );
            } else {
                return new THREE.Vector3(
                    baseX - 1 + ((index - 2 * total / 3) / (total / 3)) * 2,
                    0,
                    (Math.random() - 0.5) * 2
                );
            }
            
        case 'E':
            const eSegment = Math.floor((index / total) * 4);
            if (eSegment === 0) {
                return new THREE.Vector3(
                    baseX - 1.5,
                    -5 + (index / (total / 4)) * 10,
                    (Math.random() - 0.5) * 2
                );
            } else if (eSegment === 1) {
                return new THREE.Vector3(
                    baseX - 1.5 + ((index - total / 4) / (total / 4)) * 3,
                    5,
                    (Math.random() - 0.5) * 2
                );
            } else if (eSegment === 2) {
                return new THREE.Vector3(
                    baseX - 1.5 + ((index - total / 2) / (total / 4)) * 2.5,
                    0,
                    (Math.random() - 0.5) * 2
                );
            } else {
                return new THREE.Vector3(
                    baseX - 1.5 + ((index - 3 * total / 4) / (total / 4)) * 3,
                    -5,
                    (Math.random() - 0.5) * 2
                );
            }
            
        case 'I':
            return new THREE.Vector3(
                baseX,
                -5 + (index / total) * 10,
                (Math.random() - 0.5) * 2
            );
            
        case 'L':
            if (index < total / 2) {
                return new THREE.Vector3(
                    baseX - 1.5,
                    -5 + (index / (total / 2)) * 10,
                    (Math.random() - 0.5) * 2
                );
            } else {
                return new THREE.Vector3(
                    baseX - 1.5 + ((index - total / 2) / (total / 2)) * 3,
                    -5,
                    (Math.random() - 0.5) * 2
                );
            }
            
        case 'N':
            if (index < total / 3) {
                return new THREE.Vector3(
                    baseX - 1.5,
                    -5 + (index / (total / 3)) * 10,
                    (Math.random() - 0.5) * 2
                );
            } else if (index < 2 * total / 3) {
                return new THREE.Vector3(
                    baseX - 1.5 + ((index - total / 3) / (total / 3)) * 3,
                    5 - ((index - total / 3) / (total / 3)) * 10,
                    (Math.random() - 0.5) * 2
                );
            } else {
                return new THREE.Vector3(
                    baseX + 1.5,
                    -5 + ((index - 2 * total / 3) / (total / 3)) * 10,
                    (Math.random() - 0.5) * 2
                );
            }
            
        case 'O':
            return new THREE.Vector3(
                baseX + 2 * Math.cos(t),
                2 * Math.sin(t),
                (Math.random() - 0.5) * 2
            );
            
        case 'S':
            const sAngle = (index / total) * Math.PI * 2.5;
            return new THREE.Vector3(
                baseX + 2 * Math.cos(sAngle),
                4 * Math.sin(sAngle),
                (Math.random() - 0.5) * 2
            );
            
        case 'T':
            if (index < total / 3) {
                return new THREE.Vector3(
                    baseX - 2 + (index / (total / 3)) * 4,
                    5,
                    (Math.random() - 0.5) * 2
                );
            } else {
                return new THREE.Vector3(
                    baseX,
                    5 - ((index - total / 3) / (2 * total / 3)) * 10,
                    (Math.random() - 0.5) * 2
                );
            }
            
        case 'U':
            const uAngle = Math.PI + (index / total) * Math.PI; // Start from bottom left, go to bottom right
            return new THREE.Vector3(
                baseX + 2 * Math.cos(uAngle),
                -5 + 2.5 * (1 + Math.sin(uAngle)),
                (Math.random() - 0.5) * 2
            );
            
        case 'V':
            if (index < total / 2) {
                return new THREE.Vector3(
                    baseX - 2 + (index / (total / 2)) * 2,
                    5 - (index / (total / 2)) * 10,
                    (Math.random() - 0.5) * 2
                );
            } else {
                return new THREE.Vector3(
                    baseX + ((index - total / 2) / (total / 2)) * 2,
                    -5 + ((index - total / 2) / (total / 2)) * 10,
                    (Math.random() - 0.5) * 2
                );
            }
            
        case 'Y':
            if (index < total / 3) {
                return new THREE.Vector3(
                    baseX - 2 + (index / (total / 3)) * 2,
                    5 - (index / (total / 3)) * 5,
                    (Math.random() - 0.5) * 2
                );
            } else if (index < 2 * total / 3) {
                return new THREE.Vector3(
                    baseX + ((index - total / 3) / (total / 3)) * 2,
                    0 + ((index - total / 3) / (total / 3)) * 5,
                    (Math.random() - 0.5) * 2
                );
            } else {
                return new THREE.Vector3(
                    baseX,
                    - ((index - 2 * total / 3) / (total / 3)) * 5,
                    (Math.random() - 0.5) * 2
                );
            }
            
        case ' ':
            return new THREE.Vector3(
                baseX,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 2
            );
            
        default:
            // Fallback for any unhandled characters - create a small dot
            return new THREE.Vector3(
                baseX,
                0,
                (Math.random() - 0.5) * 2
            );
    }
}

function detectGestures(landmarks) {
    // Finger tip landmarks: thumb(4), index(8), middle(12), ring(16), pinky(20)
    // Finger base landmarks: thumb(2), index(5), middle(9), ring(13), pinky(17)
    
    const tips = [landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
    const bases = [landmarks[5], landmarks[9], landmarks[13], landmarks[17]];
    const thumbTip = landmarks[4];
    const thumbBase = landmarks[2];
    const wrist = landmarks[0];
    
    // Check which fingers are extended (comparing y coordinates - lower y means higher up)
    const fingersExtended = tips.map((tip, i) => tip.y < bases[i].y);
    const thumbExtended = Math.abs(thumbTip.x - wrist.x) > Math.abs(thumbBase.x - wrist.x);
    
    // Index finger up (only index extended)
    gestureState.indexUp = fingersExtended[0] && !fingersExtended[1] && !fingersExtended[2] && !fingersExtended[3] && !thumbExtended;
    
    // Peace sign (index and middle extended)
    gestureState.peace = fingersExtended[0] && fingersExtended[1] && !fingersExtended[2] && !fingersExtended[3] && !thumbExtended;
    
    // Three fingers (index, middle, ring extended) - for bouquet
    gestureState.threeFingers = fingersExtended[0] && fingersExtended[1] && fingersExtended[2] && !fingersExtended[3] && !thumbExtended;
    
    // I Love You sign (thumb, index, and pinky extended)
    gestureState.iLoveYou = thumbExtended && fingersExtended[0] && !fingersExtended[1] && !fingersExtended[2] && fingersExtended[3];
    
    // Open palm (all fingers extended)
    gestureState.openPalm = fingersExtended.every(f => f) && thumbExtended;
    
    // Fist (no fingers extended)
    gestureState.fist = !fingersExtended[0] && !fingersExtended[1] && !fingersExtended[2] && !fingersExtended[3] && !thumbExtended;
}

function updateParticlesFromGestures() {
    // Shape changes based on gestures
    if (gestureState.indexUp && currentShape !== 'heart') {
        currentShape = 'heart';
        updateParticlePositions();
        document.getElementById('shapeSelect').value = 'heart';
        document.getElementById('status').textContent = '👆 Heart Shape';
        document.getElementById('status').style.background = 'rgba(255, 105, 180, 0.3)';
    } else if (gestureState.peace && currentShape !== 'iloveyou') {
        currentShape = 'iloveyou';
        updateParticlePositions();
        document.getElementById('shapeSelect').value = 'iloveyou';
        document.getElementById('status').textContent = '✌️ I LOVE YOU';
        document.getElementById('status').style.background = 'rgba(255, 105, 180, 0.3)';
    } else if (gestureState.threeFingers && currentShape !== 'bouquet') {
        currentShape = 'bouquet';
        updateParticlePositions();
        document.getElementById('shapeSelect').value = 'bouquet';
        document.getElementById('status').textContent = '🤘 Rose';
        document.getElementById('status').style.background = 'rgba(255, 105, 180, 0.3)';
    } else if (gestureState.iLoveYou && currentShape !== 'valentines') {
        currentShape = 'valentines';
        updateParticlePositions();
        document.getElementById('shapeSelect').value = 'valentines';
        document.getElementById('status').textContent = '🤟 VALENTINES';
        document.getElementById('status').style.background = 'rgba(255, 105, 180, 0.3)';
    }
    
    // Rotation control
    if (gestureState.openPalm) {
        rotationSpeed = 0.02;
        document.getElementById('status').textContent = '🖐️ Rotating...';
        document.getElementById('status').style.background = 'rgba(255, 192, 203, 0.3)';
    } else {
        rotationSpeed *= 0.95;
    }
    
    // Explode effect
    if (gestureState.fist) {
        if (!exploding) {
            exploding = true;
            for (let i = 0; i < particleCount; i++) {
                const dir = new THREE.Vector3(
                    (Math.random() - 0.5),
                    (Math.random() - 0.5),
                    (Math.random() - 0.5)
                ).normalize();
                particleVelocities[i].copy(dir.multiplyScalar(3));
            }
            setTimeout(() => { exploding = false; }, 2000);
        }
        document.getElementById('status').textContent = '👊 Exploding!';
        document.getElementById('status').style.background = 'rgba(255, 20, 147, 0.4)';
    }
    
    if (!gestureState.indexUp && !gestureState.peace && !gestureState.threeFingers && !gestureState.iLoveYou && !gestureState.openPalm && !gestureState.fist) {
        if (handDetected) {
            document.getElementById('status').textContent = '✋ Hand detected';
            document.getElementById('status').style.background = 'rgba(255, 105, 180, 0.2)';
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    updateParticlesFromGestures();
    
    // Update particle positions
    const positions = particleGeometry.attributes.position.array;
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const target = targetPositions[i];
        
        if (target) {
            if (exploding) {
                positions[i3] += particleVelocities[i].x;
                positions[i3 + 1] += particleVelocities[i].y;
                positions[i3 + 2] += particleVelocities[i].z;
                particleVelocities[i].multiplyScalar(0.98);
            } else {
                positions[i3] += (target.x - positions[i3]) * 0.05;
                positions[i3 + 1] += (target.y - positions[i3 + 1]) * 0.05;
                positions[i3 + 2] += (target.z - positions[i3 + 2]) * 0.05;
            }
        }
    }
    
    particleGeometry.attributes.position.needsUpdate = true;
    
    // Rotate particle system
    particleSystem.rotation.y += rotationSpeed;
    particleSystem.rotation.x += rotationSpeed * 0.5;
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function resetCamera() {
    camera.position.set(0, 0, 50);
    camera.lookAt(0, 0, 0);
    particleSystem.rotation.set(0, 0, 0);
}

// Initialize MediaPipe Hands
function initHandTracking() {
    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });
    
    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    
    hands.onResults(onHandResults);
    
    const videoElement = document.getElementById('video');
    camera_stream = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });
    
    camera_stream.start();
    
    document.getElementById('loading').style.display = 'none';
}

function onHandResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        handDetected = true;
        const landmarks = results.multiHandLandmarks[0];
        detectGestures(landmarks);
    } else {
        handDetected = false;
        gestureState = {
            indexUp: false,
            peace: false,
            iLoveYou: false,
            openPalm: false,
            fist: false,
            threeFingers: false
        };
        document.getElementById('status').textContent = 'Waiting for hands...';
        document.getElementById('status').style.background = 'rgba(255, 105, 180, 0.2)';
    }
}

// Start everything
init();
initHandTracking();