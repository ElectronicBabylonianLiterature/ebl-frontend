import { NAMED_ENTITY_TAGS } from 'dictionary/domain/namedEntityTags'

export const VERB_POSITION_OF_SPEECH = 'V'

export const POSITIONS_OF_SPEECH: { readonly [code: string]: string } = {
  AJ: 'adjective',
  AV: 'adverb',
  N: 'noun',
  NU: 'number',
  [VERB_POSITION_OF_SPEECH]: 'verb',
  DP: 'demonstrative pronoun',
  IP: 'independent/anaphoric pronoun',
  PP: 'possessive pronoun',
  QP: 'interrogative pronoun',
  RP: 'reflexive/reciprocal pronoun',
  XP: 'indefinite pronoun',
  REL: 'relative pronoun',
  DET: 'determinative pronoun',
  CNJ: 'conjunction',
  J: 'interjection',
  MOD: 'modal, negative, or conditional particle',
  PRP: 'preposition',
  SBJ: 'subjunction',
}

export function partOfSpeechLabel(code: string): string | null {
  return NAMED_ENTITY_TAGS[code] ?? POSITIONS_OF_SPEECH[code] ?? null
}
