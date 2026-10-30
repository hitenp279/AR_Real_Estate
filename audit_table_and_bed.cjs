const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, 'test_audits');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=default', '--disable-web-security']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173/properties/lumina-penthouse', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const canvas = page.locator('canvas').first();
  await canvas.scrollIntoViewIfNeeded();

  const auditViews = [
    { id: 'dining_topdown', pos: [0.15, 4.8, 1.54], target: [0.15, 0.75, 1.54], fov: 38 },
    { id: 'dining_perspective', pos: [0.15, 2.6, 3.8], target: [0.15, 0.75, 1.54], fov: 42 },
    { id: 'bedroom_bed_perspective', pos: [10.8, 1.6, 2.0], target: [12.7, 0.75, 0.5], fov: 50 },
    { id: 'bedroom_bed_topdown', pos: [12.7, 4.5, 0.5], target: [12.7, 0.6, 0.5], fov: 40 },
  ];

  async function captureAudit(modelUrl, prefix) {
    console.log(`\nLoading ${prefix} model (${modelUrl})...`);
    await page.evaluate(async (url) => {
      const v = window.__VISTA_VIEWER__;
      const gltfMod = await import('/node_modules/.vite/deps/three_examples_jsm_loaders_GLTFLoader__js.js');
      const GLTFLoader = gltfMod.GLTFLoader || gltfMod.default?.GLTFLoader || gltfMod.default;
      const meshoptMod = await import('/node_modules/.vite/deps/three_examples_jsm_libs_meshopt_decoder__module__js.js');
      const MeshoptDecoder = meshoptMod.MeshoptDecoder || meshoptMod.default?.MeshoptDecoder || meshoptMod.default;

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);

      return new Promise((resolve, reject) => {
        loader.load(url, gltf => {
          v.scene.remove(v.model);
          v.model = gltf.scene;
          v.model.traverse(node => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
            if (node.name === 'Apple_Adaptor_White1_0') node.visible = false;
          });
          v.scene.add(v.model);
          resolve();
        }, null, reject);
      });
    }, modelUrl);

    await page.waitForTimeout(1500);

    for (const v of auditViews) {
      await page.evaluate(({ pos, target, fov }) => {
        const viewer = window.__VISTA_VIEWER__;
        viewer.camera.position.set(...pos);
        viewer.controls.target.set(...target);
        viewer.camera.fov = fov;
        viewer.camera.updateProjectionMatrix();
        viewer.controls.update();
      }, v);

      await page.waitForTimeout(600);
      const dest = path.join(OUT_DIR, `${prefix}_${v.id}.png`);
      await canvas.screenshot({ path: dest });
      console.log(`Saved ${dest}`);
    }
  }

  await captureAudit('/models/modern_apartment.glb', 'orig');
  await captureAudit('/models/modern_apartment_optimized.glb', 'opt');

  await browser.close();
}

run().catch(console.error);
