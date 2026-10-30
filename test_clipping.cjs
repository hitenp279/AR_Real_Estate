const { chromium } = require('playwright');
const path = require('path');

async function testClipping() {
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

  const result = await page.evaluate(async () => {
    const v = window.__VISTA_VIEWER__;
    const threeMod = await import('/node_modules/.vite/deps/three.js');
    const THREE = threeMod.Plane ? threeMod : (threeMod.default || threeMod);

    // Let's find renderer in scene or canvas
    // In ThreeCanvas, renderer is stored in rendererRef.current
    // Let's see if rendererRef is accessible or if we can get it from v
  });

  await browser.close();
}
