// Search ranking for Command Palette
//
// Scoring tiers (see SCORING_WEIGHTS in constants.js):
//   10000  exact title     : "label" matches item titled "label"
//    9000  exact key       : "label" matches item keyed "label"
//    6000  title prefix    : "lab" matches "label"
//    5000  key prefix      : "lab" matches key "label"
//    3500  word boundary   : "label" matches "form label" (not mid-word)
//    2500  title contains  : "bel" matches "label"
//    1800  key contains    : "bel" matches key "label"
//     800  fuzzy title     : subsequence match with gap/length penalties
//     400  desc contains   : "bel" matches description
//     200  length bonus    : shorter titles rank higher on ties
//     100  fuzzy desc      : fuzzy match on description
//
// Scores stack: an exact title match also earns prefix + contains + fuzzy.
// Ties broken by original DOM index (stable sort).
//
import { SCORING_WEIGHTS } from "framework_docs/command_palette/constants"
import { devLog } from "framework_docs/command_palette/dom_utils"

export class SearchEngine {
  constructor() {
    this.weights = SCORING_WEIGHTS
  }

  escapeRegExp(string) {
    return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }

  fuzzyScore(text, query) {
    if (!query) return 1

    const { fuzzyMatchReward, fuzzyGapPenalty, fuzzyLengthPenalty } = this.weights
    let textIndex = 0
    let queryIndex = 0
    let score = 0

    while (textIndex < text.length && queryIndex < query.length) {
      if (text[textIndex] === query[queryIndex]) {
        score += fuzzyMatchReward
        queryIndex++
      } else {
        score -= fuzzyGapPenalty
      }
      textIndex++
    }

    if (queryIndex === query.length) {
      const lengthPenalty = Math.max(0, text.length - query.length) * fuzzyLengthPenalty
      return Math.max(1, score - lengthPenalty)
    }

    return 0
  }

  // NOTE: wordBoundaryPattern is pre-compiled once per search() call, not per item
  rankItem(item, query, wordBoundaryPattern) {
    if (!query) return 0

    const title = (item.titleRaw || item.title || "").toLowerCase()
    const key = (item.keyRaw || item.key || "").toLowerCase()
    const desc = (item.descriptionRaw || item.description || "").toLowerCase()

    let score = 0

    // Exact matches (highest priority)
    if (title === query) score += this.weights.exactTitle
    if (key === query) score += this.weights.exactKey

    // Prefix matches
    if (title.startsWith(query)) score += this.weights.titleStartsWith
    if (key.startsWith(query)) score += this.weights.keyStartsWith

    // Word boundary match
    if (wordBoundaryPattern.test(title)) score += this.weights.titleWordStart

    // Contains matches
    if (title.includes(query)) score += this.weights.titleContains
    if (key.includes(query)) score += this.weights.keyContains
    if (desc.includes(query)) score += this.weights.descContains

    // Fuzzy matching
    const titleFuzzy = this.fuzzyScore(title, query)
    if (titleFuzzy > 0) {
      score += this.weights.fuzzyTitle + titleFuzzy * this.weights.fuzzyTitleMultiplier
    }

    const descFuzzy = this.fuzzyScore(desc, query)
    if (descFuzzy > 0) {
      score += this.weights.fuzzyDesc + descFuzzy * this.weights.fuzzyDescMultiplier
    }

    // Length bonus for shorter titles
    if (title.includes(query)) {
      score += Math.max(0, this.weights.lengthBonus - title.length)
    }

    return score
  }

  search(items, query) {
    const normalizedQuery = (query || "").toLowerCase().trim()
    devLog("🔍 SearchEngine.search:", { items: items.length, query: normalizedQuery })

    if (!normalizedQuery) {
      return items.map((item) => ({ item, score: 0 }))
    }

    const wordBoundaryPattern = new RegExp("(^|\\s|_|-)" + this.escapeRegExp(normalizedQuery))

    const scored = items.map((item) => ({
      item,
      score: this.rankItem(item, normalizedQuery, wordBoundaryPattern)
    }))

    const results = scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.item.index - b.item.index)

    devLog("🎯 Search results:", results.length, "matched")
    return results
  }
}
