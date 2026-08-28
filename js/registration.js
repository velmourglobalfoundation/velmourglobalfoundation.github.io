/* ============================================================
   VELMOUR / KOSHUR SUMMIT / DIMUN — Registration Engine
   ------------------------------------------------------------
   WHAT THIS FILE DOES ON ITS OWN (no setup needed):
   - Captures the registration form
   - Saves every registration in the browser (localStorage), which
     the Admin page (admin.html) reads to show the full list and
     let you download a PDF of one, or all, registrations
   - Generates a PDF confirmation for the registrant instantly

   WHAT NEEDS 5–10 MIN OF SETUP FROM YOU (marked "SETUP" below):
   1. EMAIL ON EVERY REGISTRATION → EmailJS (free, no backend needed)
      - Create a free account at https://www.emailjs.com
      - Connect velmourglobalfoundation@gmail.com as the sending service
      - Create an email template, then paste your
        Public Key / Service ID / Template ID into the CONFIG block below
   2. GOOGLE SHEETS + EMAIL, in one step → Google Apps Script (recommended)
      - This single free step gives you BOTH the Google Sheets sync AND
        an email to velmourglobalfoundation@gmail.com on every Join Us /
        Intern / Volunteer / Campus Ambassador submission — no EmailJS
        account needed for these forms.
      - Full instructions + ready-to-paste code: /docs/google-sheets-setup.md
        and /docs/google-apps-script.gs in this repository.
      - Once deployed, paste the Web App URL into gsheets.webAppUrl below
        and set gsheets.enabled to true.
   3. PAYMENT → Razorpay (or any gateway) needs a merchant account.
      Where it plugs in is marked "PAYMENT GATEWAY HOOK" below.
   4. SMS ON PAYMENT → SMS APIs (MSG91, Twilio, etc.) require a secret
      key that must never sit in browser code — this needs a tiny
      server endpoint. The hook point is marked "SMS HOOK" below.

   IMPORTANT: localStorage lives in ONE browser. It is the simplest
   way to get this working with zero backend, but it will NOT sync
   registrations across different visitors' devices — only email/Sheets
   (once connected) and a real database will do that.
   ============================================================ */

const VELMOUR_CONFIG = {
  emailjs: {
    enabled: false,              // set true once you've added your keys below
    publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
    serviceId: "YOUR_EMAILJS_SERVICE_ID",
    templateId: "YOUR_EMAILJS_TEMPLATE_ID"
  },
  // SETUP #2 — Google Sheets + email via Apps Script. See /docs/google-sheets-setup.md
  gsheets: {
    enabled: true,               // set true once deployed
    webAppUrl: "https://script.google.com/macros/s/AKfycbxDjhQB9F8irB31ekci2zt8DK8CoUkrzcsqjOtVcwx4nlxPEdkvyR1W6STF6H43xA/exec"
  },
  adminEmail: "velmourglobalfoundation@gmail.com",
  adminPassphrase: "velmour2026"   // change this — client-side only, see admin.html note
};

const STORAGE_KEY = "velmour_registrations_v1";

function getRegistrations(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch(e){ return []; }
}
function saveRegistrations(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function genId(){
  return 'VGF-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random()*900+100);
}

/* ---------- Core submit handler, used by all registration forms ---------- */
function submitRegistration(form, formConfig){
  const data = { id: genId(), submittedAt: new Date().toISOString(), event: formConfig.event, paid: false };
  const fd = new FormData(form);
  for(const [k,v] of fd.entries()) data[k] = v;

  // basic required-field check for the mandatory fields we care about
  for(const req of formConfig.required){
    if(!data[req] || String(data[req]).trim() === ""){
      showMsg(form, `Please fill in "${req.replace(/_/g,' ')}" — it's required.`, 'err');
      return null;
    }
  }

  const list = getRegistrations();
  list.push(data);
  saveRegistrations(list);

  // Generate the PDF immediately for the registrant
  generateRegistrationPDF(data, formConfig);

  // SETUP #1 — email the admin on every registration (EmailJS)
  if(VELMOUR_CONFIG.emailjs.enabled && window.emailjs){
    emailjs.send(VELMOUR_CONFIG.emailjs.serviceId, VELMOUR_CONFIG.emailjs.templateId, {
      to_email: VELMOUR_CONFIG.adminEmail,
      registrant_name: data.full_name || '',
      event: formConfig.event,
      role: data.role || formConfig.role || '',
      details: JSON.stringify(data, null, 2)
    }, VELMOUR_CONFIG.emailjs.publicKey);
  }

  // SETUP #2 — send this submission to Google Sheets (+ email) via Apps Script.
  // formConfig.formType tells the Apps Script which sheet/tab to append to
  // (see SHEET_MAP in /docs/google-apps-script.gs). Uses mode:'no-cors'
  // because Apps Script Web Apps don't send CORS headers back — the request
  // still reaches the script and the row still gets written even though the
  // browser can't read the response.
  if(VELMOUR_CONFIG.gsheets.enabled && formConfig.formType && VELMOUR_CONFIG.gsheets.webAppUrl){
    fetch(VELMOUR_CONFIG.gsheets.webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ ...data, formType: formConfig.formType })
    }).catch(()=>{ /* fails silently — the local PDF still downloaded */ });
  }

  showMsg(form, formConfig.noPayment
    ? `Thank you — your application has been received. Your reference ID is ${data.id}. A confirmation PDF has downloaded, and our team will be in touch.`
    : `Registration received. Your reference ID is ${data.id}. A confirmation PDF has downloaded — next, complete payment below.`, 'ok');
  return data;
}

function showMsg(form, text, type){
  let msg = form.querySelector('.form-msg');
  if(!msg){
    msg = document.createElement('div');
    msg.className = 'form-msg';
    form.prepend(msg);
  }
  msg.className = `form-msg ${type}`;
  msg.textContent = text;
  msg.style.display = 'block';
  msg.scrollIntoView({behavior:'smooth', block:'center'});
}

/* ---------- PDF generation (registrant copy) ---------- */
function generateRegistrationPDF(data, formConfig){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont("times","bold"); doc.setFontSize(18);
  doc.text("VELMOUR GLOBAL FOUNDATION", 105, 22, {align:"center"});
  doc.setFontSize(12); doc.setFont("times","normal");
  doc.text(formConfig.event, 105, 30, {align:"center"});
  doc.setDrawColor(201,162,75); doc.line(20,36,190,36);

  doc.setFontSize(13); doc.setFont("helvetica","bold");
  doc.text("Registration Confirmation", 20, 48);
  doc.setFont("helvetica","normal"); doc.setFontSize(11);

  let y = 60;
  const row = (label, value) => {
    doc.setFont("helvetica","bold"); doc.text(`${label}:`, 20, y);
    doc.setFont("helvetica","normal"); doc.text(String(value ?? "—"), 75, y);
    y += 9;
  };
  row("Reference ID", data.id);
  row("Registered on", new Date(data.submittedAt).toLocaleString());
  row("Role", data.role || formConfig.role || "—");
  row("Full Name", data.full_name);
  if(data.age) row("Age", data.age);
  if(data.school) row("School / Institution", data.school);
  row("Phone", data.phone);
  if(data.phone_secondary) row("Secondary Phone", data.phone_secondary);
  row("Email", data.email);
  if(data.committee_pref) row("Committee Preference", data.committee_pref);
  if(data.qualification) row("Academic Qualification", data.qualification);
  if(data.heard_about) row("Heard About Us Via", data.heard_about);
  if(!formConfig.noPayment) row("Payment Status", "Pending");

  if(data.experience){
    y += 4;
    doc.setFont("helvetica","bold"); doc.text("Experience:", 20, y); y += 7;
    doc.setFont("helvetica","normal");
    const expLines = doc.splitTextToSize(String(data.experience), 165);
    doc.text(expLines, 20, y); y += expLines.length * 6 + 4;
  }
  if(data.why_choose){
    doc.setFont("helvetica","bold"); doc.text("Why We Should Choose Them:", 20, y); y += 7;
    doc.setFont("helvetica","normal");
    const whyLines = doc.splitTextToSize(String(data.why_choose), 165);
    doc.text(whyLines, 20, y); y += whyLines.length * 6 + 4;
  }

  y += 6;
  doc.setDrawColor(220,220,220); doc.line(20,y,190,y); y += 12;
  doc.setFontSize(10); doc.setTextColor(90,90,90);
  doc.text(formConfig.noPayment
    ? "Our team will review your application and reach out with next steps."
    : "Please complete payment on the registration page to confirm your seat.", 20, y);
  y += 6;
  doc.text("Velmour Global Foundation · Shalteng, Srinagar, J&K · velmourglobalfoundation@gmail.com", 20, y);

  doc.save(`${formConfig.event.replace(/\s+/g,'_')}_${data.id}.pdf`);
}

/* ---------- PAYMENT GATEWAY HOOK ---------- */
/* Replace the body of this function with your gateway's checkout call
   (e.g. Razorpay: open Razorpay.Checkout, then in its success callback
   call markAsPaid(id) below). Left as a manual confirmation for now
   so the flow is fully demonstrable before a gateway is connected. */
function startPayment(id){
  const confirmed = window.confirm(
    "Payment gateway not yet connected.\n\nOnce your payment provider (e.g. Razorpay) is added here, this button will open the real checkout.\n\nFor now, click OK to simulate a successful payment and mark this registration as paid."
  );
  if(confirmed) markAsPaid(id);
}

function markAsPaid(id){
  const list = getRegistrations();
  const rec = list.find(r => r.id === id);
  if(!rec) return;
  rec.paid = true;
  rec.paidAt = new Date().toISOString();
  saveRegistrations(list);

  // SMS HOOK — call your server endpoint here once one exists, e.g.:
  // fetch('/api/send-sms', {method:'POST', body: JSON.stringify({to: rec.phone, id})});

  alert(`Payment marked as received for ${rec.full_name || id}. A paid-delegates PDF can be generated any time from the Admin page.`);
  if(typeof renderAdminTable === 'function') renderAdminTable();
}

/* ---------- Admin exports ---------- */
function exportAllPDF(onlyPaid){
  const list = getRegistrations().filter(r => onlyPaid ? r.paid : true);
  if(!list.length){ alert('No registrations to export yet.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont("times","bold"); doc.setFontSize(16);
  doc.text("VELMOUR GLOBAL FOUNDATION", 105, 18, {align:"center"});
  doc.setFontSize(11); doc.setFont("helvetica","normal");
  doc.text(onlyPaid ? "Paid Delegates — Master List" : "All Registrations — Master List", 105, 26, {align:"center"});
  doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 32, {align:"center"});

  let y = 44;
  list.forEach((r, i) => {
    if(y > 270){ doc.addPage(); y = 20; }
    doc.setFont("helvetica","bold"); doc.setFontSize(11);
    doc.text(`${i+1}. ${r.full_name || 'Unnamed'}  —  ${r.event}  —  ${r.role || ''}`, 15, y); y += 6;
    doc.setFont("helvetica","normal"); doc.setFontSize(9.5);
    doc.text(`ID: ${r.id}   Phone: ${r.phone || '—'}   Email: ${r.email || '—'}   Paid: ${r.paid ? 'YES' : 'NO'}`, 15, y); y += 9;
  });
  doc.save(onlyPaid ? "Paid_Delegates.pdf" : "All_Registrations.pdf");
}

function exportCSV(){
  const list = getRegistrations();
  if(!list.length){ alert('No registrations to export yet.'); return; }
  const cols = ["id","submittedAt","event","role","full_name","age","school","phone","phone_secondary","email","committee_pref","qualification","experience","why_choose","heard_about","paid","paidAt"];
  const rows = [cols.join(",")].concat(list.map(r => cols.map(c => `"${(r[c] ?? '').toString().replace(/"/g,'""')}"`).join(",")));
  const blob = new Blob([rows.join("\n")], {type:"text/csv"});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "Registrations.csv";
  a.click();
}
