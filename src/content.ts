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
  { label: "Surf Packages", href: "#surf-packages" },
  { label: "Surf Lessons", href: "#surf-lessons" },
  { label: "Activities", href: "/activities" },
  { label: "About Us", href: "#why-us" },
  { label: "Contact Us", href: "#contact" },
  { label: "Blog", href: "#journal" },
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
  { id: "plan", n: "01", kicker: "Your arrival", title: "A warm welcome. A smooth start.",
    body: "Your driver is ready when you land, so the first moments of your trip feel easy.",
    from: 0.13, to: 0.23, pos: "left-5 right-5 bottom-24 md:right-auto md:left-[6vw] md:top-[56%] md:bottom-auto md:w-[28vw]" },
  { id: "connections", n: "02", kicker: "The little details", title: "Every detail, already considered.",
    body: "Thoughtful transfers, handpicked stays and local recommendations—connected around you.",
    from: 0.26, to: 0.36, pos: "left-5 right-5 bottom-24 md:left-auto md:right-[6vw] md:top-[20%] md:bottom-auto md:w-[27vw]" },
  { id: "follow", n: "03", kicker: "Your Morocco", title: "Arrive curious. Leave with stories.",
    body: "Make space for the places, people and experiences you came all this way to discover.",
    from: 0.39, to: 0.46, pos: "left-5 right-5 bottom-24 md:right-auto md:left-[9vw] md:top-[30%] md:bottom-auto md:w-[26vw]" },
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
