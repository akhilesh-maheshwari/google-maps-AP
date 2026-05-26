import { Actor } from 'apify';

await Actor.init();

const input = await Actor.getInput();

// Call YOUR backend
const response = await fetch('https://your-backend.com/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(input),
});

const results = await response.json();

// Save to Apify dataset
for (const place of results) {
  await Actor.pushData(place);
}

await Actor.exit();
