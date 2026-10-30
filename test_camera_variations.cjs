const { chromium } = require('playwright');
const path = require('path');

async function testAngles() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=default', '--disable-web-security']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173/properties/lumina-penthouse', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // We want to test different camera angles and cutaway options on the live Three.js scene
  // Let's inspect window / canvas context
  const testVariations = [
    // Variation 1: From Window side (Z-), elevated three-quarter: pos: [2.0, 16.0, -10.0], target: [3.88, 1.0, 1.5]
    { name: '1_from_window_side', pos: [3.88, 16.0, -10.0], target: [3.88, 1.0, 1.5], fov: 42 },
    // Variation 2: Elevated South-West three-quarter: pos: [-12.0, 15.0, 8.0], target: [3.88, 1.0, 1.5], fov: 42 },
    { name: '2_from_south_west', pos: [-14.0, 15.0, 8.0], target: [3.88, 1.0, 1.5], fov: 42 },
    // Variation 3: Elevated North-West three-quarter: pos: [-12.0, 15.0, -8.0], target: [3.88, 1.0, 1.5], fov: 42 },
    { name: '3_from_north_west', pos: [-12.0, 15.0, -8.0], target: [3.88, 1.0, 1.5], fov: 42 },
    // Variation 4: Elevated North-East three-quarter (bedroom window side): pos: [18.0, 15.0, -8.0], target: [3.88, 1.0, 1.5], fov: 42 },
    { name: '4_from_north_east', pos: [18.0, 15.0, -8.0], target: [3.88, 1.0, 1.5], fov: 42 },
    // Variation 5: High Top-Down dollhouse cutaway (pos: [3.88, 22.0, 2.0], target: [3.88, 1.0, 1.5])
    { name: '5_high_dollhouse_topdown', pos: [3.88, 22.0, 3.0], target: [3.88, 1.0, 1.5], fov: 42 },
  ];

  for (const v of testVariations) {
    await page.evaluate(({ pos, target, fov }) => {
      // Find canvas and interact with Three.js camera if possible
      // Let's find scene and camera via canvas or Three
    }, v);
  }

  await browser.close();
}
