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

  const diff = await page.evaluate(async () => {
    const threeMod = await import('/node_modules/.vite/deps/three.js');
    const THREE = threeMod.Box3 ? threeMod : (threeMod.default || threeMod);
    const gltfMod = await import('/node_modules/.vite/deps/three_examples_jsm_loaders_GLTFLoader__js.js');
    const GLTFLoader = gltfMod.GLTFLoader || gltfMod.default?.GLTFLoader || gltfMod.default;
    const meshoptMod = await import('/node_modules/.vite/deps/three_examples_jsm_libs_meshopt_decoder__module__js.js');
    const MeshoptDecoder = meshoptMod.MeshoptDecoder || meshoptMod.default?.MeshoptDecoder || meshoptMod.default;

    async function getMeshList(url) {
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);

      return new Promise((resolve, reject) => {
        loader.load(url, gltf => {
          const list = [];
          gltf.scene.traverse(node => {
            if (node.isMesh) {
              const b = new THREE.Box3().setFromObject(node);
              list.push({
                name: node.name,
                parent: node.parent?.name,
                minZ: b.min.z,
                maxZ: b.max.z,
                minX: b.min.x,
                maxX: b.max.x,
                minY: b.min.y,
                maxY: b.max.y,
                sizeX: b.max.x - b.min.x,
                sizeY: b.max.y - b.min.y,
                sizeZ: b.max.z - b.min.z,
              });
            }
          });
          resolve(list);
        }, null, reject);
      });
    }

    const origList = await getMeshList('/models/modern_apartment.glb');
    const optList = await getMeshList('/models/modern_apartment_optimized.glb');

    const optNames = new Set(optList.map(m => m.name));
    const origNames = new Set(origList.map(m => m.name));

    // Meshes in original that reach beyond opt Z bounds (minZ < -1.55 or maxZ > 4.45)
    const outsideZ = origList.filter(m => m.minZ < -1.55 || m.maxZ > 4.45);

    // Meshes in original that are not in opt
    const missingInOpt = origList.filter(m => !optNames.has(m.name));

    // Compare identical named meshes for bounding box differences
    const sizeDiffs = [];
    for (const om of origList) {
      const pm = optList.find(m => m.name === om.name);
      if (pm) {
        const diffZ = Math.abs(om.sizeZ - pm.sizeZ);
        if (diffZ > 0.1) {
          sizeDiffs.push({ name: om.name, origZ: om.sizeZ, optZ: pm.sizeZ, origRange: [om.minZ, om.maxZ], optRange: [pm.minZ, pm.maxZ] });
        }
      }
    }

    return {
      origCount: origList.length,
      optCount: optList.length,
      outsideZ,
      missingInOpt: missingInOpt.map(m => ({ name: m.name, parent: m.parent, minZ: m.minZ, maxZ: m.maxZ })),
      sizeDiffs
    };
  });

  console.log(`\nOriginal Mesh Count: ${diff.origCount}, Optimized Mesh Count: ${diff.optCount}`);
  console.log(`\nMeshes in Original that reach beyond Z [-1.55 to 4.45]:`);
  diff.outsideZ.forEach(m => {
    console.log(`- "${m.name}" (parent: "${m.parent}"): Z=[${m.minZ.toFixed(2)}, ${m.maxZ.toFixed(2)}], SizeZ=${m.sizeZ.toFixed(2)}`);
  });

  console.log(`\nMeshes missing in Optimized:`, diff.missingInOpt);
  console.log(`\nMeshes with sizeZ diff > 0.1m:`, diff.sizeDiffs);

  await browser.close();
}

run().catch(console.error);
