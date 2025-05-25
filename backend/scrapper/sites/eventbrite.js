const puppeteer = require('puppeteer');

async function scrapeEventbrite() {
  console.time('Total scraping time');
  const browser = await puppeteer.launch({ headless: true });
  const mainPage = await browser.newPage();

  await mainPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)...');

  const url = 'https://www.eventbrite.com/d/australia--sydney/events/';
  await mainPage.goto(url, { waitUntil: 'networkidle2' });

  await autoScroll(mainPage);
  await new Promise(resolve => setTimeout(resolve, 5000)); 
  const events = await mainPage.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.discover-vertical-event-card'));
    return cards.map(card => ({
      title: card.querySelector('.event-card__clamp-line--two')?.textContent?.trim() || 'N/A',
      dateTime: card.querySelector('.Typography_body-md-bold__487rx:nth-of-type(1)')?.textContent?.trim() || 'N/A',
      location: card.querySelector('.event-card__clamp-line--one')?.textContent?.trim() || 'N/A',
      price: card.querySelector('.DiscoverVerticalEventCard-module__priceWrapper___usWo6 p')?.textContent?.trim() || 'Free',
      link: card.querySelector('.event-card-link')?.href || 'N/A',
      imageUrl: card.querySelector('.event-card-image')?.src || 'N/A',
      urgencyText: card.querySelector('.EventCardUrgencySignal__label')?.textContent?.trim() || null
    }));
  });

  console.log(`🔍 Scraping details in parallel for ${events.length} events...`);

  await Promise.all(
    events.map(async (event, i) => {
      const detailPage = await browser.newPage();
      try {
        await detailPage.goto(event.link, { waitUntil: 'networkidle2', timeout: 0 });
        const tags = await detailPage.evaluate(() => {
          return Array.from(document.querySelectorAll('li.tags-item a.tags-link'))
            .map(tag => tag.textContent.trim());
        });
        event.tags = tags;
        console.log(`✅ Event ${i + 1} done: ${event.title}`);
      } catch (err) {
        console.error(`❌ Error on event ${i + 1}`, err);
        event.tags = [];
      } finally {
        await detailPage.close();
      }
    })
  );

  console.timeEnd('Total scraping time');
  console.log('✅ Final data:');
  console.log(events);

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
      }, 150);
    });
  });
}

module.exports = { scrapeEventbrite };
