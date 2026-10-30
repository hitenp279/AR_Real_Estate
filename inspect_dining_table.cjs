const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=default', '--disable-web-security']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173/properties/lumina-penthouse', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const tableData = await page.evaluate(async () => {
    const gltfMod = await import('/node_modules/.vite/deps/three_examples_jsm_loaders_GLTFLoader__js.js');
    const GLTFLoader = gltfMod.GLTFLoader || gltfMod.default?.GLTFLoader || gltfMod.default;
    const meshoptMod = await import('/node_modules/.vite/deps/three_examples_jsm_libs_meshopt_decoder__module__js.js');
    const MeshoptDecoder = meshoptMod.MeshoptDecoder || meshoptMod.default?.MeshoptDecoder || meshoptMod.default;
    const threeMod = await import('/node_modules/.vite/deps/three.js');
    const THREE = threeMod.Box3 ? threeMod : (threeMod.default || threeMod);

    async function inspectTableIn(url) {
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);

      return new Promise((resolve, reject) => {
        loader.load(url, gltf => {
          // Table is located around X: [-1.0 to 1.5], Y: [0 to 1.5], Z: [0.5 to 2.5]
          const tableMeshes = [];
          gltf.scene.traverse(node => {
            if (node.isMesh) {
              const b = new THREE.Box3().setFromObject(node);
              // Check if mesh intersects the dining table area (X around -0.5 to +0.5, Z around 1.0 to 2.5)
              if (b.min.x >= -2.0 && b.max.x <= 1.0 && b.min.z >= 0.5 && b.max.z <= 3.0) {
                const s = new THREE.Vector3();
                b.getSize(s);
                tableMeshes.push({
                  name: node.name,
                  parent: node.parent?.name,
                  mat: node.material ? (Array.isArray(node.material) ? node.material.map(m=>m.name).join(',') : node.material.name) : null,
                  size: [s.x, s.y, s.z],
                  min: [b.min.x, b.min.y, b.min.z],
                  max: [b.max.x, b.max.y, b.max.z],
                  center: [(b.min.x+b.max.x)/2, (b.min.y+b.max.y)/2, (b.min.z+b.max.z)/2],
                  vertexCount: node.geometry.attributes.position.count
                });
              }
            }
          });
          resolve(tableMeshes);
        }, null, reject);
      });
    }

    const origTable = await inspectTableIn('/models/modern_apartment.glb');
    const optTable = await inspectTableIn('/models/modern_apartment_optimized.glb');
    return { origTable, optTable };
  });

  console.log(`\n=== ORIGINAL TABLE MESHES (${tableData.origTable.length}) ===`);
  tableData.origTable.forEach(m => {
    console.log(`- "${m.name}" (parent: "${m.parent}"): Mat="${m.mat}", Center=[${m.center.map(v=>v.toFixed(2)).join(', ')}], Size=[${m.size.map(v=>v.toFixed(2)).join(', ')}], Verts=${m.vertexCount}`);
  });

  console.log(`\n=== OPTIMIZED TABLE MESHES (${tableData.optTable.length}) ===`);
  tableData.optTable.forEach(m => {
    console.log(`- "${m.name}" (parent: "${m.parent}"): Mat="${m.mat}", Center=[${m.center.map(v=>v.toFixed(2)).join(', ')}], Size=[${m.size.map(v=>v.toFixed(2)).join(', ')}], Verts=${m.vertexCount}`);
  });

  await browser.close();
}

run().catch(console.error);
