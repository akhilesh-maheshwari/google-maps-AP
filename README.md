# 🗺️ Google Maps Scraper

Scrape business data from Google Maps by search terms and location.

## What it extracts

| Field | Description |
|-------|-------------|
| name | Business name |
| rating | Star rating (1–5) |
| reviewCount | Total number of reviews |
| category | Business category |
| address | Full address |
| phone | Phone number |
| website | Website URL |
| hours | Opening hours per day |
| latitude | GPS latitude |
| longitude | GPS longitude |
| images ($) | Photo URLs |
| reviews ($) | Customer reviews |

## Input example

```json
{
  "searchTerms": [
    "Botanical ingredients supplier",
    "Food ingredient supplier",
    "Nutraceutical manufacturer"
  ],
  "location": "New York, USA",
  "maxPlaces": 150,
  "language": "en",
  "includeReviews": false,
  "includeImages": false
}
```

## How to run

1. Set search terms
2. Set location (one per run)
3. Set max places per term
4. Click **Save & Start**

## Notes

- Fields marked ($) cost extra credits
- Use Residential proxies for best results
- Max 500 places per search term per run
