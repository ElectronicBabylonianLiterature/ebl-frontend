import { Factory } from 'fishery'
import Chance from 'chance'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import {
  Rendering,
  SignEntry,
  WordLink,
} from 'sumerian-dictionary/domain/SumerianWordParts'
import {
  SumerianDictionaryStatistics,
  SumerianWordSummary,
} from 'sumerian-dictionary/domain/SumerianWordSummary'

const chance = new Chance('sumerian-dictionary-fixtures')

function sumerianId(): string {
  return `o${chance.string({ length: 7, pool: '0123456789' })}`
}

export const wordLinkFactory = Factory.define<WordLink>(() => ({
  id: sumerianId(),
  citationForm: chance.word(),
  homonym: '',
  guideWord: chance.word(),
}))

export const renderingFactory = Factory.define<Rendering>(() => ({
  spelling: chance.word(),
  source: 'attinger',
  kind: 'key',
  cuneiform: ['𒈗'],
  complete: true,
  unrendered: [],
  printed: '',
  signLists: ['ebl'],
  knownWrongCharacters: [],
}))

export const signEntryFactory = Factory.define<SignEntry>(() => ({
  reading: chance.word(),
  name: chance.word().toUpperCase(),
  utf8: '𒈗',
  ambiguous: false,
  sources: [],
  signList: 'ebl',
  characterList: '',
  knownWrongCharacter: false,
  determinative: false,
  unresolved: false,
  formOf: [],
}))

export const sumerianWordFactory = Factory.define<SumerianWord>(() => {
  const citationForm = chance.word()
  return {
    id: sumerianId(),
    citationForm,
    lemma: [citationForm],
    homonym: '',
    guideWord: '',
    pos: '',
    attingerPos: '',
    language: 'SUMERIAN',
    atf: '',
    uncertain: false,
    truncated: false,
    stems: [],
    determinatives: [],
    caseFrame: [],
    emesal: [],
    attingerSenses: [],
    epsd2Senses: [],
    attingerForms: [],
    epsd2Forms: [],
    signs: [],
    renderings: [],
    head: null,
    compounds: [],
    nameCompounds: [],
    crossReferences: [],
    aliases: [],
    akkadianEquivalents: [],
    citations: [],
    attestation: { count: 0, periods: [] },
    sources: { attinger: null, epsd2: null },
    match: {
      tier: '',
      method: '',
      spelling: '',
      candidateCount: 0,
      curated: false,
      curatedOid: '',
      curatedStatus: '',
      oidStatus: '',
      review: [],
    },
  }
})

export const sumerianWordSummaryFactory = Factory.define<SumerianWordSummary>(
  () => ({
    id: sumerianId(),
    citationForm: chance.word(),
    homonym: '',
    guideWord: '',
    pos: '',
    attingerPos: '',
    language: 'SUMERIAN',
    cuneiform: '',
    frenchSenses: [],
    englishSenses: [],
    hasAttinger: false,
    hasEpsd2: false,
    epsd2FormCount: 0,
    akkadianCount: 0,
    citationCount: 0,
    compoundCount: 0,
    crossReferenceCount: 0,
    hasEmesal: false,
    attestationCount: 0,
    matchedAlias: '',
  }),
)

export const sumerianStatisticsFactory =
  Factory.define<SumerianDictionaryStatistics>(() => ({
    lemmas: 23903,
    attinger: 10356,
    aligned: 4751,
    epsd2Only: 13547,
    properNouns: 6178,
    withAkkadian: 2676,
  }))
