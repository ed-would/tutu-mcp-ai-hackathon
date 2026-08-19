import { preferenceSummary, rankPackages, seedUnit } from "../../shared/prefs";

const ESTIMATED_NOTE = "Два отдельных билета; цена может измениться";
const PARTIAL_NOTE = "Два отдельных билета или неполный ответ; цена может измениться";

export function packagePriceNote(isPartial: boolean): string {
  return isPartial ? PARTIAL_NOTE : ESTIMATED_NOTE;
}

export { preferenceSummary, rankPackages, seedUnit };
