# 📍 Google Maps Scraper

Turn any Google Maps search into a ready-to-use business lead list. Enter a search term and a location, choose how many businesses you want, and get structured data for every place: business names, categories, ratings, reviews, full addresses, coordinates, opening hours, websites, emails, social links and more.

📦 The **Base Plan** gives you essential Google Maps business data plus available 📧 emails and social links. For deeper prospecting, turn on the optional add-ons:

- 🏢 **Company Insights**: company name, industry, company size, founded year, LinkedIn profile, headquarters address and social profile details
- 📞 **Phone Numbers & Phone Details**: main phone number, additional phone numbers, company phone lines and phone type

💳 Only pay for the data you need. Pick the add-ons you want and start extracting.

Use the actor for local lead generation, sales prospecting, market research, directory building, competitor research and location-based outreach.

---

## ⚙️ Input Configuration

Enter one search term and one location per run. You can also set the country, language and the maximum number of places to extract, and turn add-ons on or off.

| Input | Description | Example |
|---|---|---|
| 📄 File Name | Name used for the output file | `output` |
| 🔎 Search Term *(required)* | Business type, category, service or keyword | `hospitals` |
| 📍 Location *(required)* | City, region, state or area to search. Use only one location per run. | `New York` |
| 🌍 Country | Country used to focus the search | `United States` |
| 🔢 Number of Places | Maximum number of places to extract per search term | `150` |
| 🌐 Language | Language of the Google Maps results | `English` |
| 🏢 Enable Company Insights | Adds company-level data to each result (paid add-on) | `true` |
| 📞 Enable Phone Numbers & Phone Details | Adds extra phone numbers and phone details to each result (paid add-on) | `true` |

### Sample Input

```json
{
  "fileName": "output",
  "searchTerms": "hospitals",
  "location": "New York",
  "country": "US",
  "maxPlaces": 150,
  "language": "en",
  "enableCompanyInsights": true,
  "enablePhoneDetails": true
}
```

---

## 🔎 What You Can Search

The actor works with any location-based business search, such as:

- Hospitals in New York
- Dentists in Chicago
- Restaurants in London
- Real estate agencies in Dubai
- Digital marketing agencies in Los Angeles
- Hotels in Paris

You can change the search term, location, country, language and result limit for each run.

---

## 📌 Data Fields Included

### 📦 Base Plan: Google Maps Business Data

**Business details**

| Field | Description |
|---|---|
| `record_id` | Unique ID of the record in this dataset |
| `name` | Business or location name |
| `category` | Primary Google Maps category |
| `type` | Business type |
| `categories` | All Google Maps categories for the place |
| `subtypes` | All categories as a comma-separated list |
| `description` | Business description from Google Maps, when available |
| `website` | Business website URL |
| `website_domain` | Website domain |

**Location**

| Field | Description |
|---|---|
| `full_address` | Full business address |
| `street` | Street address |
| `locality` | Neighborhood or locality |
| `city` | City |
| `state` / `state_code` | State name and code |
| `county` | County |
| `postal_code` | Postal / ZIP code |
| `country_code` | Two-letter country code |
| `latitude` / `longitude` | Coordinates of the place |
| `h3` | H3 geospatial index |
| `plus_code` | Google Plus Code |
| `time_zone` | Time zone of the place |

**Ratings, reviews and status**

| Field | Description |
|---|---|
| `rating` | Average Google rating |
| `review_count` | Total number of Google reviews |
| `reviews_per_score` | Number of reviews for each star rating (1-5) |
| `popular_times` | Popular visiting times, when available |
| `price_level` / `price_range` | Google Maps price level and range, when available |
| `business_status` | Operational status (for example, `OPERATIONAL`) |
| `verified` | Whether the listing is verified |
| `claimed` | Whether the listing has been claimed by the owner |
| `permanently_closed` / `temporarily_closed` | Closure flags |
| `open_status` | Current opening status |
| `hours_csv` | Opening hours for each day of the week |
| `about` | Attributes such as accessibility, amenities and services |

**Links and media**

| Field | Description |
|---|---|
| `maps_url` | Google Maps search URL for the place |
| `location_link` | Direct link to the Google Maps listing |
| `reviews_link` | Direct link to the Google reviews page |
| `menu_link` | Menu link, when available |
| `reservation_link` | Reservation link, when available |
| `booking_link` | Booking link, when available |
| `order_links` | Online ordering links, when available |
| `photo_count` | Number of photos on the listing |
| `main_image_url` | Main listing image |
| `logo` | Business logo from Google Maps |
| `street_view` | Street View link for the location |

**Owner and identifiers**

| Field | Description |
|---|---|
| `owner_id` | Google ID of the listing owner |
| `owner_title` | Owner display name on Google Maps |
| `owner_link` | Link to the owner's Google Maps profile |
| `owner_name` / `owner_source` | Owner name and where it was found, when available |
| `place_id` | Google Maps Place ID |
| `cid` | Google Customer ID (CID) |
| `google_id` | Google feature ID |
| `kgmid` | Google Knowledge Graph ID |
| `query` | Search query used to find the place |
| `source` | Data source |
| `scraped_at` | Date and time the record was collected |

**📧 Emails** *(included free in the Base Plan)*

| Field | Description |
|---|---|
| `email` | Main business email address |
| `other_emails` | Additional email addresses found |
| `email_status` | Whether an email was found |
| `email_confidence` | Confidence level of the email |
| `email_source` | Where the email was found (for example, `website`) |
| `name_for_emails` | Normalized business name used for email matching |

**🔗 Social links**

| Field | Description |
|---|---|
| `social_links` | All social media profile URLs found |
| `facebook_url` | Facebook page URL |
| `instagram_url` | Instagram profile URL |
| `linkedin_url` | LinkedIn page URL |
| `x_url` | X (Twitter) profile URL |
| `youtube_url` | YouTube channel URL |
| `tiktok_url` | TikTok profile URL |
| `pinterest_url` | Pinterest profile URL |

### 🏢 Add-on: Company Insights

Go beyond basic business data with company-level information that helps you understand, segment and qualify the businesses in your lead list.

| Field | Description |
|---|---|
| `company_name` | Company name linked to the business |
| `company_insights.name` | Company name from company data |
| `company_insights.industry` | Industry |
| `li_industry` | Industry listed on LinkedIn |
| `li_company_url` | LinkedIn company page URL |
| `founded_year` | Year the company was founded |
| `li_employee_count` | Employee count listed on LinkedIn |
| `company_insights.employees` | Company size (number of employees) |
| `company_insights.revenue` | Estimated revenue, when available |
| `company_insights.is_public` | Whether the company is publicly traded |
| `company_insights.address` | Company headquarters address |
| `company_insights.city` / `.state` / `.zip` / `.country` | Headquarters city, state, ZIP and country |
| `contact_name` / `contact_first_name` / `contact_last_name` | Key contact name, when available |
| `contact_headline` | Key contact's job title or headline, when available |
| `website_title` | Title of the business website |
| `website_description` | Description of the business website |
| `website_generator` | Website platform or CMS (for example, WordPress) |
| `website_has_gtm` | Whether the website uses Google Tag Manager |
| `website_has_fb_pixel` | Whether the website uses the Facebook (Meta) Pixel |
| `facebook` / `instagram` / `linkedin` / `x` / `youtube` / `tiktok` / `pinterest` | Social profile details: profile name, handle, bio, followers and posts |
| `social_scraped_at` | Date and time the social profiles were collected |

### 📞 Add-on: Phone Numbers & Phone Details

Get more ways to reach your prospects. Enrich each result with extra phone numbers and phone information collected from available business sources and websites.

| Field | Description |
|---|---|
| `phone` | Main business phone number |
| `phone_type` | Type of the main phone number |
| `other_phones` | Additional phone numbers for the business |
| `company_phone` | Main company phone number |
| `company_phones` | All company phone numbers found |
| `company_phone_type` | Type of the company phone number |
| `phone_carrier` | Carrier of the main phone number, when available |
| `company_phone_carrier` | Carrier of the company phone number, when available |

> Fields may be empty when the information isn't published on Google Maps, the business website or other available sources.

---

## 📊 Sample Output

```json
{
  "record_id": 386686832,
  "name": "Mount Sinai Brooklyn",
  "category": "General hospital",
  "type": "hospital",
  "categories": ["General hospital", "Emergency room", "Hospital"],
  "website": "https://www.mountsinai.org/locations/brooklyn",
  "website_domain": "mountsinai.org",
  "full_address": "Mount Sinai Brooklyn, 3201 Kings Hwy, Brooklyn, NY 11234",
  "street": "3201 Kings Hwy",
  "locality": "Flatlands",
  "city": "Brooklyn",
  "state": "New York",
  "state_code": "NY",
  "county": "Kings",
  "postal_code": "11234",
  "country_code": "US",
  "latitude": 40.6187324,
  "longitude": -73.9429871,
  "plus_code": "87G8J394+FR",
  "time_zone": "America/New_York",
  "email": "occmed@mssm.edu",
  "other_emails": [],
  "email_status": "found",
  "email_confidence": "unverified",
  "email_source": "website",
  "rating": 2.6,
  "review_count": 483,
  "reviews_per_score": { "1": 257, "2": 27, "3": 21, "4": 27, "5": 151 },
  "business_status": "OPERATIONAL",
  "verified": true,
  "claimed": true,
  "permanently_closed": false,
  "temporarily_closed": false,
  "open_status": "Open 24 hours",
  "about": {
    "Accessibility": {
      "Wheelchair accessible entrance": true,
      "Wheelchair accessible parking lot": true
    }
  },
  "location_link": "https://www.google.com/maps/place/Mount%20Sinai%20Brooklyn/@40.6187324,-73.9429871,17z/data=!4m5!3m4!1s0x89c244a5cac34567:0x784f36c592530078!8m2!3d40.6187324!4d-73.9429871",
  "reviews_link": "https://search.google.com/local/reviews?placeid=ChIJZ0XDyqVEwokReABTksU2T3g",
  "photo_count": 47,
  "street_view": "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.6187324,-73.9429871",
  "facebook_url": "https://www.facebook.com/mountsinainyc",
  "instagram_url": "https://www.instagram.com/mountsinainyc",
  "linkedin_url": "https://www.linkedin.com/company/mountsinainyc",
  "x_url": "https://x.com/mountsinainyc",
  "youtube_url": "https://www.youtube.com/user/mountsinainy",
  "place_id": "ChIJZ0XDyqVEwokReABTksU2T3g",
  "cid": "104942216894043055734",
  "kgmid": "/g/1hc4c72wc",
  "query": "hospitals in New York",
  "scraped_at": "2026-09-23 08:58:06.936+00",

  "phone": "17182523000",
  "phone_type": "fixed_or_mobile",
  "other_phones": ["+12122567000", "+12122416500", "+18777688462"],
  "company_phone": "12122567000",
  "company_phones": ["+12122416500", "+12122416544", "+12122526000"],
  "company_phone_type": "fixed_or_mobile",

  "company_name": "Mount Sinai Health System",
  "company_insights.industry": "Hospitals and Health Care",
  "li_company_url": "https://www.linkedin.com/company/mountsinainyc",
  "founded_year": 2013,
  "company_insights.employees": 30516,
  "company_insights.is_public": false,
  "company_insights.address": "150 East 42nd Street, New York, NY, 10017, US",
  "website_title": "Selikoff Centers for Occupational Health | Mount Sinai - New York",
  "website_description": "Mount Sinai Selikoff Centers for Occupational Health are dedicated to providing workplace safety and clinical services...",
  "website_has_gtm": false,
  "website_has_fb_pixel": false,
  "instagram": [
    {
      "url": "https://www.instagram.com/mountsinainyc",
      "name": "Mount Sinai Health System",
      "handle": "mountsinainyc",
      "followers": 88000,
      "following": 1087,
      "posts": 7894
    }
  ]
}
```

*Sample shortened for readability. The full output includes every field listed above.*

---

## 💰 Pricing

Google Maps Scraper uses pay-per-result pricing. You only pay for the places returned and the add-ons you turn on.

| Plan | What's included | Price |
|---|---|---|
| 📦 Base Plan | Google Maps business data, 📧 emails and social links | **$2.50 per 1,000 results** |
| 🏢 Add-on: Company Insights | Company-level data and social profile details | **+ $1.00 per 1,000 results** |
| 📞 Add-on: Phone Details | Main and additional phone numbers, phone details | **+ $1.00 per 1,000 results** |

Add-ons are optional and are charged only when they are turned on.

**Example:** 1,000 results with both add-ons turned on cost $2.50 + $1.00 + $1.00 = **$4.50**.

---

## 📁 How to Use

1. Create a free Apify account.
2. Open the Google Maps Scraper actor.
3. Enter a 🔎 search term, such as `hospitals`.
4. Enter a 📍 location, such as `New York`, and choose the country.
5. Set the number of places to extract and the language.
6. Optionally turn on 🏢 **Company Insights** and/or 📞 **Phone Numbers & Phone Details**.
7. Click **Start** to run the actor.
8. Download your results in JSON, CSV or Excel format.

---

## ✅ Common Use Cases

- Build local business lead lists with emails, websites and social links
- Qualify leads by industry, company size and founded year
- Find decision-makers' company LinkedIn pages
- Reach more prospects by phone with main and additional company phone lines
- Research competitors by location or category
- Analyze ratings and reviews across a market
- Create business directories with addresses, hours and coordinates
- Identify businesses by website technology (Google Tag Manager, Facebook Pixel, CMS)
- Measure a business's social media reach (followers and posts)

---

## ⚠️ Data Availability

The actor returns publicly available information. Field availability varies by listing, website and add-on. A blank value means the data wasn't available or couldn't be detected for that business.
