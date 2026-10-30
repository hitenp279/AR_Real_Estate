const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testViews() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=default', '--disable-web-security']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173/properties/lumina-penthouse', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Let's test camera angles by evaluating in the page
  const viewpoints = [
    // 1. Current default (south side Z+, looking towards Z-)
    { id: 'view_current', pos: [3.38, 17.7, 11.98], target: [3.88, 1.2, 1.48] },
    // 2. Opposite side (north window side Z-, looking towards Z+)
    { id: 'view_north_window', pos: [3.88, 15.0, -9.0], target: [3.88, 1.0, 1.5] },
    // 3. Elevated three-quarter perspective from South-West (looking across living, kitchen, office, bedroom)
    { id: 'view_elevated_sw', pos: [-12.0, 14.0, 11.0], target: [3.88, 1.0, 1.5] },
    // 4. Elevated three-quarter perspective from North-West (window side, looking along the entire apartment)
    { id: 'view_elevated_nw', pos: [-10.0, 13.0, -8.0], target: [4.0, 1.0, 1.5] },
    // 5. Elevated three-quarter from North-East (from bedroom side looking through toward living room)
    { id: 'view_elevated_ne', pos: [18.0, 13.0, -8.0], target: [4.0, 1.0, 1.5] },
    // 6. Elevated three-quarter from South-East (bedroom side south)
    { id: 'view_elevated_se', pos: [18.0, 14.0, 10.0], target: [4.0, 1.0, 1.5] },
  ];

  for (const vp of viewpoints) {
    await page.evaluate(({ pos, target }) => {
      // Find the camera and controls from the ThreeCanvas component or Three scene
      const canvas = document.querySelector('canvas');
      // In Three.js, we can dispatch or trigger camera change if accessible, or manipulate camera via Three
    }, vp);
  }

  await browser.close();
}

testViews().catch(console.error);
