import type { UserTagPreferenceDto } from "@/lib/types/tag";

export function groupTagPreferencesByCategory(
  prefs: UserTagPreferenceDto[],
): Record<string, string[]> {
  return prefs
    .slice()
    .sort((a, b) => b.score - a.score)
    .reduce<Record<string, string[]>>((acc, pref) => {
      const cat = pref.tag.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(pref.tag.title);
      return acc;
    }, {});
}
