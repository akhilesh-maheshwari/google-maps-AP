# BRG vs Outscraper — Google Maps scraper gap analysis

**Query:** `restaurants in Bangalore`, both scrapers, same week (27 Aug 2026).
**Source:** Google Sheet `restaurant in Bangalore - 785 results (req 28)`, tabs `BRG` and `Outscraper`.
**Full detail:** [`BRG_vs_Outscraper_gap_analysis.xlsx`](./BRG_vs_Outscraper_gap_analysis.xlsx) — 7 sheets, including a
field-by-field mapping of all 111 Outscraper columns in Outscraper's exact order.

> Note: the field extraction itself does not live in this repo. `src/main.js` is the Apify
> orchestration wrapper; the scrape and the column mapping happen in the Boomerang backend
> (`maps.boomerangserver.co.in`). Every fix below belongs in that service.

## Headline numbers

| | BRG | Outscraper |
|---|---|---|
| Columns | 56 | 111 |
| Rows | 785 | 1,282 |
| Unique places | 785 | 1,000 |
| Row model | 1 row per place | up to 3 rows per place, one per contact/email |
| Queries actually run | 1 (`restaurants in Bangalore`) | 10 postal-code tiles (`restaurant, 560045, Bengaluru, Karnataka, IN`, …) |
| Places found by both | 53 (6.8% of ours) | 53 (5.3% of theirs) |

Of Outscraper's 111 columns: **38 BRG already covers**, **3 partially**, **67 are missing**, and
**2 BRG ships with the wrong data in them**.

## P0 — columns going out to customers today with wrong content

### 1. `review_count` holds the photo count, not the review count

On the 53 places present in both files, BRG's `review_count` is exactly equal to Outscraper's
`photos_count` on **49 of 53**, and equal to the real review count on **0 of 53**.

| Place | BRG `review_count` | Real reviews | Photos |
|---|---|---|---|
| Nandhana Palace - Andhra Style | 2,121 | 10,470 | 2,121 |
| Nandhini Deluxe - Andhra Restaurant | 1,489 | 7,253 | 1,489 |
| Bobby's Punjabi Dhaba | 2,257 | 5,001 | 2,268 |
| Time Traveller (Urban Herbivore) | 1,465 | 3,035 | 1,465 |
| Hard Rock Cafe Bengaluru | 17,794 | 17,050 | 17,794 |

**Fix:** bind `review_count` to the review counter node, and emit the photo counter as a new
`photos_count` column. Both numbers are already being scraped — they are just going into one
mislabelled column.

### 2. `description` is a copy of `name`

785 of 785 rows have `description == name`. The column carries no information. Outscraper puts
Google's real editorial description there (18.1% filled) and leaves it blank otherwise.

## P1 — parity and headline commercial fields

- **Query tiling (coverage).** Outscraper's own `query` column shows they ran `restaurant`
  against 10 Bangalore postal codes and merged. Google caps a single Maps query at ~120
  results, so tiling is the only way past it. Expand the user's location into postal codes or a
  lat/lng grid, run one search per tile, merge and de-duplicate on `place_id`.
- **Row-per-contact output mode.** Outscraper explodes multiple emails into separate rows (161
  places had 2–3). BRG packs them into `other_emails`. Add a mode that matches their shape.
- **`about`** — the full attributes JSON (Service options, Dining options, Accessibility,
  Amenities, Atmosphere, Crowd, Payments, Parking, Children, Pets, Planning, Highlights, Popular
  for, From the business). **89.7% filled.** Largest single missing block.
- **`reviews_per_score`** plus `reviews_per_score_1..5` — the star histogram. 93.9% filled.
- **`order_links`** — Swiggy / Zomato / EazyDiner / Google Reserve. 29.9% filled, very high value
  on a restaurant dataset.
- **`time_zone`** (99.8%) and **`h3`** (99.8%) — both computable from the lat/lng we already have.
- **Contact block** — `full_name`, `first_name`, `last_name`, `title`, `contact_linkedin`, plus
  `email.emails_validator.status` / `status_details`. This is Outscraper's clearest commercial
  differentiator.
- **Renames and format changes** (data already scraped): `categories`→`subtypes` as a
  comma-separated string, `full_address`→`address`, `website_domain`→`domain`,
  `main_image_url`→`photo`, `booking_link`→`booking_appointment_link`,
  `hours_csv`→`working_hours_csv_compatible` plus a JSON `working_hours`, socials →
  `company_facebook`/`company_instagram`/`company_linkedin`/`company_x`/`company_youtube`,
  and add `country` (we only emit `country_code`).
- **Phone format:** all 715 BRG phones start `0091 `; all Outscraper phones start `+`. Emit
  `+91 81306 08837`.

## P2 — second wave

`website_title`, `website_description`, `website_generator`, `website_has_gtm`,
`website_has_fb_pixel`, `street_view`, `kgmid`, `reviews_id`, `owner_id`, `chain_info.chain`,
`area_service`, `other_hours`, `source`, phone carrier enrichment, and the 11
`company_insights.*` firmographic columns.

Also in this bucket: `cid` drops out on ~30% of BRG rows (Outscraper: 99.8%) even though it is
derivable from the second half of `google_id`; and `location_link` is built with `@0,0,14z`
placeholder coordinates instead of the real lat/lng.

## What BRG already does better — do not lose these

| | BRG | Outscraper |
|---|---|---|
| `phone` fill (per place) | **91.1%** | 75.7% |
| `website` fill (per place) | **47.5%** | 31.9% |
| `instagram` fill (per place) | **23.2%** | 16.1% |
| `plus_code` | **78.5%** | column present, 0% filled |
| `price_level` / `price_range` | **63.5%** | not offered — their `range` is hotel star ratings, 2.6% filled |
| `claimed`, `permanently_closed`, `temporarily_closed`, `open_status` | yes | folded into `business_status` only |
| `tiktok`, `pinterest` | yes | not offered |
| `scraped_at`, `social_scraped_at` | yes | no recency signal at all |

BRG's per-place enrichment is competitive. The gap is the two wrong columns, the 67 absent
columns, and query coverage.
