const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // We will save everything into a 'public-lovable' folder
    const outDir = path.join(__dirname, 'public-lovable');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const assetsDir = path.join(outDir, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    page.on('response', async (response) => {
      const url = response.url();
      if (url.startsWith('https://vibe-plan-space.lovable.app/assets/')) {
        const buffer = await response.buffer();
        const fileName = url.split('/').pop();
        fs.writeFileSync(path.join(assetsDir, fileName), buffer);
        console.log('Saved asset:', fileName);
      }
    });

    await page.goto('https://vibe-plan-space.lovable.app', { waitUntil: 'networkidle0' });
    
    // Save the HTML
    const html = await page.content();
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log('Saved index.html');
    
    await browser.close();
    console.log('Download complete.');
  } catch (error) {
    console.error('Error:', error);
  }
})();
