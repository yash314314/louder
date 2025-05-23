const puppeteer = require('puppeteer');

async function scrapeEventbrite() {
  const browser = await puppeteer.launch({
    headless: true,

  });

  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
  );

  const url = 'https://www.eventbrite.com/d/australia--sydney/events/';
  await page.goto(url, { waitUntil: 'networkidle2' });

 
  await autoScroll(page);
  await new Promise(resolve => setTimeout(resolve, 9000));

  const events = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.discover-vertical-event-card'));
    
    return cards.map(card => {
      // Main data extraction
      const title = card.querySelector('.event-card__clamp-line--two')?.textContent?.trim() || 'N/A';
      const dateTime = card.querySelector('.Typography_body-md-bold__487rx:nth-of-type(1)')?.textContent?.trim() || 'N/A';
      const location = card.querySelector('.event-card__clamp-line--one')?.textContent?.trim() || 'N/A';
      const price = card.querySelector('.DiscoverVerticalEventCard-module__priceWrapper___usWo6 p')?.textContent?.trim() || 'Free';
      const link = card.querySelector('.event-card-link')?.href || 'N/A';
      const imageUrl = card.querySelector('.event-card-image')?.src || 'N/A';
      const urgencyText = card.querySelector('.EventCardUrgencySignal__label')?.textContent?.trim() || null;
      
      return { 
        title, 
        dateTime, 
        location, 
        price,  
        link,
        imageUrl,
        urgencyText
      };
    });
  });

  console.log(`✅ Scraped ${events.length} events.`);
  console.log(events.slice(0, 5));

  await browser.close();
  return events;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}
module.exports = { scrapeEventbrite };