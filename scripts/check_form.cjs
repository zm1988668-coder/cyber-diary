const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://100t.xiaomimimo.com/', { waitUntil: 'networkidle2', timeout: 30000 });

  const btn = await page.$('button.styles_waitlistBtn__b115ff05');
  if (btn) {
    await btn.click();
    await new Promise(r => setTimeout(r, 3000));
  }

  const allText = await page.evaluate(() => {
    // Get all buttons on the page
    const allButtons = Array.from(document.querySelectorAll('button, a, [role=button], input[type=submit], input[type=button]'));
    const btnInfo = allButtons.map(b => ({
      tag: b.tagName,
      type: b.type || '',
      text: (b.textContent || b.value || '').substring(0, 80),
      class: b.className.substring(0, 80),
      id: b.id,
      visible: b.offsetParent !== null,
    }));

    // Get all text content near the form area
    const bodyText = document.body.innerText;

    return { buttons: btnInfo, bodySample: bodyText.substring(0, 2000) };
  });

  console.log(JSON.stringify(allText, null, 2));
  await browser.close();
})();
