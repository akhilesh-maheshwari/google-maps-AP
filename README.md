# 📍 Google Maps Scraper

Extract structured business and location data from Google Maps using a search term and location. Collect business names, categories, ratings, reviews, addresses, phone numbers, websites, Google Maps URLs, and additional website-level contact and company information.

Ideal for local lead generation, market research, directory building, competitor research, and location-based prospecting.

---

## ⚙️ Input Configuration

Provide a country, location, and one or more business search terms. You can also set the maximum number of places to collect and apply an availability filter.

| Input | Description | Example |
|---|---|---|
| `country` | Two-letter country code used to focus the search | `US` |
| `location` | City, region, state, or area to search | `New York` |
| `searchTerms` | Business type, category, service, or keyword | `hospitals` |
| `filters` | Return businesses that match the selected data condition | `With Phones` |
| `language` | Language code for Google Maps results | `en` |
| `maxPlaces` | Maximum number of places to return | `150` |
| `fileName` | Name used for the output file | `output` |

### Sample Input

```json
{
  "country": "US",
  "fileName": "output",
  "filters": "With Phones",
  "language": "en",
  "location": "New York",
  "maxPlaces": 150,
  "searchTerms": "hospitals"
}
```

---

## 🔎 What You Can Search

The scraper works with location-based business searches such as:

- Hospitals in New York
- Dentists in Chicago
- Restaurants in London
- Real estate agencies in Dubai
- Digital marketing agencies in Los Angeles
- Hotels in Paris

You can change the country, location, search term, language, and result limit for each run.

---

## 📌 Data Fields Included

### Google Maps Data

| Field | Description |
|---|---|
| `place_id` | Unique Google Maps identifier for the place |
| `name` | Business or location name |
| `category` | Primary Google Maps business category |
| `rating` | Average Google rating |
| `review_count` | Total number of Google reviews |
| `price` | Available Google Maps price level |
| `address` | Full business address |
| `phone` | Business phone number, when available |
| `website` | Business website URL, when available |
| `email` | Business email address, when available |
| `maps_url` | Direct URL to the Google Maps listing |

### Website and Company Enrichment

| Field | Description |
|---|---|
| `ws_title` | Title detected on the business website |
| `ws_emails` | Email addresses found on the website |
| `ws_phones` | Phone numbers found on the website |
| `ws_social_links` | Social media profile URLs found on the website |
| `ws_description` | Description extracted from the website |
| `ws_legal_name` | Business legal name, when detected |
| `ws_founding_date` | Business founding date, when detected |
| `ws_employees` | Estimated or published employee count, when detected |
| `ws_has_contact_form` | Indicates whether the website contains a contact form |
| `ws_address` | Address found directly on the website |
| `ws_logo` | Business logo URL, when detected |
| `ws_scrape_status` | Status of the website-enrichment process |

> Fields may be empty when the information is not published on Google Maps or cannot be found on the business website.

---

## 📊 Sample Output

```json
{
  "place_id": "ChIJ-fj4-q5VwokR3LxBL7oQpL4",
  "name": "Silver Lake Hospital",
  "category": "General hospital",
  "rating": 4,
  "review_count": 110,
  "price": "",
  "address": "Silver Lake Hospital, 495 N 13th St, Newark, NJ 07107, United States",
  "phone": "",
  "website": "https://silverlakehospital.org/",
  "email": "",
  "maps_url": "https://www.google.com/maps/search/Silver%20Lake%20Hospital/@0,0,14z/data=!4m2!3m1!1s0x89c255aefaf8f8f9:0xbea410ba2f41bcdc",
  "ws_title": "",
  "ws_emails": "",
  "ws_phones": "",
  "ws_social_links": "",
  "ws_description": "",
  "ws_legal_name": "",
  "ws_founding_date": "",
  "ws_employees": "",
  "ws_has_contact_form": "",
  "ws_address": "",
  "ws_logo": "",
  "ws_scrape_status": ""
}
```

---

## 💰 Pricing

The scraper is available on a pay-per-result basis:

- **Google Maps places:** from **$3.00 per 1,000 results**

You are charged only for the places returned by the actor.

---

## 📁 How to Use

1. Create a free [Apify](https://apify.com) account.
2. Open the **Google Maps Scraper** actor.
3. Enter the **country** and **target location**.
4. Add the **business category** or search term.
5. Select the required **filter** (e.g., `With Phones`).
6. Set the **maximum number of places**.
7. Run the actor.
8. Download the structured output in **JSON**, **CSV**, or **Excel** format.

---

## ✅ Common Use Cases

- Build local business prospect lists
- Find businesses with publicly available phone numbers
- Collect company websites and contact details
- Research competitors by location or category
- Create business directories
- Identify potential customers in a specific market
- Enrich business records with website and social information

---

## ⚠️ Data Availability

The actor returns publicly available information. Field availability varies by listing and website. A blank value means the data was not available or could not be detected for that business.
