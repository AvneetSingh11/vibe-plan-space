const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Log network requests
    page.on('request', request => {
      console.log('>>', request.method(), request.url());
    });
    
    // Log console messages
    page.on('console', msg => {
      console.log('CONSOLE:', msg.text());
    });

    await page.goto('https://vibe-plan-space.lovable.app', { waitUntil: 'networkidle0' });
    
    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
})();
