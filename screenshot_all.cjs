const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '../brain/12ed863c-35f8-45c0-9c0f-2a2b462363b1/local_matrix_screenshot_reborn.png', fullPage: true });

  await browser.close();
})();
