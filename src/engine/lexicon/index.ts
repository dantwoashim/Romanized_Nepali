export { loadLexicalAuthority } from "./load";
export {
  SOURCE_PRIORITY,
  queryLexiconByRomanized,
  queryPhraseWindows,
  queryRuntimeDictionary
} from "./authority";
export { assertBundleEligible, canRankStrongly, isRejected } from "./license";
export { frequencyBandFor, normalizeLexiconWord, normalizeRomanizedKey } from "./normalize";
export { SOURCE_REGISTRY, sourceManifestById } from "./sourceRegistry";
export type * from "./types";
