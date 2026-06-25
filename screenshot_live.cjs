const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('https://vibe-plan-space.lovable.app', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\12ed863c-35f8-45c0-9c0f-2a2b462363b1\\live_url_screenshot.png', fullPage: true });
    await browser.close();
    console.log('Screenshot of live URL saved successfully.');
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
})();
