type Regulation = "gdpr" | "us" | "can";

const zones: { [k: string]: Regulation } = {
  // GDPR: EEA
  // Austria
  "Europe/Vienna": "gdpr",
  // Belgium
  "Europe/Brussels": "gdpr",
  // Bulgaria
  "Europe/Sofia": "gdpr",
  // Croatia
  "Europe/Zagreb": "gdpr",
  // Cyprus
  "Asia/Nicosia": "gdpr",
  "Europe/Nicosia": "gdpr",
  // Czech Republic
  "Europe/Prague": "gdpr",
  // Denmark
  "Europe/Copenhagen": "gdpr",
  // Estonia
  "Europe/Tallinn": "gdpr",
  // Finland
  "Europe/Helsinki": "gdpr",
  // France
  "Europe/Paris": "gdpr",
  // Germany
  "Europe/Berlin": "gdpr",
  // Greece
  "Europe/Athens": "gdpr",
  // Hungary
  "Europe/Budapest": "gdpr",
  // Iceland
  "Atlantic/Reykjavik": "gdpr",
  // Ireland
  "Europe/Dublin": "gdpr",
  // Italy
  "Europe/Rome": "gdpr",
  // Latvia
  "Europe/Riga": "gdpr",
  // Liechtenstein
  "Europe/Vaduz": "gdpr",
  // Lithuania
  "Europe/Vilnius": "gdpr",
  // Luxembourg
  "Europe/Luxembourg": "gdpr",
  // Malta
  "Europe/Malta": "gdpr",
  // Norway
  "Europe/Oslo": "gdpr",
  // Poland
  "Europe/Warsaw": "gdpr",
  // Portugal
  "Europe/Lisbon": "gdpr",
  // Romania
  "Europe/Bucharest": "gdpr",
  // Slovakia
  "Europe/Bratislava": "gdpr",
  // Slovenia
  "Europe/Ljubljana": "gdpr",
  // Spain
  "Europe/Madrid": "gdpr",
  // Sweden
  "Europe/Stockholm": "gdpr",
  // The Netherlands
  "Europe/Amsterdam": "gdpr",

  // GDPR: Outside EEA
  // Azores
  "Atlantic/Azores": "gdpr",
  // Canary Islands
  "Atlantic/Canary": "gdpr",
  // French Guiana
  "America/Cayenne": "gdpr",
  // Guadeloupe
  "America/Guadeloupe": "gdpr",
  // Madeira
  "Atlantic/Madeira": "gdpr",
  // Martinique
  "America/Martinique": "gdpr",
  // Mayotte
  "Indian/Mayotte": "gdpr",
  // Reunion
  "Indian/Reunion": "gdpr",
  // Saint Martin
  "America/Marigot": "gdpr",
  // Switzerland
  "Europe/Zurich": "gdpr",
  // United Kingdom
  "Europe/London": "gdpr",

  // CAN: QC
  "America/Toronto": "can",

  // US
  "America/Adak": "us",
  "America/Anchorage": "us",
  "America/Atka": "us",
  "America/Boise": "us",
  "America/Chicago": "us",
  "America/Denver": "us",
  "America/Detroit": "us",
  "America/Indiana/Indianapolis": "us",
  "America/Indiana/Knox": "us",
  "America/Indiana/Marengo": "us",
  "America/Indiana/Petersburg": "us",
  "America/Indiana/Tell_City": "us",
  "America/Indiana/Vevay": "us",
  "America/Indiana/Vincennes": "us",
  "America/Indiana/Winamac": "us",
  "America/Indianapolis": "us",
  "America/Juneau": "us",
  "America/Kentucky/Louisville": "us",
  "America/Kentucky/Monticello": "us",
  "America/Knox_IN": "us",
  "America/Los_Angeles": "us",
  "America/Louisville": "us",
  "America/Menominee": "us",
  "America/Metlakatla": "us",
  "America/New_York": "us",
  "America/Nome": "us",
  "America/North_Dakota/Beulah": "us",
  "America/North_Dakota/Center": "us",
  "America/North_Dakota/New_Salem": "us",
  "America/Phoenix": "us",
  "America/Shiprock": "us",
  "America/Sitka": "us",
  "America/Yakutat": "us",
  "Pacific/Honolulu": "us",
};

function inferRegulation(): Regulation | null {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const regulation = zones[timeZone];

  // Special handling, can currently only applies to quebec
  if (regulation === "can") {
    const inQC = ["fr", "fr-CA"].some((l) => navigator.languages.includes(l));
    return inQC ? "can" : null;
  }

  return regulation ?? null;
}

export { inferRegulation };
export type { Regulation };
