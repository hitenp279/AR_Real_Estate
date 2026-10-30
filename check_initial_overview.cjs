const { chromium } = require('playwright');
const path = require('path');

async function checkInitialOverview() {
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
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'test_lumina_initial_overview.png' });
  console.log('Saved test_lumina_initial_overview.png');

  await browser.close();
}

checkInitialOverview().catch(console.error);
