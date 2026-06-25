const puppeteer = require('puppeteer');
const fs = require('fs');

function htmlToJsx(html) {
  let jsx = html;
  jsx = jsx.replace(/class=/g, 'className=');
  jsx = jsx.replace(/stroke-width=/g, 'strokeWidth=');
  jsx = jsx.replace(/stroke-linecap=/g, 'strokeLinecap=');
  jsx = jsx.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
  jsx = jsx.replace(/clip-rule=/g, 'clipRule=');
  jsx = jsx.replace(/fill-rule=/g, 'fillRule=');
  
  // Self close inputs
  jsx = jsx.replace(/<input([^>]+)>/g, (match, attrs) => {
    if (attrs.trim().endsWith('/')) return match;
    return `<input${attrs} />`;
  });
  
  return jsx;
}

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    await page.goto('https://vibe-plan-space.lovable.app', { waitUntil: 'networkidle0' });
    
    const tabs = ['matrix', 'habits', 'mind', 'voice'];
    
    for (const tab of tabs) {
      await page.evaluate((tabName) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent && b.textContent.toLowerCase().includes(tabName));
        if (btn) btn.click();
      }, tab);
      
      await new Promise(r => setTimeout(r, 1000)); // wait for transition
      
      const html = await page.evaluate(() => {
        const main = document.querySelector('main');
        return main ? main.innerHTML : '';
      });
      
      const jsx = htmlToJsx(html);
      fs.writeFileSync(`jsx_${tab}.txt`, jsx);
      console.log(`Scraped ${tab} and saved to jsx_${tab}.txt`);
    }
    
    await browser.close();
  } catch (error) {
    console.error('Error scraping:', error);
  }
})();
