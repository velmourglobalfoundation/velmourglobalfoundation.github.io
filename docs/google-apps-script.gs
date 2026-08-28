/* ============================================================
   VELMOUR GLOBAL FOUNDATION — Join Us intake → Google Sheets + Email
   ------------------------------------------------------------
   WHAT THIS DOES
   Every time someone submits one of the new "Join Us" forms
   (Velmour Intern, Velmour Volunteer, Koshur Summit Intern,
   Koshur Summit Campus Ambassador, DIMUN Campus Ambassador),
   the website sends the data here. This script:
     1. Appends a row to the correct Google Sheet (see SHEET_MAP)
     2. Emails velmourglobalfoundation@gmail.com with the details
   No server, no hosting, no cost — it runs on Google's servers
   under your own Google account.

   HOW TO DEPLOY (5–10 minutes, do this once)
   1. Open https://script.google.com and sign in with the SAME
      Google account that owns the 4 spreadsheets below
      (velmourglobalfoundation@gmail.com).
   2. Click "New project". Delete the sample code and paste in
      this entire file.
   3. Click the disk icon to save. Name the project anything,
      e.g. "Velmour Join Us Intake".
   4. Click "Deploy" → "New deployment".
      - Click the gear icon next to "Select type" → choose "Web app".
      - Description: anything.
      - Execute as: "Me".
      - Who has access: "Anyone".
      - Click "Deploy".
   5. Google will ask you to authorise the script (it's your own
      script acting on your own sheets/email — click through the
      "unverified app" warning with your own account, this is normal
      for a script you wrote yourself).
   6. Copy the "Web app URL" you're given (ends in /exec).
   7. Open js/registration.js in the website code, find
      VELMOUR_CONFIG.gsheets, paste the URL into webAppUrl, and
      change enabled to true. Save and re-upload the file.
   8. Done. Test it: submit any Join Us form on the live site and
      check the relevant sheet + your inbox.

   IF YOU EVER CHANGE THE SCRIPT CODE: you must create a NEW
   deployment (Deploy → Manage deployments → Edit → New version)
   for the changes to go live — editing the code alone isn't enough.
   ============================================================ */

// Maps each form's internal "formType" to a spreadsheet + tab (sheet) name.
// These IDs come from the 4 links you shared. IMPORTANT — see note below.
var SHEET_MAP = {
  velmour_intern:    { id: "11mIKUvJhyveg9xIjnTR0Ifa1LcXtqXR933CEaVW1UXM", tab: "Interns" },
  velmour_volunteer: { id: "1J9YGFI5dgIJp_zD0AIVmL9NltWCP9fkdsczT500Ot1k", tab: "Volunteers" },

  koshur_intern:     { id: "1RkR6LIGnUcqfTmKmmOG_j8yor3c0lNF4uUuSF_LcA5E", tab: "Interns" },
  koshur_ca:         { id: "1i0JAsyk269_sDQ5rIJdMV_PRTMZzzcGMuUxKjL5fI1g", tab: "Campus Ambassadors" },

  // NOTE: no link was provided for DIMUN Campus Ambassador. Create a
  // Google Sheet for it, share/own it with velmourglobalfoundation@gmail.com,
  // copy its ID from the URL, and paste it in below. Until then, DIMUN
  // Campus Ambassador submissions will still be emailed (see doPost),
  // just not written to a sheet.
  dimun_ca:          { id: "PASTE_DIMUN_CAMPUS_AMBASSADOR_SHEET_ID_HERE", tab: "Campus Ambassadors" }
};

// Columns written to the sheet, and shown in the notification email, in order.
var COLUMNS = [
  "submittedAt", "id", "event", "role", "full_name",
  "phone", "phone_secondary", "email",
  "qualification", "experience", "why_choose", "heard_about"
];

var ADMIN_EMAIL = "velmourglobalfoundation@gmail.com";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var target = SHEET_MAP[data.formType];

    if (target && target.id.indexOf("PASTE_") !== 0) {
      var ss = SpreadsheetApp.openById(target.id);
      var sheet = ss.getSheetByName(target.tab);
      if (!sheet) {
        sheet = ss.insertSheet(target.tab);
        sheet.appendRow(COLUMNS);
      }
      if (sheet.getLastRow() === 0) sheet.appendRow(COLUMNS);
      sheet.appendRow(COLUMNS.map(function (c) { return data[c] || ""; }));
    }

    // Email the admin regardless — even if the sheet isn't configured yet.
    var subject = "New " + (data.role || "Application") + " — " + (data.event || "Velmour");
    var body = COLUMNS.map(function (c) { return c + ": " + (data[c] || "—"); }).join("\n");
    MailApp.sendEmail(ADMIN_EMAIL, subject, body);

    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + err.message);
  }
}
