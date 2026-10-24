export interface Region {
  code: string;
  name: string;
  nativeName?: string;
  flag: string;
  lang: string;
  alias?: string;
  isCustom?: boolean;
}

export interface IndianLanguage {
  code: string;
  name: string;
  nativeName: string;
  industry: string;
  flag: string;
  count?: number;
}

export const INDIAN_LANGUAGES: IndianLanguage[] = [
  { code: "all", name: "All India", nativeName: "अखिल भारतीय", industry: "Pan-India Blockbusters", flag: "🇮🇳", count: 892 },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", industry: "Bollywood", flag: "🎬", count: 632 },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", industry: "Kollywood", flag: "⚡", count: 139 },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", industry: "Tollywood", flag: "🔥", count: 57 },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", industry: "Mollywood", flag: "🌴", count: 51 },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", industry: "Tollywood East", flag: "🎭", count: 16 },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", industry: "Sandalwood", flag: "👑", count: 10 },
  { code: "mr", name: "Marathi", nativeName: "मराठी", industry: "Marathi Cinema", flag: "🦁", count: 3 },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", industry: "Pollywood", flag: "💥", count: 1 },
];

export function getIndianLanguageByCode(code: string): IndianLanguage | undefined {
  return INDIAN_LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase());
}

export const ALL_REGIONS: Region[] = [
  { code: "all", name: "All Regions", flag: "🌍", lang: "", alias: "Global Feeds" },
  { code: "IN", name: "India", flag: "🇮🇳", lang: "hi", alias: "Bollywood & Regional" },
  { code: "US", name: "United States", flag: "🇺🇸", lang: "en", alias: "Hollywood" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", lang: "ko", alias: "K-Drama & Movies" },
  { code: "JP", name: "Japan", flag: "🇯🇵", lang: "ja", alias: "Anime & Cinema" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", lang: "en", alias: "British Cinema" },
  { code: "ES", name: "Spain & Latin America", flag: "🇪🇸", lang: "es", alias: "Spanish / Hispanic" },
  { code: "FR", name: "France", flag: "🇫🇷", lang: "fr", alias: "French Cinema" },
  { code: "DE", name: "Germany", flag: "🇩🇪", lang: "de", alias: "German Cinema" },
  { code: "IT", name: "Italy", flag: "🇮🇹", lang: "it", alias: "Italian Cinema" },
  { code: "CN", name: "China", flag: "🇨🇳", lang: "zh", alias: "Chinese / C-Drama" },
  { code: "RU", name: "Russia", flag: "🇷🇺", lang: "ru", alias: "Russian Cinema" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", lang: "pt", alias: "Portuguese / Brazilian" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", lang: "tr", alias: "Turkish Dizi" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", lang: "es", alias: "Mexican Cinema" },
  { code: "CA", name: "Canada", flag: "🇨🇦", lang: "en", alias: "Canadian" },
  { code: "AU", name: "Australia", flag: "🇦🇺", lang: "en", alias: "Australian" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", lang: "th", alias: "Thai Drama & Action" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", lang: "id", alias: "Indonesian Cinema" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", lang: "tl", alias: "Filipino Cinema" },
  { code: "EG", name: "Egypt & Arab World", flag: "🇪🇬", lang: "ar", alias: "Arabic Cinema" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", lang: "sv", alias: "Nordic Noir" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", lang: "en", alias: "Nollywood" },
];

export const DEFAULT_TAB_CODES = ["all", "IN", "US", "KR", "JP", "GB", "ES", "FR"];

const STORAGE_KEY_SELECTED = "vybe_selected_region";
const STORAGE_KEY_CUSTOM_TABS = "vybe_custom_region_tabs";

export function getRegionByCode(code: string): Region | undefined {
  return ALL_REGIONS.find((r) => r.code.toUpperCase() === code.toUpperCase());
}

export function getStoredSelectedRegion(): string {
  if (typeof window === "undefined") return "IN";
  try {
    return localStorage.getItem(STORAGE_KEY_SELECTED) || "IN";
  } catch {
    return "IN";
  }
}

export function setStoredSelectedRegion(code: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SELECTED, code);
  } catch {}
}

export function getStoredTabRegionCodes(): string[] {
  if (typeof window === "undefined") return DEFAULT_TAB_CODES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_TABS);
    if (!raw) return DEFAULT_TAB_CODES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return DEFAULT_TAB_CODES;
}

export function saveStoredTabRegionCodes(codes: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_TABS, JSON.stringify(codes));
  } catch {}
}
