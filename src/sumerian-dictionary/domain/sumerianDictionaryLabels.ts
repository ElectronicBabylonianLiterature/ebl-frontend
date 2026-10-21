import {
  AliasRelation,
  CrossReferenceRelation,
} from 'sumerian-dictionary/domain/SumerianWordParts'

export const partOfSpeechLabels: Readonly<Record<string, string>> = {
  N: 'Noun',
  V: 'Verb',
  'V/t': 'Transitive verb',
  'V/i': 'Intransitive verb',
  AJ: 'Adjective',
  AV: 'Adverb',
  NU: 'Number',
  J: 'Interjection',
  CNJ: 'Conjunction',
  IP: 'Independent pronoun',
  DP: 'Demonstrative pronoun',
  QP: 'Interrogative pronoun',
  RP: 'Reflexive pronoun',
  DN: 'Divine name',
  PN: 'Personal name',
  GN: 'Geographical name',
  TN: 'Temple name',
  SN: 'Settlement name',
  RN: 'Royal name',
  WN: 'Watercourse name',
  MN: 'Month name',
  ON: 'Object name',
  CN: 'Celestial name',
  EN: 'Ethnic name',
  FN: 'Field name',
  LN: 'Line name',
  QN: 'Quarter name',
  AN: 'Agricultural name',
}

export const alignmentTierLabels: Readonly<Record<string, string>> = {
  exact: 'Attinger and ePSD2 agree on the spelling and part of speech',
  homonym: 'Matched to one of several ePSD2 homonyms by meaning',
  compound: 'Matched as a compound',
  'pos-mismatch': 'Same spelling in both, different part of speech',
  'attinger-only': 'Attinger only — no ePSD2 counterpart',
  'epsd2-only': "ePSD2 only — not in Attinger's glossary",
}

export const crossReferenceRelationLabels: Readonly<
  Record<CrossReferenceRelation, string>
> = {
  see: 'see',
  compare: 'cf.',
}

export const aliasRelationLabels: Readonly<Record<AliasRelation, string>> = {
  see: '→',
  equals: '=',
}

export function getPartOfSpeechCode({
  pos,
  attingerPos,
}: {
  pos: string
  attingerPos: string
}): string {
  return pos || attingerPos
}

export function getPartOfSpeechLabel(word: {
  pos: string
  attingerPos: string
}): string {
  const code = getPartOfSpeechCode(word)
  return partOfSpeechLabels[code] ?? code
}

export function getAlignmentLabel(tier: string): string {
  return alignmentTierLabels[tier] ?? tier
}
