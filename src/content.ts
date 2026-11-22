const base = "https://media.scrollhaus.ai/sites/freight-forward/assets/";

export const MEDIA = {
  film: "/entry-film.mp4",
  filmAlt: `${base}e8eb434f-d097-4b1b-b9e6-c8b46fa43040.mp4`,
  poster: "/morocco_scroll_poster.jpg",
  terminal: `${base}terminal.jpg`,
  port: `${base}port.jpg`,
  warehouse: `${base}warehouse.jpg`,
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "Surf Packages", href: "/surf-packages" },
  { label: "Surf Lessons", href: "/surf-lessons" },
  { label: "Activities", href: "/activities" },
  { label: "About Us", href: "/#about-ocean" },
  { label: "Contact Us", href: "/#contact" },
  { label: "Blog", href: "/#journal" },
];

export const MENU_LINKS = [
  { n: "01", label: "Taghazout Ocean", href: "#ocean-experience" },
  { n: "02", label: "Surf Packages", href: "#surf-packages" },
  { n: "03", label: "Surf Lessons", href: "#surf-lessons" },
  { n: "04", label: "Activities & Adventures", href: "#activities-adventures" },
  { n: "05", label: "How it works", href: "#journey" },
  { n: "06", label: "Travel journal", href: "#journal" },
  { n: "07", label: "Why choose us", href: "#why-us" },
  { n: "08", label: "Plan your trip", href: "#contact" },
];

/** `from`/`to` are scroll-film progress (0–1). All copy lives inside the first 46%. */
export const CHAPTERS = [
  { id: "plan", n: "01", align: "left", kicker: "The journey begins", title: "A better kind of arrival.",
    body: "From airport pickup to your first easy morning, the details are already in hand.",
    from: 0.13, to: 0.23, pos: "left-5 right-5 bottom-24 md:right-auto md:left-[8vw] md:top-[54%] md:bottom-auto md:w-[32vw]" },
  { id: "connections", n: "02", align: "right", kicker: "The little things", title: "Thoughtful from the first hello.",
    body: "Handpicked stays, considered transfers and local recommendations, connected around your trip.",
    from: 0.26, to: 0.36, pos: "left-5 right-5 bottom-24 md:left-auto md:right-[8vw] md:top-[17%] md:bottom-auto md:w-[32vw]" },
  { id: "follow", n: "03", align: "left", kicker: "Your Morocco, your way", title: "Leave room for the unexpected.",
    body: "A hidden café, a longer sunset, one more wave. Find the Morocco that feels like yours.",
    from: 0.39, to: 0.46, pos: "left-5 right-5 bottom-24 md:right-auto md:left-[11vw] md:top-[27%] md:bottom-auto md:w-[34vw]" },
] as const;

export const ALT = {
  terminal: "Aerial view of an organised shipping container terminal",
  port: "Container ships beside dockside cranes in a working port",
  warehouse: "Organised warehouse with cargo ready for distribution",
};

export type RouteMode = "sea" | "air" | "land";
export const ROUTES: Record<RouteMode, { tab: string; from: string; via: string; to: string; copy: string }> = {
  sea: { tab: "By sea", from: "Origin port", via: "Transshipment", to: "Destination port",
    copy: "Space for the bigger picture. Connect container volume, sailing schedules and the onward journey." },
  air: { tab: "By air", from: "Origin airport", via: "Hub connection", to: "Destination airport",
    copy: "For cargo with somewhere to be. Line up cut-offs, routing and handling so urgency arrives with a plan." },
  land: { tab: "By land", from: "Origin depot", via: "Intermodal ramp", to: "Destination terminal",
    copy: "The connections between the connections. Join linehaul, rail and local delivery into one continuous movement." },
};

export const SERVICES = [
  { title: "Ocean freight",
    body: "Space for the bigger picture. Build a sea-freight plan around your cargo volume, sailing schedule and destination requirements.",
    points: ["Full container", "Shared container", "Port to door"] },
  { title: "Air freight",
    body: "For cargo with somewhere to be. Weigh speed, routing and handling requirements together, so urgency comes with a clear plan.",
    points: ["Time-sensitive cargo", "International routes", "Careful handling"] },
  { title: "Road & rail",
    body: "The connections between the connections. Consider linehaul, local delivery and rail as one continuous movement.",
    points: ["First mile", "Intermodal connections", "Final delivery"] },
  { title: "Customs & coordination",
    body: "A smooth border crossing starts before arrival. Make space in the plan for paperwork, classification and the right local advice.",
    points: ["Documentation", "Border requirements", "Specialist coordination"] },
  { title: "Warehousing & distribution",
    body: "Movement doesn't stop at the warehouse. Connect storage, fulfilment and onward delivery to the rest of your supply chain.",
    points: ["Storage planning", "Pick and pack", "Distribution"] },
];

export const STEPS = [
  { n: "01", label: "Before it moves", title: "Start with the whole picture.",
    body: "Where it starts. Where it's going. What matters along the way. A useful plan starts with the right questions." },
  { n: "02", label: "Along the way", title: "Keep the connections clear.",
    body: "One shared plan across each handoff, with milestones that help everyone understand what happens next." },
  { n: "03", label: "At the other end", title: "Finish with the next move.",
    body: "Delivery is a milestone, not an afterthought. Bring the journey together and learn for the next one." },
];

export const TRANSPORT_MODES = ["Ocean freight", "Air freight", "Road & rail", "Not sure yet — let's explore"];
