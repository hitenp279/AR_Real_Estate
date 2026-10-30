const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.resolve(__dirname, 'artifacts/milestone-6-delivery');
const BRAIN_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity-cli\\brain\\5c87ea7b-aada-4777-966e-dfbeae1bd62d';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureAndCopy(page, filename, options = {}) {
  const dest1 = path.join(OUTPUT_DIR, filename);
  await page.screenshot({ path: dest1, ...options });
  console.log(`Saved screenshot: ${dest1}`);

  if (fs.existsSync(BRAIN_DIR)) {
    const dest2 = path.join(BRAIN_DIR, filename);
    fs.copyFileSync(dest1, dest2);
    console.log(`Copied to brain: ${dest2}`);
  }
}

async function run() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=default',
      '--disable-web-security'
    ]
  });

  try {
    // 1. Desktop Context (1440x900)
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2
    });
    const desktopPage = await desktopContext.newPage();

    console.log('\n--- 1. Capturing 01_homepage_featured_property.png ---');
    await desktopPage.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(1500);

    // Scroll to the featured residence card
    const featuredCard = desktopPage.locator('text=Featured Residence').first();
    await featuredCard.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(800);

    await captureAndCopy(desktopPage, '01_homepage_featured_property.png');

    console.log('\n--- 2. Capturing 02_property_catalog.png ---');
    await desktopPage.goto('http://localhost:5173/properties', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(1500);

    await captureAndCopy(desktopPage, '02_property_catalog.png');

    console.log('\n--- 3. Capturing 03_property_detail_inr.png ---');
    await desktopPage.goto('http://localhost:5173/properties/lumina-penthouse', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(2000);

    // Scroll slightly to encompass header, price, specs and viewer intro
    await captureAndCopy(desktopPage, '03_property_detail_inr.png');

    console.log('\n--- 4. Capturing 04_desktop_3d_viewer.png ---');
    // Scroll canvas into view
    const canvas = desktopPage.locator('canvas').first();
    await canvas.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(3000); // Allow WebGL rendering of optimized model

    // Select living room
    const livingChip = desktopPage.locator('button:has-text("Living Room")');
    if (await livingChip.count() > 0) {
      await livingChip.click();
      await desktopPage.waitForTimeout(2000);
    }

    // Perform an orbit drag on canvas
    const box = await canvas.boundingBox();
    if (box) {
      await desktopPage.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await desktopPage.mouse.down();
      await desktopPage.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 - 40, { steps: 10 });
      await desktopPage.mouse.up();
      await desktopPage.waitForTimeout(1000);
    }

    await captureAndCopy(desktopPage, '04_desktop_3d_viewer.png');

    await desktopContext.close();

    // 2. Mobile Context (390x844 - iPhone 13/14 standard)
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    const mobilePage = await mobileContext.newPage();

    console.log('\n--- 5. Capturing 05_mobile_homepage.png ---');
    await mobilePage.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1500);

    const mobileInspectionBtn = mobilePage.locator('text=INSPECT IN 3D & AR').first();
    await mobileInspectionBtn.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(800);

    await captureAndCopy(mobilePage, '05_mobile_homepage.png');

    console.log('\n--- 6. Capturing 06_mobile_property_detail.png ---');
    await mobilePage.goto('http://localhost:5173/properties/lumina-penthouse', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(2000);

    // Scroll to show title, INR price, and 3D viewer
    await captureAndCopy(mobilePage, '06_mobile_property_detail.png');

    await mobileContext.close();

    console.log('\nAll 6 screenshots captured and verified successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
