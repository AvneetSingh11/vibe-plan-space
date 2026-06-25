const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Go to local dev server
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Click the Matrix tab
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent && b.textContent.toLowerCase().includes('matrix'));
        if (btn) btn.click();
    });
    
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\12ed863c-35f8-45c0-9c0f-2a2b462363b1\\local_matrix_screenshot.png', fullPage: true });
    await browser.close();
    console.log('Screenshot saved successfully.');
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
})();
