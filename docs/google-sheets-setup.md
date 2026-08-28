# Sending Join Us submissions to Google Sheets + email

This covers the "Join Us" forms added to the site: Velmour Global Intern,
Velmour Global Volunteer, Koshur Summit Intern, Koshur Summit Campus
Ambassador, and DIMUN Campus Ambassador.

I can't create or write to your Google Sheets directly from here — that
needs your Google login, which only you can provide. But I've written the
full script for you, so it's copy → paste → deploy, about 5–10 minutes,
and it's free.

## What you get once this is set up

Every time someone submits one of the Join Us forms:
1. **A row is added automatically** to the correct Google Sheet (the ones
   you linked).
2. **An email is sent** to `velmourglobalfoundation@gmail.com` with all
   the details — no separate EmailJS account needed for these forms.
3. The applicant **still gets an instant PDF download** on their own
   device, as before (this part already works with no setup).

## Steps

1. Go to **[script.google.com](https://script.google.com)** and sign in
   as `velmourglobalfoundation@gmail.com` (the account that owns the
   sheets you linked).
2. **New project** → delete the placeholder code → paste in the entire
   contents of `docs/google-apps-script.gs` from this repository.
3. Save the project (disk icon), give it a name.
4. **Deploy → New deployment → gear icon → Web app.**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, then approve the Google permission prompt for
     your own script (the "unverified app" warning is expected and
     normal for a script you wrote yourself).
5. Copy the **Web app URL** (ends in `/exec`).
6. Open `js/registration.js` in this repository and find:
   ```js
   gsheets: {
     enabled: false,
     webAppUrl: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE"
   }
   ```
   Paste your URL in, and change `enabled` to `true`. Save, commit, and
   push/redeploy the site.
7. Submit a test application on the live site and confirm the row and
   the email both arrive.

## One thing still to fix on your end (I can't do this for you)

- **DIMUN Campus Ambassador sheet** — no link was provided for this one.
  Create a Google Sheet for it, then copy its ID from the address bar
  (the long string between `/d/` and `/edit`) into `dimun_ca.id` in
  `google-apps-script.gs`. Until you do, those submissions will still
  arrive by email, just not get a sheet row yet.

## Re-deploying after future code changes

If you or a developer ever edit `google-apps-script.gs` again, you must
create a **new version** of the deployment (Deploy → Manage deployments
→ Edit (pencil) → New version → Deploy) — saving the code alone doesn't
push it live.

## If you'd rather I not touch Apps Script at all

The site works perfectly well without any of this — every submission
still saves a PDF to the applicant's device, and (if you set up EmailJS
instead, see the comment block at the top of `js/registration.js`)
emails you too. Google Sheets sync is an enhancement, not a requirement.
