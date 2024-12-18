type Regulation = "gdpr" | "us" | "can";

const zones: { [k: string]: Regulation } = {
  // EU
  "Europe/Amsterdam": "gdpr",
  "Europe/Athens": "gdpr",
  "Europe/Berlin": "gdpr",
  "Europe/Brussels": "gdpr",
  "Europe/Bucharest": "gdpr",
  "Europe/Budapest": "gdpr",
  "Europe/Copenhagen": "gdpr",
  "Europe/Dublin": "gdpr",
  "Europe/Helsinki": "gdpr",
  "Europe/Lisbon": "gdpr",
  "Europe/London": "gdpr",
  "Europe/Madrid": "gdpr",
  "Europe/Oslo": "gdpr",
  "Europe/Paris": "gdpr",
  "Europe/Prague": "gdpr",
  "Europe/Rome": "gdpr",
  "Europe/Sofia": "gdpr",
  "Europe/Stockholm": "gdpr",
  "Europe/Vienna": "gdpr",
  "Europe/Warsaw": "gdpr",
  "Europe/Zurich": "gdpr",

  // CA (QC only)
  "America/Toronto": "can",

  // US
  "America/New_York": "us",
  "America/Detroit": "us",
  "America/Kentucky/Louisville": "us",
  "America/Kentucky/Monticello": "us",
  "America/Indiana/Indianapolis": "us",
  "America/Indiana/Vincennes": "us",
  "America/Indiana/Winamac": "us",
  "America/Indiana/Marengo": "us",
  "America/Indiana/Petersburg": "us",
  "America/Indiana/Vevay": "us",
  "America/Chicago": "us",
  "America/Indiana/Tell_City": "us",
  "America/Indiana/Knox": "us",
  "America/Menominee": "us",
  "America/North_Dakota/Center": "us",
  "America/North_Dakota/New_Salem": "us",
  "America/North_Dakota/Beulah": "us",
  "America/Denver": "us",
  "America/Boise": "us",
  "America/Phoenix": "us",
  "America/Los_Angeles": "us",
  "America/Anchorage": "us",
  "America/Juneau": "us",
  "America/Sitka": "us",
  "America/Metlakatla": "us",
  "America/Yakutat": "us",
  "America/Nome": "us",
  "America/Adak": "us",
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
