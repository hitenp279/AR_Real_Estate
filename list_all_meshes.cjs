const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=default', '--disable-web-security']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173/properties/lumina-penthouse', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const meshes = await page.evaluate(async () => {
    const threeMod = await import('/node_modules/.vite/deps/three.js');
    const THREE = threeMod.Box3 ? threeMod : (threeMod.default || threeMod);
    const gltfMod = await import('/node_modules/.vite/deps/three_examples_jsm_loaders_GLTFLoader__js.js');
    const GLTFLoader = gltfMod.GLTFLoader || gltfMod.default?.GLTFLoader || gltfMod.default;
    const meshoptMod = await import('/node_modules/.vite/deps/three_examples_jsm_libs_meshopt_decoder__module__js.js');
    const MeshoptDecoder = meshoptMod.MeshoptDecoder || meshoptMod.default?.MeshoptDecoder || meshoptMod.default;

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    return new Promise((resolve, reject) => {
      loader.load('/models/modern_apartment_optimized.glb', gltf => {
        const list = [];
        gltf.scene.traverse(node => {
          if (node.isMesh) {
            const b = new THREE.Box3().setFromObject(node);
            const s = new THREE.Vector3();
            b.getSize(s);
            list.push({
              name: node.name,
              mat: node.material ? (Array.isArray(node.material) ? node.material.map(m=>m.name).join(',') : node.material.name) : 'none',
              min: [b.min.x, b.min.y, b.min.z],
              max: [b.max.x, b.max.y, b.max.z],
              size: [s.x, s.y, s.z],
              polyCount: node.geometry ? node.geometry.attributes.position.count / 3 : 0
            });
          }
        });
        resolve(list);
      }, null, reject);
    });
  });

  console.log(`Total Meshes in Optimized Model: ${meshes.length}`);
  meshes.forEach((m, idx) => {
    console.log(`[${idx+1}] Mesh: "${m.name}", Mat: "${m.mat}", Size: [${m.size.map(v=>v.toFixed(2)).join(', ')}], Min: [${m.min.map(v=>v.toFixed(2)).join(', ')}], Max: [${m.max.map(v=>v.toFixed(2)).join(', ')}]`);
  });

  await browser.close();
}

run().catch(console.error);
