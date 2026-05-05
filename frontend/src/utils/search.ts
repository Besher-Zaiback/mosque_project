function normalizeDigits(value: string) {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

export function normalizeSearchValue(value: unknown) {
  return normalizeDigits(String(value ?? ""))
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/\u0640/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}\s%]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSearchTokens(query: string) {
  return normalizeSearchValue(query).split(" ").filter(Boolean);
}

export function matchesSearch(query: string, values: unknown[]) {
  const tokens = getSearchTokens(query);
  if (tokens.length === 0) return true;

  const haystack = normalizeSearchValue(values.join(" "));
  return tokens.every((token) => haystack.includes(token));
}

export function rankSearchMatch(query: string, values: unknown[]) {
  const tokens = getSearchTokens(query);
  if (tokens.length === 0) return 0;

  const fields = values.map((value) => normalizeSearchValue(value));
  const haystack = fields.join(" ");
  if (!tokens.every((token) => haystack.includes(token))) return -1;

  return tokens.reduce((score, token) => {
    if (fields.some((field) => field === token)) return score + 100;
    if (fields.some((field) => field.startsWith(token))) return score + 60;
    if (fields.some((field) => field.split(" ").some((part) => part.startsWith(token)))) return score + 35;
    return score + 10;
  }, 0);
}

export function filterAndRankSearch<T>(
  items: T[],
  query: string,
  getValues: (item: T) => unknown[]
) {
  const tokens = getSearchTokens(query);
  if (tokens.length === 0) return items;

  return items
    .map((item, index) => ({
      item,
      index,
      score: rankSearchMatch(query, getValues(item)),
    }))
    .filter((result) => result.score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((result) => result.item);
}
