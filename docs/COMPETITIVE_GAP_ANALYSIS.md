# Google Maps Scraper — Competitive Gap Analysis & Ideation

**Date:** 2026-08-26
**Our sample analysed:** `bakery in Mysore - 101 results (req 26)` — 101 rows × 63 columns
**Competitors benchmarked:**
- Apify — `compass/crawler-google-places` (actor `nwua9Gu5YrADL7ZDj`), "Google Maps Scraper"
- Outscraper — Google Maps Scraper (Services → Google Maps Scraper)

---

## 1. Executive summary

We ship **63 columns**. On raw column count we are in the same league as both competitors.
The gap is **not** mainly column count — it is three things:

| # | Gap | Severity |
|---|-----|----------|
| **A** | **Whole data domains we don't touch at all** — reviews, photos, business attributes ("about"), popular times, Q&A, posts | Critical |
| **B** | **Contact/lead enrichment depth** — this is where competitors make their margin, and where we are weakest (0/101 emails in the `email` column) | Critical |
| **C** | **Columns that exist but are broken, constant, or filled with raw garbage** — we look complete on paper and thin in the file | Critical |

Gap **C** is the cheapest to fix and the most damaging to trust — a buyer evaluating a sample file sees
`plus_code = 7` on every row before they ever notice we're missing popular times.

Priority order recommended: **Fix C → Ship A (reviews + attributes) → Build B (enrichment tiers).**

---

## 2. What we ship today

```
record_id, name, category, type, categories, rating, review_count, price_level, price_range,
phone, email, website, website_domain, full_address, street, locality, city, state, postal_code,
country_code, latitude, longitude, business_status, verified, claimed, permanently_closed,
temporarily_closed, open_status, hours_csv, main_image_url, logo, photo_count, maps_url,
location_link, reviews_link, menu_link, reservation_link, booking_link, owner_title, owner_link,
description, plus_code, place_id, cid, google_id, social_links, facebook_url, instagram_url,
linkedin_url, x_url, youtube_url, tiktok_url, pinterest_url, youtube_name, youtube_subscribers,
youtube_videos, tiktok_followers, pinterest_followers, social_profiles_json, social_scraped_at,
email_data, phone_data, scraped_at
```

### 2.1 Honest fill-rate audit of our own sample (n=101)

| Column | Filled | Verdict |
|---|---|---|
| `email` | **0 / 101** | Dead column. Emails only appear in `email_data` (19/101) |
| `photo_count` | **0 / 101** | Dead column |
| `menu_link` | **0 / 101** | Dead column |
| `x_url`, `tiktok_url`, `pinterest_url` | **0 / 101** | Dead columns |
| `tiktok_followers`, `pinterest_followers` | 0 / 101 | Dead columns |
| `social_scraped_at` | 0 / 101 | Dead column |
| `state` | 5 / 101 | Address parser fails on 95% of rows |
| `postal_code` | 5 / 101 | Address parser fails on 95% of rows |
| `plus_code` | 100 / 101 | **Every value is the literal string `7`** — parser bug |
| `website` | 29 / 101 | 6 of those 29 are Instagram/Facebook links, not real sites |
| `cid`, `owner_link`, `logo` | 74 / 101 | ~27% loss |
| `social_links` and children | 12–18 / 101 | Thin |

### 2.2 Confirmed defects (not "missing fields" — broken fields)

| Defect | Evidence | Impact |
|---|---|---|
| **`plus_code` always `7`** | 100/101 rows literally `7` | Parser is grabbing the wrong token |
| **`description` = `name`** | 101/101 rows identical to `name` | We advertise a description column and ship a duplicate of the name. Google's editorial summary is not being captured |
| **`owner_title` is synthesised** | 101/101 end in `" (owner)"` — e.g. `The Bake House (owner)` | Fake data. Real `owner_title` / `owner_id` is not being read |
| **`reservation_link` / `booking_link` contain raw protobuf** | 20/101 hold `[["district.in", null, ["https://lh3...", "District Dining", [80,80]], 20003792], ...]` | Unusable in a CSV. Also both columns hold the *identical* blob — they aren't separate fields |
| **`maps_url` / `location_link` have zeroed coordinates** | 101/101 contain `@0,0,14z` and `!3d0!4d0` | We *have* lat/lng in the same row and don't substitute it. Links open at null island |
| **`maps_url` is a `/maps/search/` URL** | 101/101 | Should be the canonical `/maps/place/` or `?cid=` permalink |
| **`price_level` and `price_range` are the same thing** | `₹200–400` vs `₹200 to ₹400` | Neither is the `$`/`$$`/`$$$` symbol competitors expose as `price` |
| **`phone` is not E.164** | 81/81 start `0091 ` | `+91` expected. Breaks dialers, CRMs, WhatsApp checks |
| **`phone_data` contains malformed duplicates** | 8 rows contain `"++918088688868"` | Double `+` prefix bug |
| **`verified`, `claimed`, `permanently_closed`, `temporarily_closed`, `business_status`** | Constant across all 101 rows (`TRUE/TRUE/FALSE/FALSE/OPERATIONAL`) | Strongly suggests defaults, not parsed values. Needs verification against a dataset containing known-closed places |
| **`hours_csv` is a pipe-delimited string** | `Wednesday,9:30 am–10 pm\|Thursday,...` | No structured/JSON hours object, no 24h normalisation, no timezone |
| **No `search_term` / `query` column** | — | On a multi-keyword run the buyer cannot tell which keyword produced which row. Both competitors provide this (`searchString`) |
| **No `rank` / position column** | — | Cannot do local-SEO rank tracking, a major competitor use case |

---

## 3. Gap matrix — columns competitors have that we don't

### 3.1 Reviews — **entire domain missing** 🔴

We ship `rating`, `review_count`, `reviews_link`. That's it.

| Field | Apify | Outscraper | Us |
|---|---|---|---|
| Full review objects (text, stars, date, likes) | `reviews[]` | reviews endpoint | ❌ |
| Review ID / permalink | `reviewId`, `reviewUrl` | `review_id`, `review_link` | ❌ |
| Reviewer identity | `name`, `reviewerId`, `reviewerUrl`, `reviewerPhotoUrl`, `reviewerNumberOfReviews`, `isLocalGuide` | `author_title`, `author_id`, `author_link`, `author_image` | ❌ |
| Owner response | `responseFromOwnerText`, `responseFromOwnerDate` | `owner_answer`, `owner_answer_timestamp` | ❌ |
| Star distribution | `reviewsDistribution` (one→fiveStar) | `reviews_per_score`, `reviews_per_score_1..5` | ❌ |
| Review keyword tags | `reviewsTags` | `reviews_tags` | ❌ |
| Per-aspect ratings (food/service/atmosphere) | `reviewDetailedRating` | ✔ | ❌ |
| Review images | `reviewImageUrls` | `review_img_url` | ❌ |
| Translated review text | `textTranslated` | ✔ | ❌ |
| Review origin (Google vs partner) | `reviewOrigin` | ✔ | ❌ |
| Sort / keyword-filter / date-filter controls | ✔ | ✔ | ❌ |

> `includeReviews` and `maxReviews` are **read** in `src/main.js` but are **not declared** in `.actor/input_schema.json`, so no user can set them from the Apify UI. See §5.

### 3.2 Business attributes / "About" — **entire domain missing** 🔴

This is the single highest-value missing block for filtering and segmentation.

| Field | Apify | Outscraper | Us |
|---|---|---|---|
| Service options (dine-in, takeaway, delivery, curbside, drive-through) | `additionalInfo` | `about` | ❌ |
| Accessibility (wheelchair entrance/parking/toilet) | ✔ | ✔ | ❌ |
| Amenities, Atmosphere, Crowd, Planning | ✔ | ✔ | ❌ |
| Payments (cards, UPI, NFC, cash-only) | ✔ | ✔ | ❌ |
| Parking, Pets, Children | ✔ | ✔ | ❌ |
| "From the business" (women-owned, LGBTQ+ friendly, veteran-owned) | ✔ | ✔ | ❌ |
| Offerings / Dining options / Highlights | ✔ | ✔ | ❌ |

### 3.3 Photos & media 🟠

| Field | Apify | Outscraper | Us |
|---|---|---|---|
| All photo URLs | `imageUrls[]`, `images[]` | photos endpoint | ❌ (only `main_image_url`) |
| Photo count | `imagesCount` | `photos_count` | ⚠️ column exists, 0/101 |
| Photo categories (interior/menu/food/vibe) | `imageCategories` | ✔ | ❌ |
| Photo author + upload date | `images[].authorName/uploadedAt` | ✔ | ❌ |
| Street View image | — | `street_view` | ❌ |

### 3.4 Popular times & dwell 🟠

| Field | Apify | Outscraper | Us |
|---|---|---|---|
| Popular times histogram (per day × hour) | `popularTimes` | `popular_times` | ❌ |
| Live busyness | ✔ | ✔ | ❌ |
| Typical time spent | — | `typical_time_spent` | ❌ |

### 3.5 Hours — depth 🟠

| Field | Apify | Outscraper | Us |
|---|---|---|---|
| Structured hours object | `openingHours[]` | `working_hours` (JSON) | ❌ (pipe string only) |
| CSV-compatible hours | — | `working_hours_csv_compatible` | ✔ `hours_csv` |
| Secondary hours (kitchen, delivery, drive-through, holiday) | ✔ | `other_hours` | ❌ |
| Open at scrape time | `wasOpenAtScrapeTime` | ✔ | ⚠️ `open_status` free text only |
| Timezone | — | `time_zone` | ❌ |

### 3.6 Ordering, booking & menus 🟠

| Field | Apify | Outscraper | Us |
|---|---|---|---|
| Menu link | `menu` | `menu_link` | ⚠️ 0/101 |
| Order-online links (Swiggy/Zomato/DoorDash…) | `googleFoodUrl`, `restaurantData` | `order_links` | ❌ |
| Table reservation providers (parsed) | `reserveTableUrl`, `tableReservationLinks`, `tableReservationProvider` | `reservation_links` | ⚠️ raw protobuf |
| Appointment booking (clinics, salons) | `bookingLinks` | `booking_appointment_link` | ⚠️ raw protobuf |
| Services link | `servicesLink` | ✔ | ❌ |

### 3.7 Q&A, posts, updates 🟠

| Field | Apify | Outscraper | Us |
|---|---|---|---|
| Questions & answers | `questionsAndAnswers` | ✔ | ❌ |
| Google Posts | — | `posts` | ❌ |
| Updates from customers | `updatesFromCustomers` | ✔ | ❌ |
| Owner updates | `ownerUpdates` | ✔ | ❌ |

### 3.8 Geo & identifiers 🟡

| Field | Apify | Outscraper | Us |
|---|---|---|---|
| Neighborhood | `neighborhood` | ✔ | ❌ |
| County | — | `county` | ❌ |
| State code | `state` | `state_code` | ⚠️ `state` 5/101 |
| Country full name | — | `country` | ❌ (code only) |
| Timezone | — | `time_zone` | ❌ |
| H3 geo index | — | `h3` | ❌ |
| Service-area business flag | — | `area_service` | ❌ |
| Located inside (mall/airport) | `locatedIn` | `located_in`, `located_google_id` | ❌ |
| Plus code | `plusCode` | `plus_code` | ⚠️ broken (`7`) |
| Knowledge Graph MID | `kgmid` | `kgmid` | ❌ |
| FID | `fid` | ✔ | ✔ (as `google_id`) |
| Owner ID | — | `owner_id` | ❌ |
| Reviews ID | — | `reviews_id` | ❌ |

### 3.9 Search-result context & competitive intel 🟡

| Field | Apify | Outscraper | Us |
|---|---|---|---|
| Originating search string | `searchString` | ✔ | ❌ |
| Rank in results | `rank` | ✔ | ❌ |
| Is a paid ad | `isAdvertisement` | ✔ | ❌ |
| People also search for | `peopleAlsoSearch` | ✔ | ❌ |
| Search page URL | `searchPageUrl`, `searchPageLoadedUrl` | ✔ | ❌ |
| AI competitor analysis dataset | ✔ | — | ❌ |

### 3.10 Vertical-specific 🟡

| Field | Apify | Outscraper | Us |
|---|---|---|---|
| Hotel stars / description / review summary | `hotelStars`, `hotelDescription`, `hotelReviewSummary` | ✔ | ❌ |
| Hotel ads & rates, check-in/out | `hotelAds`, `checkInDate`, `checkOutDate` | ✔ | ❌ |
| Similar hotels nearby | `similarHotelsNearby` | ✔ | ❌ |
| Fuel prices | `gasPrices` | ✔ | ❌ |

### 3.11 Contact & lead enrichment — **the commercial gap** 🔴

This is what both competitors *charge for* on top of the base scrape.
Outscraper packages **19 enrichment services** into 3 ready-made packs
(Recommended, Cold Email Outreach, Cold Calling Campaigns).

| Capability | Apify | Outscraper | Us |
|---|---|---|---|
| Emails from website (multi) | ✔ | `email_1`, `email_2`, `email_3` | ⚠️ `email_data` JSON, 19/101 |
| Phones from website (multi) | ✔ | `phone_1`, `phone_2`, `phone_3` | ⚠️ `phone_data` JSON, 19/101 |
| Website title / description / keywords | — | `website_title`, `website_description`, `website_keywords` | ❌ |
| Website tech signals (CMS, FB Pixel, GTM) | — | `website_generator`, `website_has_fb_pixel`, `website_has_gtm` | ❌ |
| **Email verification** (deliverable / catch-all / disposable / MX) | ✔ (Email Address Verifier) | ✔ (Emails Validator) | ❌ |
| **Decision-maker leads** (first/last name, job title, dept, seniority, LinkedIn) | `firstName`, `lastName`, `jobTitle`, `department`, `seniority`, `linkedinProfile` | Contacts & Leads Enrichment | ❌ |
| **Company insights** (revenue, headcount, founded year, industry, public/private) | `companySize`, `companyLinkedin` | Company Insights | ❌ |
| **Phone enrichment** (carrier, line type, validity) | ✔ | Phone Numbers Enricher | ❌ |
| **Phone identity** (owner name behind the number) | — | Phone Identity Finder | ❌ |
| WhatsApp presence check | — | ✔ | ❌ |
| US company data enricher | — | ✔ | ❌ |
| Trustpilot / other platform ratings | — | ✔ | ❌ |
| Social follower counts & verified badge | `instagrams`, `facebooks`, `linkedIns`, `youtubes`, `tiktoks`, `twitters`, `pinterests` (with followers) | ✔ | ⚠️ YouTube only (3/101) |

---

## 4. Feature gaps that are *not* columns

### 4.1 Input & targeting

| Feature | Apify | Outscraper | Us |
|---|---|---|---|
| Multiple locations per run | ✔ | ✔ (e.g. "All US locations (52)") | ❌ **one location per run** |
| Category taxonomy picker (Top 100 / Top 500) | category filters | ✔ | ❌ free text only |
| Exact category match | `searchMatching` | "Exact match" checkbox | ❌ |
| Zip-code level expansion | postal code drill-down | "Use zip codes" | ❌ |
| Custom polygon / GeoJSON / circle areas | ✔ | Custom Locations | ❌ |
| Country/state/county/city drill-down | ✔ | ✔ | ❌ |
| Direct Google Maps URLs as input | ✔ | ✔ | ❌ |
| Place IDs as input | ✔ | ✔ | ❌ |
| "All available results" (no cap) | ✔ | ✔ | ❌ capped at 500/term |
| Skip / offset for pagination | — | `Skip` | ❌ |
| Deduplication toggle | ✔ | "Delete duplicates" | ❌ (sample happened to be clean) |
| Language selection | ✔ | ✔ | ⚠️ in code, not in UI schema |

### 4.2 Result filters (Outscraper "Quick Filters", Apify filters)

None of these exist for us:

- Ignore without emails
- Only with website / Only without website
- Operational only (skip closed)
- With phone
- Verified only
- Good rating / Bad rating (min-rating threshold)
- Minimum review count

### 4.3 Output & packaging

| Feature | Apify | Outscraper | Us |
|---|---|---|---|
| Multiple dataset views (places / reviews / leads / social) | ✔ | ✔ | ⚠️ single `overview` view |
| Export formats | JSON/CSV/XLSX/XML | CSV/Excel/Parquet/JSON | CSV via dataset |
| Bundled pricing packs | — | 3 lead-gen packs, priced per item | ❌ flat $0.01/place |
| Transparent per-enrichment pricing | ✔ | ✔ ($0.000–$0.024/item) | ❌ |

### 4.4 Repo-level bug worth fixing immediately

`.actor/input_schema.json` exposes only `fileName`, `searchTerms`, `location`, `maxPlaces`.
But `src/main.js` reads — and forwards to the backend — `language`, `includeReviews`, `maxReviews`,
`includeImages`. **These four are undeclared, so the Apify UI never sends them** and they silently
fall back to defaults (`en`, `false`, `10`, `false`). The README documents them as if they work.

Also note: `.actor/actor.json`'s dataset `overview` view lists a field `email` — which is 0/101 in
practice, and `price`, which does not exist in the output at all (we emit `price_level`/`price_range`).
The default table view is therefore showing two empty/absent columns to every buyer.

---

## 5. Ideation — prioritised roadmap

### P0 — Credibility fixes (days, not weeks; no new scraping needed)

These use data we already have in-row or already fetch.

1. **Fix `plus_code`** — currently the literal `7` on every row.
2. **Fix `maps_url` / `location_link`** — substitute the real `latitude`/`longitude` we already have instead of `@0,0,14z` / `!3d0!4d0`; emit the canonical `/maps/place/` + `?cid=` permalink.
3. **Parse `reservation_link` / `booking_link`** out of the protobuf blob into real URLs, and split them into genuinely different columns (`reservation_links`, `booking_appointment_link`, `order_links`, `menu_link`).
4. **Kill or fill dead columns** — `email`, `photo_count`, `menu_link`, `x_url`, `tiktok_url`, `pinterest_url`, `tiktok_followers`, `pinterest_followers`, `social_scraped_at`. Shipping nine always-empty columns reads as broken.
5. **Flatten `email_data` / `phone_data`** into `email_1..3` / `phone_1..3` (Outscraper's shape), and fix the `++91` double-prefix bug.
6. **Normalise `phone` to E.164** (`+91…`, not `0091 …`).
7. **Fix the address parser** — `state` and `postal_code` at 5/101 is the most visible quality failure in the file. Add `county`, `country` (full name), `neighborhood`, `state_code`, `time_zone`.
8. **Replace `description`** with Google's real editorial summary; stop echoing `name`.
9. **Replace the synthesised `owner_title`** with the real owner title + add `owner_id`.
10. **Verify `verified` / `claimed` / `business_status`** are actually parsed — they are constant across all 101 rows.
11. **Add `search_term` and `rank`** columns. Cheap, and `rank` alone unlocks local-SEO rank tracking as a use case.
12. **Fix `.actor/input_schema.json`** to expose `language`, `includeReviews`, `maxReviews`, `includeImages`; fix the `actor.json` overview view (`email` → real column, drop `price`).
13. **Split `price_level` into a true `price` symbol** (`$`/`$$`/`$$$`) and keep `price_range` as the currency band.

### P1 — Close the domain gaps (the "why we lose the deal" list)

14. **Reviews module** — full review objects + `reviews_per_score_1..5` + `reviews_tags` + owner answers + reviewer identity + a **separate reviews dataset view** (one review per row). Add sort / keyword-filter / date-filter / max controls. This is the #1 requested Google Maps dataset after the place list.
15. **Business attributes (`about` / `additionalInfo`)** — service options, accessibility, payments, amenities, atmosphere, "from the business". Highest value-per-engineering-hour of anything on this list, because it turns a flat list into a *filterable* dataset.
16. **Photos module** — `photos_count`, `photo_urls[]`, `photo_categories`, `street_view`.
17. **Structured hours** — JSON `working_hours` object, 24h-normalised, plus `other_hours` (kitchen/delivery/holiday) and `wasOpenAtScrapeTime`.
18. **Popular times + `typical_time_spent`.**
19. **Q&A, Google Posts, owner updates, customer updates.**
20. **Result filters** — the Outscraper "Quick Filters" set (has email / has website / operational only / has phone / verified / min rating / min reviews). Mostly post-processing over data we already have; very cheap, very visible.

### P2 — Targeting & scale parity

21. **Multiple locations per run** + country/state/city/zip drill-down + "Use zip codes" expansion. Today's "one location per run" is a hard blocker for anyone building a national list.
22. **Custom polygon / GeoJSON / radius-circle search.**
23. **Place IDs and Google Maps URLs as direct input.**
24. **Category taxonomy picker** (Top 100 / Top 500) + exact-match toggle.
25. **`Skip`/offset pagination, dedupe toggle, "all available results".**
26. **Multiple dataset views** (places / reviews / leads / social) + Parquet & XLSX export.

### P3 — Monetisable enrichment tiers (where the competitors' margin lives)

27. **Website enrichment**: `website_title`, `website_description`, `website_keywords`, `website_generator`, `website_has_fb_pixel`, `website_has_gtm`. Tech/pixel signals are a strong B2B qualifier and cheap to compute once we already fetch the site.
28. **Email verification** — deliverable / catch-all / disposable / role-based / MX. Pairs directly with our existing Boomerang positioning.
29. **Decision-maker leads** — name, job title, department, seniority, LinkedIn, verified work email.
30. **Company insights** — revenue band, headcount, founded year, industry, public/private.
31. **Phone enrichment** — carrier, line type (mobile/landline/VOIP), validity, WhatsApp presence, and (where legal in the target market) phone identity.
32. **Complete the social module** — Facebook/Instagram/LinkedIn follower counts and verified badges, not just YouTube. Today only 3/101 rows carry any social stats.
33. **Package it** — mirror Outscraper's ready-made packs (Recommended / Cold Email / Cold Calling) with transparent per-item pricing, instead of one flat $0.01/place.

### P4 — Differentiators (where we could get ahead rather than catch up)

34. **Vertical modules** — hotels (stars, rates, similar hotels), fuel prices, restaurants (order links, menu items).
35. **`peopleAlsoSearch` + competitor set** — the raw material for a rank-tracking / local-SEO product.
36. **Change tracking** — re-scrape deltas (rating moved, hours changed, went permanently closed, new owner). Neither competitor sells this well, and we already stamp `scraped_at`.
37. **H3 index + service-area flag** for geospatial customers.

---

## 6. Proposed target schema additions

New columns to add, grouped, using competitor-compatible names so migration from Outscraper/Apify is frictionless:

```
# search context
search_term, rank, is_advertisement, search_page_url

# geo
neighborhood, county, country, state_code, time_zone, h3, area_service,
located_in, located_google_id, street_view

# ids
kgmid, owner_id, reviews_id

# hours
working_hours (json), other_hours, typical_time_spent, was_open_at_scrape_time

# reviews
reviews_per_score_1..5, reviews_tags, reviews (json / separate view)

# attributes
about (json), service_options, accessibility, amenities, atmosphere,
payments, parking, offerings, dining_options, from_the_business, crowd, planning, children, pets

# media
photos_count, photo_urls, photo_categories

# engagement
popular_times (json), questions_and_answers, posts, updates_from_customers, owner_updates

# commerce
order_links, menu_link, reservation_links, booking_appointment_link, services_link, price

# enrichment (paid tiers)
email_1..3, email_1_status, phone_1..3, phone_1_carrier, phone_1_type, phone_1_whatsapp,
website_title, website_description, website_keywords, website_generator,
website_has_fb_pixel, website_has_gtm,
company_revenue, company_size, company_founded, company_industry,
contact_first_name, contact_last_name, contact_job_title, contact_department,
contact_seniority, contact_linkedin, contact_email, contact_email_status,
facebook_followers, instagram_followers, linkedin_followers, x_followers
```

---

## 7. Where the work actually lives

`akhilesh-maheshwari/google-maps-AP` is an **orchestration wrapper**, not the scraper.
`src/main.js` posts search terms to `frontend.boomerangserver.co.in` / `maps.boomerangserver.co.in`,
polls for completion, pulls a CSV from Google Drive, and pushes the rows to the Apify dataset
**with the backend's headers passed through verbatim** (`headers.forEach((h, i) => { rowObj[h] = row[i] … })`).

Consequences for planning:

- Every column fix in §5 (P0/P1/P3) belongs in the **n8n / backend scraper**, not this repo.
- What *this repo* owns and can fix today: `.actor/input_schema.json` (the four undeclared inputs,
  plus every new targeting option in P2), `.actor/actor.json` (dataset views — including the new
  reviews/leads/social views), `README.md`, and any post-processing/filtering layer we choose to
  run over rows before `Actor.pushData`.
- The **Quick Filters** in §4.2 could ship entirely from this repo as a post-processing step over the
  fetched CSV, without any backend change. That is the fastest visible win available to us.
