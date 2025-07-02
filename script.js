// Get canvas
const canvas = document.getElementById("three-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 60);

// Lights
scene.add(new THREE.AmbientLight(0x404040, 0.3));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(50, 50, 50);
dirLight.castShadow = true;
scene.add(dirLight);

// Subtle point lights
const pointLight1 = new THREE.PointLight(0xffffff, 0.2, 100);
pointLight1.position.set(-30, 30, 30);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 0.2, 100);
pointLight2.position.set(30, -30, 30);
scene.add(pointLight2);

// Raycaster and mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Character setup
const characters = "SOOM".split("");
const characterMeshes = [];
const characterGroup = new THREE.Group();
scene.add(characterGroup);

// Font loader
const loader = new THREE.FontLoader();
loader.load(
  "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json",
  function (font) {
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x222222,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });

    const size = 12;
    const spacing = 14;
    let offsetX = -(characters.length - 1) * spacing * 0.5;

    characters.forEach((char, i) => {
      const geometry = new THREE.TextGeometry(char, {
        font: font,
        size: size,
        height: 5,
        curveSegments: 32,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1.5,
        bevelOffset: 0,
        bevelSegments: 10,
      });

      geometry.computeBoundingBox();
      geometry.center();

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = offsetX + i * spacing;
      mesh.position.y = 0;
      mesh.position.z = 0;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      characterGroup.add(mesh);
      characterMeshes.push(mesh);
    });
  }
);

// Scroll handling
const sections = document.querySelectorAll(".content-section");

function updateCharacterVisibility(scrollProgress) {
  if (characterMeshes.length === 0) return;

  // Show all characters initially
  if (scrollProgress <= 0.1) {
    characterMeshes.forEach((mesh, index) => {
      mesh.visible = true;
      mesh.position.x = -(characters.length - 1) * 14 * 0.5 + index * 14;
      mesh.position.y = 0;
      mesh.position.z = 0;
    });
    return;
  }

  const totalSections = 3;
  const currentSection = Math.floor(
    ((scrollProgress - 0.1) / 0.9) * totalSections
  );

  characterMeshes.forEach((mesh, index) => {
    if (currentSection === 0 && index === 0) {
      // Show only S
      mesh.visible = true;
      mesh.position.x = -30;
      mesh.position.y = 0;
      mesh.position.z = 10;
    } else if (currentSection === 1 && (index === 1 || index === 2)) {
      // Show only OO
      mesh.visible = true;
      mesh.position.x = -35 + (index - 1) * 10;
      mesh.position.y = 0;
      mesh.position.z = 10;
    } else if (currentSection === 2 && index === 3) {
      // Show only M
      mesh.visible = true;
      mesh.position.x = -30;
      mesh.position.y = 0;
      mesh.position.z = 10;
    } else {
      mesh.visible = false;
    }
  });
}

function updateSectionVisibility(scrollProgress) {
  const totalSections = sections.length;

  sections.forEach((section, index) => {
    const sectionStart = 0.1 + (index / totalSections) * 0.9;
    const sectionEnd = 0.1 + ((index + 1) / totalSections) * 0.9;

    if (scrollProgress >= sectionStart && scrollProgress < sectionEnd) {
      section.classList.add("visible");
    } else {
      section.classList.remove("visible");
    }
  });
}

function handleScroll() {
  const scrollTop = window.pageYOffset;
  const scrollHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const scrollProgress = Math.min(1, Math.max(0, scrollTop / scrollHeight));

  updateCharacterVisibility(scrollProgress);
  updateSectionVisibility(scrollProgress);
}

window.addEventListener("scroll", handleScroll);

// Animate
function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  // Animate lights
  pointLight1.position.x = Math.sin(time * 0.5) * 20;
  pointLight1.position.z = Math.cos(time * 0.5) * 20;
  pointLight2.position.x = Math.cos(time * 0.7) * 20;
  pointLight2.position.z = Math.sin(time * 0.7) * 20;

  // Mouse interaction
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(
    characterMeshes.filter((mesh) => mesh.visible)
  );

  // Reset hover effects
  characterMeshes.forEach((mesh) => {
    if (mesh.visible) {
      mesh.rotation.y *= 0.95;
      mesh.rotation.x *= 0.95;
    }
  });

  if (intersects.length > 0) {
    const hovered = intersects[0].object;
    hovered.rotation.y += Math.sin(time * 3) * 0.02;
    hovered.rotation.x += Math.cos(time * 3) * 0.01;
  }

  // Floating animation for visible characters
  characterMeshes.forEach((mesh, index) => {
    if (mesh.visible) {
      mesh.position.y += Math.sin(time + index) * 0.5;
    }
  });

  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initial call
handleScroll();
