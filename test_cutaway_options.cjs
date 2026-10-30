const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, 'test_cutaways');
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

  // Test 1: Hide Plane002_SprayedWallTexture_0
  await page.evaluate(() => {
    const v = window.__VISTA_VIEWER__;
    v.model.traverse(node => {
      if (node.name === 'Plane002_SprayedWallTexture_0') node.visible = false;
    });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, 'cutaway_hide_sprayed_wall.png') });

  // Restore and Test 2: Hide Paintings & Entrance Door Wood
  await page.evaluate(() => {
    const v = window.__VISTA_VIEWER__;
    v.model.traverse(node => {
      if (node.name === 'Plane002_SprayedWallTexture_0') node.visible = true;
      if (node.name.startsWith('Paintings_') || node.name === 'EnteranceDoor_Wood0035_0') node.visible = false;
    });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, 'cutaway_hide_corridor_wood_paintings.png') });

  // Test 3: Three.js Architectural Section Cutaway using Clipping Plane along front corridor (Z > 2.8)
  await page.evaluate(() => {
    const v = window.__VISTA_VIEWER__;
    // Restore all
    v.model.traverse(node => { node.visible = true; });
    // Hide ceiling in overview
    v.model.traverse(node => { if (node.name === 'Apple_Adaptor_White1_0') node.visible = false; });

    // Add clipping plane to renderer and materials
    const THREE = window.__THREE__ || v.camera.constructor;
    // Plane pointing towards -Z, clipping anything with Z > 2.7
    // Ax + By + Cz + D = 0 -> normal: (0, 0, -1), constant: 2.7
    const clipPlane = new v.camera.constructor.prototype.constructor.Plane(
      new v.camera.position.constructor(0, 0, -1),
      2.75
    );
    // Apply to walls and paintings
    v.model.traverse(node => {
      if (node.isMesh && (node.name.includes('Wall') || node.name.includes('Door') || node.name.includes('Paintings'))) {
        node.material.clippingPlanes = [clipPlane];
        node.material.clipShadows = true;
      }
    });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, 'cutaway_clipping_plane.png') });

  // Test 4: Elevated Three-Quarter Architectural Dollhouse Angle from North-West (Window side looking down into living, kitchen, office, master bed)
  await page.evaluate(() => {
    const v = window.__VISTA_VIEWER__;
    // remove clipping
    v.model.traverse(node => {
      if (node.isMesh && node.material) node.material.clippingPlanes = [];
    });
    // Camera looking from front-elevation three-quarter:
    // Penthouse spans X: -6.5 to +14.3 (Center X: 3.88).
    // Elevated 3/4 angle from [-6.0, 15.0, -8.0] looking at [4.0, 1.0, 1.5]
    v.camera.position.set(-6.0, 16.0, -8.5);
    v.controls.target.set(3.88, 1.0, 1.5);
    v.camera.fov = 40;
    v.camera.updateProjectionMatrix();
    v.controls.update();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, 'cutaway_north_west_three_quarter.png') });

  // Test 5: Elevated South-West three-quarter with higher pitch (looking from living room end down the entire suite)
  await page.evaluate(() => {
    const v = window.__VISTA_VIEWER__;
    v.camera.position.set(-11.5, 15.5, 9.5);
    v.controls.target.set(3.88, 1.0, 1.5);
    v.camera.fov = 38;
    v.camera.updateProjectionMatrix();
    v.controls.update();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, 'cutaway_south_west_three_quarter.png') });

  // Test 6: Elevated North-East three-quarter (from bedroom corner looking across toward living room)
  await page.evaluate(() => {
    const v = window.__VISTA_VIEWER__;
    v.camera.position.set(16.5, 15.5, -8.5);
    v.controls.target.set(3.88, 1.0, 1.5);
    v.camera.fov = 38;
    v.camera.updateProjectionMatrix();
    v.controls.update();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, 'cutaway_north_east_three_quarter.png') });

  await browser.close();
}

run().catch(console.error);
