import { getLanguage } from "@/lib/i18n";

/** Fork: a top-bar button's instant tip - its name, a few plain words (English) and its shortcut. */
export function topTip(label: string, hintEn: string, keys?: string) {
  const hint = getLanguage() === "en" ? ` – ${hintEn}` : "";
  return `${label}${hint}${keys ? ` (${keys})` : ""}`;
}
