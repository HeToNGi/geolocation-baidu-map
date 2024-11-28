const puppeteer = require('puppeteer');
let launchParameters = {
  args: [
    '--disable-setuid-sandbox',
    '--no-sandbox',
  ],
  headless: true
};
const startPuppeteer = async () => {
  try {
    const browser = await puppeteer.launch(launchParameters);
    const page = await browser.newPage();
    page.on('console', (msg) => {
      console.log(`LOG FROM PAGE: ${new Date().toISOString()}:${msg.text()}`);
    });  
    // await page.goto('http://10.200.33.25:3000/index.html');
    await page.goto('http://localhost:3000/index.html');
    // console.log(await page.title());
    // await browser.close();
  } catch (error) {
    console.log(error)
  }
}
module.exports = startPuppeteer;
