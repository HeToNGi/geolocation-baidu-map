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
    await page.goto('http://10.200.33.25:3000/index.html');
    // console.log(await page.title());
    // await browser.close();
  } catch (error) {
    console.log(error)
  }
}
module.exports = startPuppeteer;
