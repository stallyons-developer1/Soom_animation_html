// Global variables
let scene,
  camera,
  renderer,
  textMeshes = [];
let clock = new THREE.Clock();

// Initialize Three.js scene
function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff); // White background

  // Create camera
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 12);

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Add renderer to DOM
  const container = document.getElementById("canvas-container");
  container.appendChild(renderer.domElement);

  // Setup lighting
  setupLighting();

  // Load font and create text
  loadFontAndCreateText();

  // Start animation loop
  animate();
}

// Setup lighting
function setupLighting() {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Main directional light
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(10, 10, 5);
  scene.add(dirLight);
}

// Load font and create text
function loadFontAndCreateText() {
  const loader = new THREE.FontLoader();

  // loader.load("../fonts/Baby_Gemoy_Regular.json", function (font) {
  //   createTextMeshes(font);
  // });
  loader.load(
    "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json",
    function (font) {
      createTextMeshes(font);
    }
  );
}

// Create 3D text meshes
function createTextMeshes(font) {
  const letters = ["S", "O", "O", "M"];
  const positions = [
    [-6, 0, 0],
    [-2, 0, 0],
    [2, 0, 0],
    [6, 0, 0],
  ];
  const delays = [0, 1, 2, 3];

  letters.forEach((letter, index) => {
    // Create text geometry
    const geometry = new THREE.TextGeometry(letter, {
      font: font,
      size: 3,
      height: 0.4,
      curveSegments: 64,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 32,
    });

    // Create material
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x333333,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...positions[index]);

    // Add custom properties for animation
    mesh.userData = {
      originalPosition: [...positions[index]],
      delay: delays[index],
    };

    scene.add(mesh);
    textMeshes.push(mesh);
  });

  // Center the text group
  centerTextGroup();
}

// Center all text meshes
function centerTextGroup() {
  const box = new THREE.Box3();

  textMeshes.forEach((mesh) => {
    box.expandByObject(mesh);
  });

  const center = box.getCenter(new THREE.Vector3());

  textMeshes.forEach((mesh) => {
    mesh.position.x -= center.x;
    mesh.userData.originalPosition[0] -= center.x;
  });
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  // Update each text mesh with bouncing animation
  textMeshes.forEach((mesh) => {
    if (mesh.userData) {
      const uniqueDelay = mesh.userData.delay * 2;
      const bounceSpeed = 1.0 + mesh.userData.delay * 0.3;
      const bounceHeight = 0.25 + mesh.userData.delay * 0.1;

      const bounceY = Math.sin(time * bounceSpeed + uniqueDelay) * bounceHeight;
      mesh.position.y = mesh.userData.originalPosition[1] + bounceY;
    }
  });

  // Render the scene
  renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Event listeners
window.addEventListener("resize", onWindowResize);

// Initialize when page loads
window.addEventListener("load", init);
