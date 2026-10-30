const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=default', '--disable-web-security']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to Lumina Penthouse...');
  await page.goto('http://localhost:5173/properties/lumina-penthouse', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const results = await page.evaluate(async () => {
    const threeMod = await import('/node_modules/.vite/deps/three.js');
    const THREE = threeMod.Box3 ? threeMod : (threeMod.default || threeMod);
    const gltfMod = await import('/node_modules/.vite/deps/three_examples_jsm_loaders_GLTFLoader__js.js');
    const GLTFLoader = gltfMod.GLTFLoader || gltfMod.default?.GLTFLoader || gltfMod.default;
    const meshoptMod = await import('/node_modules/.vite/deps/three_examples_jsm_libs_meshopt_decoder__module__js.js');
    const MeshoptDecoder = meshoptMod.MeshoptDecoder || meshoptMod.default?.MeshoptDecoder || meshoptMod.default;

    async function loadAndMeasure(url) {
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);

      return new Promise((resolve, reject) => {
        loader.load(url, gltf => {
          const scene = gltf.scene;

          // 1. Overall bounding box with all children visible
          const rawBox = new THREE.Box3().setFromObject(scene);
          const rawSize = new THREE.Vector3();
          rawBox.getSize(rawSize);

          // 2. Traversal to find min/max of all vertices directly
          let minX = Infinity, minY = Infinity, minZ = Infinity;
          let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
          const nodeDetails = [];

          scene.traverse(child => {
            if (child.isMesh) {
              const b = new THREE.Box3().setFromObject(child);
              const s = new THREE.Vector3();
              b.getSize(s);
              nodeDetails.push({
                name: child.name,
                parent: child.parent?.name,
                min: { x: b.min.x, y: b.min.y, z: b.min.z },
                max: { x: b.max.x, y: b.max.y, z: b.max.z },
                size: { x: s.x, y: s.y, z: s.z }
              });

              if (b.min.x < minX) minX = b.min.x;
              if (b.min.y < minY) minY = b.min.y;
              if (b.min.z < minZ) minZ = b.min.z;
              if (b.max.x > maxX) maxX = b.max.x;
              if (b.max.y > maxY) maxY = b.max.y;
              if (b.max.z > maxZ) maxZ = b.max.z;
            }
          });

          resolve({
            url,
            rawBox: {
              min: { x: rawBox.min.x, y: rawBox.min.y, z: rawBox.min.z },
              max: { x: rawBox.max.x, y: rawBox.max.y, z: rawBox.max.z },
              size: { x: rawSize.x, y: rawSize.y, z: rawSize.z }
            },
            vertexEnvelope: {
              min: { x: minX, y: minY, z: minZ },
              max: { x: maxX, y: maxY, z: maxZ },
              size: { x: maxX - minX, y: maxY - minY, z: maxZ - minZ }
            },
            nodeCount: nodeDetails.length,
            nodes: nodeDetails
          });
        }, null, reject);
      });
    }

    const opt = await loadAndMeasure('/models/modern_apartment_optimized.glb');
    const orig = await loadAndMeasure('/models/modern_apartment.glb');

    return { opt, orig };
  });

  console.log(`\n=== OPTIMIZED MODEL MEASUREMENT ===`);
  console.log(`Raw Box: min=(${results.opt.rawBox.min.x.toFixed(3)}, ${results.opt.rawBox.min.y.toFixed(3)}, ${results.opt.rawBox.min.z.toFixed(3)}) max=(${results.opt.rawBox.max.x.toFixed(3)}, ${results.opt.rawBox.max.y.toFixed(3)}, ${results.opt.rawBox.max.z.toFixed(3)})`);
  console.log(`Size: Width(X)=${results.opt.rawBox.size.x.toFixed(3)}m, Height(Y)=${results.opt.rawBox.size.y.toFixed(3)}m, Depth(Z)=${results.opt.rawBox.size.z.toFixed(3)}m`);

  console.log(`\n=== ORIGINAL MODEL MEASUREMENT ===`);
  console.log(`Raw Box: min=(${results.orig.rawBox.min.x.toFixed(3)}, ${results.orig.rawBox.min.y.toFixed(3)}, ${results.orig.rawBox.min.z.toFixed(3)}) max=(${results.orig.rawBox.max.x.toFixed(3)}, ${results.orig.rawBox.max.y.toFixed(3)}, ${results.orig.rawBox.max.z.toFixed(3)})`);
  console.log(`Size: Width(X)=${results.orig.rawBox.size.x.toFixed(3)}m, Height(Y)=${results.orig.rawBox.size.y.toFixed(3)}m, Depth(Z)=${results.orig.rawBox.size.z.toFixed(3)}m`);

  await browser.close();
}

run().catch(console.error);
