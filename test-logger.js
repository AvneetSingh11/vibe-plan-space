import puppeteer from "puppeteer";

(async () => {
  console.log("Starting puppeteer...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on("console", (msg) => {
    console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
  });

  page.on("pageerror", (err) => {
    console.error("PAGE ERROR:", err.message);
  });

  page.on("requestfailed", (request) => {
    console.error("REQUEST FAILED:", request.url(), request.failure()?.errorText);
  });

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000");
  
  // Wait for the app to load
  await page.waitForSelector("body");
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("App loaded. Closing browser...");
  await browser.close();
})();
