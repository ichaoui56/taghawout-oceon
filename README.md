# animated-website

## Transfer dashboard

The Morocco Journeys transfer dashboard is available at `/dashboard/transfers`.
It manages airport routes and prices, private outings and visits, custom-route
locations, and transfer requests submitted through the public booking form.
The dashboard groups the three catalogues under top tabs. Use **Ajouter** to
choose which type of item to create. Custom-transfer locations can be assigned
to the departure list, arrival list, or both; airport routes and private
outings support notes, capacity, and configurable start times. Confirmed private
bookings reserve their activity, date, and time; reserved times remain visible
but unavailable in the booking form.
Outing photos are resized and compressed to WebP (100 KB maximum) in the browser,
then uploaded to Pinata through an admin-authenticated server endpoint. The
returned gateway URL is stored in PostgreSQL; image bytes are not.

Set up PostgreSQL and copy `.env.example` to `.env.local`. Set
`DATABASE_URL`, a unique `TRANSFER_DASHBOARD_SECRET` of at least 32 characters,
and Pinata credentials. Image upload uses `PINATA_JWT` (or `JWT`) and a gateway
configured as `NEXT_PUBLIC_GATEWAY_URL` (or `PINATA_GATEWAY_URL`). Keep JWT
values server-only and do not prefix them with `NEXT_PUBLIC_`. The first
dashboard sign-in creates the initial `ADMIN` user from
`TRANSFER_ADMIN_USERNAME` and `TRANSFER_ADMIN_PASSWORD`; the example values
(`admin` / `password`) are for local development only. Replace them with a
strong password before production deployment. Existing user accounts are not
overwritten by these bootstrap settings. `ADMIN` users can manage the catalogue;
`STAFF` users can review and update transfer requests.

WhatsApp Cloud API alerts can be enabled by adding the `WHATSAPP_*` values from
`.env.example` to `.env.local`. Add the access token from Meta there; never put it
in client code or commit it. The sandbox sends plain-text alerts while its
recipient session is active. For production alerts outside the 24-hour messaging
window, create an approved template with one body placeholder for the dashboard
URL, then set `WHATSAPP_TEMPLATE_NAME` and `WHATSAPP_TEMPLATE_LANGUAGE`.
Activity reservations and transfer requests are saved even if WhatsApp is
unavailable; delivery failures are logged on the server.

## Google reviews

Customer reviews can be managed at `/dashboard/reviews`. Each entry has an
English and French message, date, profile photo, rating, and publication status.
The business location and Google Maps URL are editable there and appear in the
homepage review panel. Published dashboard reviews determine the displayed
average and count.

The homepage can also read current business details and review content from
Google Places API (New). To enable it, set `GOOGLE_PLACES_API_KEY` and
`GOOGLE_PLACE_ID` in the server environment. Enable Places API (New) and billing
for the key, and keep it server-only (never use a `NEXT_PUBLIC_` prefix). Google
returns up to five reviews for this endpoint; the displayed rating and review
count come directly from the place response when no dashboard reviews are
published. Set `HostelGrowth_PROFILE_URL` or the dashboard HostelGrowth URL only
when a real HostelGrowth certification page should be linked below the cards.

For local layout testing, `npm run db:seed:demo-reviews` adds the supplied sample
content with demo images. These rows are marked `isDemo` and remain unpublished;
the seed replaces existing demo rows, so run it only against a local test database.

Without these settings, the section links to Google search and displays an
unavailable state rather than invented ratings or testimonials.

```sh
npm run db:generate
npm run db:deploy
npm run dev
```

The initial airport routes, private services, and custom locations are seeded
automatically once the database is reachable. Without `DATABASE_URL`, the public
site displays the starter catalogue but disables online booking; the dashboard
shows a setup error after sign-in.

For an existing database, apply the user/role migration with
`npm run db:deploy`. For production, set `TRANSFER_ADMIN_USERNAME` and a strong
`TRANSFER_ADMIN_PASSWORD` (at least 8 characters) before the first dashboard
sign-in so the bootstrap admin is not created with local-development defaults.
# taghawout-oceon
