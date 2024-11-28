const puppeteer = require('puppeteer');
let launchParameters = {
  args: [
    '--disable-setuid-sandbox',
    '--no-sandbox',
  ],
  headless: true
};
(async () => {
  try {
    const browser = await puppeteer.launch(launchParameters);
    const page = await browser.newPage();
    await page.goto('https://www.baidu.com/');
    console.log(await page.title());
    await browser.close();
  } catch (error) {
    console.log(error)
  }
})();