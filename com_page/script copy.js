// Global variables
let scene,
  camera,
  renderer,
  textMeshes = [];
let scrollProgress = 0;
let clock = new THREE.Clock();

// Initialize Three.js scene
function init() {
  console.log("Initializing 3D scene...");

  // Create scene
  scene = new THREE.Scene();

  // Create camera
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 12);

  // Create renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // Transparent background
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Add renderer to DOM
  const container = document.getElementById("canvas-container");
  container.appendChild(renderer.domElement);

  // Setup lighting
  setupLighting();

  // Load font and create text
  loadFontAndCreateText();

  // Start animation loop
  animate();

  // Hide loading screen after a delay
  setTimeout(() => {
    const loading = document.getElementById("loading");
    loading.style.opacity = "0";
    loading.style.transition = "opacity 1s ease";
    setTimeout(() => {
      loading.style.display = "none";
    }, 1000);
  }, 2000);
}

// Setup all lighting
function setupLighting() {
  // Ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  // Main directional lights
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight1.position.set(15, 15, 10);
  dirLight1.castShadow = true;
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight2.position.set(-15, 15, 10);
  scene.add(dirLight2);

  // Front lighting
  const dirLight3 = new THREE.DirectionalLight(0xffffff, 1.8);
  dirLight3.position.set(0, 5, 15);
  scene.add(dirLight3);

  // Point lights for each letter position
  const pointLightPositions = [
    { pos: [-8, 10, 8], intensity: 1.5 },
    { pos: [-3, 10, 8], intensity: 1.5 },
    { pos: [1.5, 10, 8], intensity: 1.5 },
    { pos: [7, 10, 8], intensity: 1.8 },
  ];

  pointLightPositions.forEach((lightData) => {
    const pointLight = new THREE.PointLight(
      0xffffff,
      lightData.intensity,
      20,
      1
    );
    pointLight.position.set(...lightData.pos);
    scene.add(pointLight);
  });
}

// Load font and create text meshes
function loadFontAndCreateText() {
  const loader = new THREE.FontLoader();

  loader.load(
    "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json",
    function (font) {
      console.log("Font loaded successfully");
      createTextMeshes(font);
    },
    function (progress) {
      console.log("Font loading progress:", progress);
    },
    function (error) {
      console.error("Error loading font:", error);
    }
  );
}

// Create 3D text meshes
function createTextMeshes(font) {
  const letters = ["S", "O", "O", "M"];
  const positions = [
    [-8, 0, 0],
    [-3, 0, 0],
    [1.5, 0, 0],
    [7, 0, 0],
  ];
  const delays = [0, 1, 2, 3];

  letters.forEach((letter, index) => {
    // Create text geometry
    const geometry = new THREE.TextGeometry(letter, {
      font: font,
      size: 3.5,
      height: 1.5,
      curveSegments: 64,
      bevelEnabled: true,
      bevelThickness: 0.3,
      bevelSize: 0.3,
      bevelOffset: 0,
      bevelSegments: 32,
    });

    // Create material with metallic properties
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a,
      metalness: 0.95,
      roughness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      reflectivity: 1.0,
      envMapIntensity: 4.0,
      transparent: false,
      thickness: 1.5,
      transmission: 0.0,
      sheen: 1.0,
      sheenRoughness: 0.0,
      sheenColor: 0xffffff,
      specularIntensity: 3.0,
      specularColor: 0xffffff,
      iridescence: 0.6,
      iridescenceIOR: 1.4,
      iridescenceThicknessRange: [100, 600],
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...positions[index]);

    // Add custom properties for animation
    mesh.userData = {
      originalPosition: [...positions[index]],
      delay: delays[index],
      visible: true,
      scrollOffset: 0,
      letter: letter,
    };

    scene.add(mesh);
    textMeshes.push(mesh);

    console.log(`Created letter: ${letter} at position:`, positions[index]);
  });

  // Center the text group
  centerTextGroup();
}

// Center all text meshes
function centerTextGroup() {
  const box = new THREE.Box3();

  // Calculate bounding box of all text meshes
  textMeshes.forEach((mesh) => {
    box.expandByObject(mesh);
  });

  const center = box.getCenter(new THREE.Vector3());

  // Adjust positions to center the group
  textMeshes.forEach((mesh) => {
    mesh.position.x -= center.x;
    mesh.userData.originalPosition[0] -= center.x;
  });
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  // Update each text mesh
  textMeshes.forEach((mesh, index) => {
    if (mesh.userData) {
      // Individual bouncing animation with unique timing
      const uniqueDelay = mesh.userData.delay * 2;
      const bounceSpeed = 1.0 + mesh.userData.delay * 0.3;
      const bounceHeight = 0.25 + mesh.userData.delay * 0.1;

      const bounceY = Math.sin(time * bounceSpeed + uniqueDelay) * bounceHeight;

      // Apply position with bounce and scroll offset
      mesh.position.y =
        mesh.userData.originalPosition[1] +
        bounceY +
        mesh.userData.scrollOffset;
      mesh.position.x = mesh.userData.originalPosition[0];
      mesh.position.z = mesh.userData.originalPosition[2];

      // Smooth scale animation for visibility
      const targetScale = mesh.userData.visible ? 1 : 0;
      const currentScale = mesh.scale.x;
      const newScale = currentScale + (targetScale - currentScale) * 0.08;
      mesh.scale.setScalar(newScale);
    }
  });

  // Render the scene
  renderer.render(scene, camera);
}

// Handle scroll events
function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight - windowHeight;
  scrollProgress = Math.min(scrollTop / documentHeight, 1);

  // Update progress bar
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    progressBar.style.height = `${scrollProgress * 100}%`;
  }

  // Update scroll hint opacity
  const scrollHint = document.getElementById("scroll-hint");
  if (scrollHint) {
    scrollHint.style.opacity = scrollProgress < 0.05 ? "1" : "0";
  }

  // Calculate which letters should be visible
  updateLetterVisibility();

  // Update side text visibility
  updateSideTexts();
}

// Update letter visibility based on scroll progress
function updateLetterVisibility() {
  const baseScrollOffset = scrollProgress * -15;

  const showFullText = scrollProgress < 0.1;
  const showOnlyS = scrollProgress >= 0.1 && scrollProgress < 0.4;
  const showOnlyOO = scrollProgress >= 0.4 && scrollProgress < 0.7;
  const showOnlyM = scrollProgress >= 0.7;

  if (textMeshes.length >= 4) {
    // Update S (index 0)
    textMeshes[0].userData.visible = showFullText || showOnlyS;
    textMeshes[0].userData.scrollOffset = showOnlyS
      ? 0
      : scrollProgress > 0.4
      ? baseScrollOffset
      : 0;

    // Update first O (index 1)
    textMeshes[1].userData.visible = showFullText || showOnlyOO;
    textMeshes[1].userData.scrollOffset = showOnlyOO
      ? 0
      : scrollProgress > 0.7
      ? baseScrollOffset
      : 0;

    // Update second O (index 2)
    textMeshes[2].userData.visible = showFullText || showOnlyOO;
    textMeshes[2].userData.scrollOffset = showOnlyOO
      ? 0
      : scrollProgress > 0.7
      ? baseScrollOffset
      : 0;

    // Update M (index 3)
    textMeshes[3].userData.visible = showFullText || showOnlyM;
    textMeshes[3].userData.scrollOffset = 0;
  }
}

// Update side text visibility
function updateSideTexts() {
  const showOnlyS = scrollProgress >= 0.1 && scrollProgress < 0.4;
  const showOnlyOO = scrollProgress >= 0.4 && scrollProgress < 0.7;
  const showOnlyM = scrollProgress >= 0.7;

  const textS = document.getElementById("text-s");
  const textOO = document.getElementById("text-oo");
  const textM = document.getElementById("text-m");

  // Handle S text
  if (showOnlyS) {
    setTimeout(() => {
      if (textS) textS.classList.add("visible");
    }, 300);
  } else {
    if (textS) textS.classList.remove("visible");
  }

  // Handle OO text
  if (showOnlyOO) {
    setTimeout(() => {
      if (textOO) textOO.classList.add("visible");
    }, 300);
  } else {
    if (textOO) textOO.classList.remove("visible");
  }

  // Handle M text
  if (showOnlyM) {
    setTimeout(() => {
      if (textM) textM.classList.add("visible");
    }, 300);
  } else {
    if (textM) textM.classList.remove("visible");
  }
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
window.addEventListener("scroll", handleScroll);
window.addEventListener("resize", onWindowResize);

// Initialize when page loads
window.addEventListener("load", () => {
  console.log("Page loaded, initializing...");
  init();
});

// Initialize immediately if page is already loaded
if (document.readyState === "complete") {
  console.log("Page already loaded, initializing...");
  init();
}
