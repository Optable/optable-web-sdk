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

  // CA
  "America/St_Johns": "can",
  "America/Halifax": "can",
  "America/Glace_Bay": "can",
  "America/Moncton": "can",
  "America/Goose_Bay": "can",
  "America/Blanc-Sablon": "can",
  "America/Toronto": "can",
  "America/Nipigon": "can",
  "America/Thunder_Bay": "can",
  "America/Iqaluit": "can",
  "America/Pangnirtung": "can",
  "America/Atikokan": "can",
  "America/Winnipeg": "can",
  "America/Rainy_River": "can",
  "America/Resolute": "can",
  "America/Rankin_Inlet": "can",
  "America/Regina": "can",
  "America/Swift_Current": "can",
  "America/Edmonton": "can",
  "America/Cambridge_Bay": "can",
  "America/Yellowknife": "can",
  "America/Inuvik": "can",
  "America/Creston": "can",
  "America/Dawson_Creek": "can",
  "America/Fort_Nelson": "can",
  "America/Whitehorse": "can",
  "America/Dawson": "can",
  "America/Vancouver": "can",

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

export { inferRegulation, Regulation };
