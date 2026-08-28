/* ============================================================
   EVENTS DATA — the ONLY file you need to touch to add, edit,
   or remove an event from the Home and Events pages.

   Fields:
   id       — unique slug, no spaces
   org      — "velmour" or "dimun" (controls the coloured tag)
   title    — event name
   tag      — small label shown above the title
   day/mo   — big date shown on the card ("TBA" is fine for both)
   blurb    — one or two sentence description
   href     — where the "View" / "Register" button goes
   register — true to show a Register button, false for View only
   ============================================================ */

const VELMOUR_EVENTS = [
  {
    id: "koshur-summit",
    org: "velmour",
    title: "Koshur Summit",
    tag: "Flagship Initiative · Velmour Global Foundation",
    day: "25–26",
    mo: "Dec 2026",
    // EDIT ME: set the real date/time once confirmed — the homepage countdown reads this.
    // Format: "YYYY-MM-DDTHH:MM:SS" (24-hour clock, local time).
    date: "2026-12-25T09:00:00",
    // EDIT ME: swap for any photo in assets/images/gallery/
    img: "assets/images/gallery/velmour-youth-outdoor.jpg",
    blurb: "A Velmour Global Foundation initiative bringing together young people to engage with Kashmiri culture, leadership and community life. Taking place on 25–26 December 2026.",
    href: "events.html#koshur-summit",
    register: true,
    registerHref: "events.html#koshur-register",
    instagram: "https://www.instagram.com/thekoshursummit/"
  },
  {
    id: "dimun-conference",
    org: "dimun",
    title: "DIMUN Conference",
    tag: "Flagship Initiative · DIMUN",
    day: "TBA",
    mo: "2026",
    // EDIT ME: swap for any photo in assets/images/gallery/
    img: "assets/images/gallery/dimun-committee-group.jpg",
    blurb: "The flagship Model United Nations conference under DIMUN — diplomacy, debate and leadership for delegates across Jammu & Kashmir.",
    href: "dimun.html#conferences",
    register: true,
    registerHref: "dimun.html#dimun-register",
    instagram: "https://www.instagram.com/dimunofficial/"
  }
];

function renderEventCards(container, filterOrg){
  const list = filterOrg ? VELMOUR_EVENTS.filter(e => e.org === filterOrg) : VELMOUR_EVENTS;
  container.innerHTML = list.map(e => `
    <div class="event-card reveal">
      ${e.img ? `<img src="${e.img}" alt="${e.title}" class="event-photo">` : ''}
      <div class="event-date">
        <span class="day">${e.day}</span>
        <span class="mo">${e.mo}</span>
      </div>
      <div class="event-body">
        <span class="event-tag" style="${e.org==='dimun' ? 'color:#E2554E;border-color:#E2554E;' : ''}">${e.tag}</span>
        <h3>${e.title}</h3>
        <p>${e.blurb}</p>
      </div>
      <div style="display:flex;gap:10px;flex-direction:column;">
        <a href="${e.href}" class="btn btn-sm">View</a>
        ${e.register ? `<a href="${e.registerHref}" class="btn btn-sm btn-accent">Register</a>` : ''}
      </div>
    </div>
  `).join('');
}
