const puppeteer = require('puppeteer');
async function startPuppeteer() {
  let launchParameters = {
    args: [
      '--disable-setuid-sandbox',
      '--no-sandbox',
    ],
    headless: true
  };
  const browser = await puppeteer.launch(launchParameters); // 设置 headless 为 false 以便观察 WebGL 渲染
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/index.html',  { timeout: 120000 });
}

module.exports = {
  startPuppeteer
}

