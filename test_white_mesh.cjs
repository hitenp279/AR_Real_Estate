const { chromium } = require('playwright');
const path = require('path');

async function testWhiteMesh() {
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

  // Test with Apple_Adaptor_White1_0 visible = true
  await page.evaluate(() => {
    const v = window.__VISTA_VIEWER__;
    v.model.traverse(node => {
      if (node.name === 'Apple_Adaptor_White1_0') node.visible = true;
    });
    // Set camera to dining table perspective
    v.camera.position.set(0.15, 2.6, 3.8);
    v.controls.target.set(0.15, 0.75, 1.54);
    v.camera.fov = 42;
    v.camera.updateProjectionMatrix();
    v.controls.update();
  });

  await page.waitForTimeout(1000);
  await canvas.screenshot({ path: 'test_dining_with_white_visible.png' });
  console.log('Saved test_dining_with_white_visible.png');

  await browser.close();
}

testWhiteMesh().catch(console.error);
