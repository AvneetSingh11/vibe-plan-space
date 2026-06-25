const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    await page.goto('https://vibe-plan-space.lovable.app', { waitUntil: 'networkidle0' });
    
    // The tabs are: today, matrix, habits, mind, voice
    const tabs = ['matrix', 'habits', 'mind', 'voice'];
    
    for (const tab of tabs) {
      await page.evaluate((tabName) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent && b.textContent.toLowerCase().includes(tabName));
        if (btn) btn.click();
      }, tab);
      
      await new Promise(r => setTimeout(r, 1500)); // wait for transition
      await page.screenshot({ path: `C:\\Users\\User\\.gemini\\antigravity\\brain\\12ed863c-35f8-45c0-9c0f-2a2b462363b1\\live_url_${tab}.png`, fullPage: true });
      console.log(`Screenshot saved for ${tab}`);
    }
    
    await browser.close();
    console.log('All screenshots saved successfully.');
  } catch (error) {
    console.error('Error taking screenshots:', error);
  }
})();
