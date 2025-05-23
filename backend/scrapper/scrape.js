const { scrapeEventbrite } = require('./sites/eventbrite');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const OUTPUT_FILE = path.join(__dirname, 'events.json');
const SCRAPE_INTERVAL = '*/30 * * * *'; 


function readExistingEvents() {
  if (fs.existsSync(OUTPUT_FILE)) {
    const data = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    try {
      return JSON.parse(data);
    } catch {
      console.warn('⚠️ Warning: Could not parse existing events JSON, starting fresh.');
      return [];
    }
  }
  return [];
}


function mergeEvents(existingEvents, newEvents) {
  const seen = new Set(existingEvents.map(e => e.url));
  const filteredNew = newEvents.filter(e => !seen.has(e.url));
  return [...existingEvents, ...filteredNew];
}

async function runScraper() {
  try {
    console.log('⏳ Starting Eventbrite scraping...');
    const startTime = Date.now();

    const newEvents = await scrapeEventbrite();

    const existingEvents = readExistingEvents();

    const combinedEvents = mergeEvents(existingEvents, newEvents);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Scraped ${newEvents.length} new events`);
    console.log(`🔄 Merged total: ${combinedEvents.length} unique events (${duration}s)`);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(combinedEvents, null, 2));
    console.log(`📁 Results saved to ${OUTPUT_FILE}`);

    console.log('🔍 Sample events:');
    console.log(combinedEvents.slice(0, 3));

    return combinedEvents;
  } catch (err) {
    console.error('❌ Scraping failed:', err.message);
    throw err;
  }
}

console.log('🚀 Eventbrite Scraper Initialized');
runScraper().catch(console.error);

cron.schedule(SCRAPE_INTERVAL, () => {
  console.log('\n⏰ Scheduled scrape triggered');
  runScraper().catch(console.error);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});
