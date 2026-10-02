/**
 * frontend-config.js
 * The ONLY place where the backend URL is written. Shared by index.html and dashboard.html.
 *
 * Replace the value below with your Apps Script Web App URL
 * (Apps Script > Deploy > Manage deployments > Web app URL, ends with /exec).
 *
 * This URL is public by nature. Never put OWNER_ACCESS_KEY, SIGNING_SECRET or
 * SPREADSHEET_ID in any frontend file.
 */
window.LOC_CONFIG = Object.freeze({
  API_URL: 'https://script.google.com/macros/s/AKfycbzR0WcQNCQVpP7Gf9sit84Gj7gQ-V6twv1luR6_yxfC0yOTn9mgc1AJnUdIK354TscSQQ/exec'
});