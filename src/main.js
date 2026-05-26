import { Actor } from 'apify';
import { PlaywrightCrawler, Dataset, log } from 'crawlee';
import { extractPlaceDetails } from './extractor.js';
import { buildSearchUrl, scrollResultsList } from './utils.js';

// ─── Init Actor ───────────────────────────────────────────────────────────────
await Actor.init();

const input = await Actor.getInput();

const {
  searchTerms = [],
  location = '',
  maxPlaces = 150,
  language = 'en',
  includeReviews = false,
  maxReviews = 10,
  includeImages = false,
  proxyConfig,
} = input;

if (!searchTerms.length) {
  throw new Error('No search terms provided. Please add at least one search term.');
}

log.info(`Starting Google Maps Scraper`);
log.info(`Search terms: ${searchTerms.join(', ')}`);
log.info(`Location: ${location}`);
log.info(`Max places per term: ${maxPlaces}`);

// ─── Proxy Setup ─────────────────────────────────────────────────────────────
const proxyConfiguration = await Actor.createProxyConfiguration(proxyConfig);

// ─── Build Initial Requests ───────────────────────────────────────────────────
const startRequests = searchTerms.map((term) => ({
  url: buildSearchUrl(term, location, language),
  label: 'SEARCH',
  userData: {
    searchTerm: term,
    location,
    collectedCount: 0,
  },
}));

// ─── Crawler ──────────────────────────────────────────────────────────────────
const crawler = new PlaywrightCrawler({
  proxyConfiguration,
  headless: true,
  maxConcurrency: 3,
  navigationTimeoutSecs: 60,
  requestHandlerTimeoutSecs: 300,

  launchContext: {
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
    },
  },

  async requestHandler({ page, request, enqueueLinks, crawler }) {
    const { label, searchTerm, location } = request.userData;

    if (label === 'SEARCH') {
      await handleSearchPage({
        page,
        request,
        searchTerm,
        location,
        maxPlaces,
        includeReviews,
        includeImages,
        maxReviews,
        crawler,
      });
    } else if (label === 'PLACE_DETAIL') {
      await handlePlaceDetailPage({
        page,
        request,
        includeReviews,
        maxReviews,
        includeImages,
      });
    }
  },

  failedRequestHandler({ request, error }) {
    log.error(`Request ${request.url} failed: ${error.message}`);
  },
});

await crawler.run(startRequests);

log.info('Scraping finished!');
await Actor.exit();

// ─── Search Page Handler ──────────────────────────────────────────────────────
async function handleSearchPage({
  page,
  request,
  searchTerm,
  location,
  maxPlaces,
  includeReviews,
  includeImages,
  maxReviews,
  crawler,
}) {
  log.info(`Searching for: "${searchTerm}" in "${location}"`);

  // Wait for results to load
  await page.waitForSelector('[role="feed"]', { timeout: 30000 }).catch(() => {
    log.warning('Results feed not found, trying alternative selector');
  });

  await page.waitForTimeout(2000);

  const collectedUrls = new Set();
  let noNewResultsCount = 0;

  // Scroll and collect place URLs
  while (collectedUrls.size < maxPlaces) {
    const placeLinks = await page.$$eval(
      'a[href*="/maps/place/"]',
      (links) => links.map((a) => a.href)
    );

    const prevSize = collectedUrls.size;
    placeLinks.forEach((url) => {
      if (collectedUrls.size < maxPlaces) collectedUrls.add(url);
    });

    log.info(`Collected ${collectedUrls.size}/${maxPlaces} place URLs for "${searchTerm}"`);

    if (collectedUrls.size >= maxPlaces) break;

    // Check if no new results after scrolling
    if (collectedUrls.size === prevSize) {
      noNewResultsCount++;
      if (noNewResultsCount >= 3) {
        log.info(`No more results found for "${searchTerm}"`);
        break;
      }
    } else {
      noNewResultsCount = 0;
    }

    // Scroll down in results panel
    await scrollResultsList(page);
    await page.waitForTimeout(1500);
  }

  log.info(`Found ${collectedUrls.size} places for "${searchTerm}". Now visiting each...`);

  // Enqueue each place URL for detail scraping
  const requests = [...collectedUrls].map((url) => ({
    url,
    label: 'PLACE_DETAIL',
    userData: { searchTerm, location },
  }));

  await crawler.addRequests(requests);
}

// ─── Place Detail Handler ─────────────────────────────────────────────────────
async function handlePlaceDetailPage({
  page,
  request,
  includeReviews,
  maxReviews,
  includeImages,
}) {
  const { searchTerm, location } = request.userData;

  log.info(`Extracting details from: ${request.url}`);

  // Wait for place name to appear
  await page.waitForSelector('h1', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const placeData = await extractPlaceDetails(page, {
    url: request.url,
    searchTerm,
    location,
    includeReviews,
    maxReviews,
    includeImages,
  });

  if (placeData) {
    await Dataset.pushData(placeData);
    log.info(`✓ Saved: ${placeData.name}`);
  }
}
