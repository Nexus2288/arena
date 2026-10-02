# Love Over Coffee — QR Ordering System

A complete QR-code table-ordering system for a single cafe: customers scan a QR code,
see the menu, place an order and track it live; the owner manages everything from a
dashboard; the kitchen gets an email per order with one-tap status buttons.

## Architecture

- **Backend:** Google Apps Script (bound to a Google Sheet used as the database),
  deployed as a Web App. One API, two consumers.
- **Customer site:** static files (`index.html`, `style.css`, `script.js`,
  `frontend-config.js`) hosted on GitHub Pages.
- **Owner dashboard:** static files (`dashboard.html`, `dashboard.css`, `dashboard.js`)
  hosted in the same GitHub Pages site.
- **Database:** a single Google Sheet (never edited by hand after setup — always go
  through the dashboard or the API).
- **Kitchen notification:** Gmail (`MailApp`), with signed one-click action links.
- **Customer notifications:** in-app polling only (see "Notifications" below).

## File map

| File | Purpose |
|---|---|
| Config.gs | Sheet schema, constants, config accessors |
| Utils.gs | Sheet I/O, validation, crypto, locking, dates |
| Auth.gs | Owner login/session, Gmail action link signing |
| Tables.gs | Table token resolution, table CRUD |
| Menu.gs | Menu read, order item resolution, menu CRUD |
| Coupons.gs | Coupon validation/discount math, coupon CRUD |
| Orders.gs | Order creation, tracking, status transitions |
| Email.gs | Kitchen email + Gmail action result page |
| Notifications.gs | Subscriptions, owner-sent notifications |
| Dashboard.gs | Public config, home summary, customers, analytics, settings |
| Setup.gs | One-time sheet/coupon/secret setup |
| Code.gs | doGet/doPost router |
| Tests.gs | `runSelfTest()` |
| index.html / style.css / script.js / frontend-config.js | Customer site |
| dashboard.html / dashboard.css / dashboard.js | Owner dashboard |

## Setup — step by step

### A. Google Sheet + Apps Script

1. Create a new blank Google Sheet. Copy its ID from the URL
   (`https://docs.google.com/spreadsheets/d/<THIS_PART>/edit`).
2. In the Sheet, go to **Extensions > Apps Script**. This creates a bound script project.
3. Delete the default `Code.gs` content, then create all 14 `.gs` files listed above and
   paste in the matching code.
4. In the Apps Script editor, click the gear icon (**Project Settings**) and enable
   **"Show appsscript.json manifest file"**. Replace its content with your `appsscript.json`.

### B. Script Properties (Project Settings > Script Properties)

Set these **before** running setup:

| Key | Value |
|---|---|
| `SPREADSHEET_ID` | the Sheet ID from step A.1 |
| `OWNER_ACCESS_KEY` | a strong password for the owner dashboard (choose your own, 8+ chars) |
| `CAFE_EMAIL` | the Gmail address that should receive kitchen order emails |
| `CUSTOMER_WEB_APP_URL` | your GitHub Pages URL for `index.html`, e.g. `https://username.github.io/reponame/` |

Leave `SIGNING_SECRET` unset — `setupSystem()` generates it for you.

### C. Run setup

1. In the Apps Script editor, select the function `setupSystem` (in `Setup.gs`) from the
   function dropdown and click **Run**.
2. Approve the permission prompts (Sheets, Gmail, Drive).
3. This creates all sheets with correct headers, seeds the default coupon tiers
   (CAFE5/CAFE8/CAFE10/CAFE15/CAFE20), and generates `SIGNING_SECRET`.
4. Run `runSelfTest()` (in `Tests.gs`) once. It should complete without throwing. Check
   **Executions** in the Apps Script editor for the log output if something fails.

### D. Deploy the Web App

1. **Deploy > New deployment > Select type: Web app.**
2. Execute as: **Me**. Who has access: **Anyone**.
3. Deploy, then copy the `/exec` URL.
4. This is a one-way action per deployment version: every time you change the `.gs`
   files, create a **new deployment** (or use "Manage deployments > Edit > new version")
   so the live `/exec` URL picks up the changes.

### E. Frontend

1. Put `API_URL` (the `/exec` URL from step D) into `frontend-config.js`.
2. Push all frontend files (customer site + dashboard) to a GitHub repository, flat in
   the root:
3. Enable **GitHub Pages** (Settings > Pages > Deploy from branch > `/root`).
4. Confirm `CUSTOMER_WEB_APP_URL` (Script Property, step B) exactly matches this Pages
URL — the dashboard's QR links are built from it.

### F. Owner dashboard access

Open `https://<username>.github.io/<repo>/dashboard.html`, log in with
`OWNER_ACCESS_KEY`. Bookmark it — it is not linked from the customer site.

### G. First-time data entry (from the dashboard)

1. **Tables tab:** add every physical table (table number + optional name). Each gets a
unique token automatically.
2. For each table, click **Copy** next to its QR link, then paste that URL into any free
QR-code generator and print/stick the resulting QR image on the table.
*(This project does not generate QR images itself — only the URL to encode.)*
3. **Menu tab:** add categories/items with price, veg/non-veg, optional tag and tagline.
4. **Coupons tab:** default tiers are already seeded; edit or add more as needed.
5. **Settings tab:** set cafe name, tagline, about text, social/review links. (Logo/hero
image: upload `logo.png`/`hero.jpg` to a Drive folder named `LoveOverCoffee_Assets`,
shared "Anyone with the link, Viewer" — or set `LOGO_URL`/`HERO_IMAGE_URL` directly as
Script Properties.)

## Notifications — what this is and is not

Notifications are **in-app only**: a customer who taps "Allow Notifications" on the menu
page is polled while that tab stays open, and sees a pop-up for new messages. There is
**no true background push** (that needs Web Push/FCM credentials, which are not wired
in). `pushConfigured` stays `false`. Do not promise customers push notifications when
their phone/browser is closed.

## Security notes

- `OWNER_ACCESS_KEY`, `SIGNING_SECRET`, `SPREADSHEET_ID` are Script Properties only —
never in any frontend file.
- The customer browser always sends a **table token**, never a table number; the server
always recomputes prices/discounts — nothing from the browser is trusted for money.
- Gmail action links are signed and expire (`GMAIL_ACTION_TTL_HOURS`), and only allow
`PREPARING`/`COMPLETED` — never `CANCELLED` (that is dashboard-only).

## Testing checklist (do this after deployment)

Run these in order, as the actual customer and actual owner:

1. `runSelfTest()` in Apps Script — must finish clean. *(logic-level, no live HTTP)*
2. Open `?a=ping` on your `/exec` URL in a browser — should show `{"ok":true,...}`.
**(requires live deployment test)**
3. Scan/open a table's QR URL on a phone — menu should load, table number should show
correctly. **(requires live deployment test)**
4. Add items, apply a coupon tier your subtotal qualifies for, place an order.
5. Check the configured `CAFE_EMAIL` inbox — a kitchen email should have arrived with
**START PREPARING** / item list / table number. **(requires live deployment test —
Gmail delivery cannot be verified without a real send)**
6. Click **START PREPARING** in that email — opens a result page saying it worked.
Refresh the customer's track page — status should now show "Preparing".
**(requires live deployment test)**
7. Click **ORDER DONE** in the email — track page should show "Completed".
8. From the dashboard **Orders** tab, place another order and **Cancel** it — track page
should show the cancelled state; customer stats should decrease (check Customers tab).
9. Dashboard **Analytics** tab — daily/weekly/monthly/custom ranges should return
consistent totals with the **Orders** tab for the same dates.
10. **Notifications**: tap "Allow Notifications" as a customer, then send a notification
 to "All" from the dashboard — the pop-up should appear within ~30 seconds while the
 customer tab stays open (per the honest in-app-only model above).
11. Regenerate a table's QR token from the dashboard — the **old** QR URL should now show
 "table not valid" on the customer site, and a newly copied URL should work.
12. Try 11 failed owner logins in a row — the 11th+ should show a "locked" message, not a
 normal wrong-password message (uses `LOGIN_MAX_ATTEMPTS`/`LOGIN_LOCK_MINUTES`).

If anything fails: re-check Script Properties first (most common cause), then the Apps
Script **Executions** log for the exact error.
