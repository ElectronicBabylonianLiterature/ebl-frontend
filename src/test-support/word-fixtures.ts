import { Factory } from 'fishery'
import Chance from 'chance'
import Word, {
  AmplifiedMeaning,
  Derived,
  Entry,
  Form,
  Logogram,
  OraccWord,
  Vowels,
} from 'dictionary/domain/Word'

const defaultChance = new Chance()

const nonVerbPos = [
  'AJ',
  'AV',
  'N',
  'NU',
  'DP',
  'IP',
  'PP',
  'QP',
  'RP',
  'XP',
  'REL',
  'DET',
  'CNJ',
  'J',
  'MOD',
  'PRP',
  'SBJ',
]

const amplifiedMeanings = [
  'G',
  'Gtn',
  'Gt',
  'D',
  'Dtn',
  'Dt',
  'Dtt',
  'Š',
  'Štn',
  'Št',
  'ŠD',
  'N',
  'Ntn',
  'R',
  'Št2',
  'A.',
  'B.',
  'C.',
  'D.',
]

const homonyms = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

function homonym(chance = defaultChance) {
  return chance.pickone(homonyms)
}

function vowel(chance = defaultChance) {
  return chance.pickone(['i', 'a', 'u', 'e'])
}

function wordArray(chance = defaultChance) {
  return [chance.word(), chance.word()]
}

export const formFactory = Factory.define<Form>(() => ({
  attested: false,
  lemma: wordArray(),
  notes: wordArray(),
}))

export const vowelsFactory = Factory.define<Vowels>(() => ({
  value: [vowel(), vowel()],
  notes: wordArray(),
}))

export const entryFactory = Factory.define<Entry>(() => ({
  meaning: defaultChance.sentence(),
  vowels: vowelsFactory.buildList(2),
}))

export const amplifiedMeaningFactory = Factory.define<AmplifiedMeaning>(() => ({
  key: defaultChance.pickone(amplifiedMeanings),
  entries: entryFactory.buildList(2),
  meaning: defaultChance.sentence(),
  vowels: vowelsFactory.buildList(2),
}))

export const derivedFactory = Factory.define<Derived>(() => ({
  lemma: wordArray(),
  homonym: homonym(),
  notes: wordArray(),
}))

export const logogramFactory = Factory.define<Logogram>(() => ({
  logogram: defaultChance.pickset(
    ['alpha', 'bravo', 'charlie', 'delta', 'echo'],
    2,
  ),
  notes: wordArray(),
}))

export const oraccWordFactory = Factory.define<OraccWord>(() => ({
  lemma: defaultChance.word(),
  guideWord: defaultChance.word(),
}))

class WordFactory extends Factory<Word> {
  homonymI() {
    return this.params({ homonym: 'I' })
  }

  homonymNotI() {
    return this.params({ homonym: defaultChance.pickone(homonyms.slice(1)) })
  }

  verb(roots?: readonly string[]) {
    return this.params({
      pos: ['V'],
      roots: roots ?? ['rrr', 'ttt'],
    })
  }
}

export const wordFactory = WordFactory.define(() => ({
  _id: defaultChance.hash(),
  attested: true,
  lemma: wordArray(),
  legacyLemma: defaultChance.word(),
  homonym: homonym(),
  meaning: defaultChance.sentence(),
  pos: defaultChance.pickset(nonVerbPos, 2),
  forms: formFactory.buildList(2),
  amplifiedMeanings: amplifiedMeaningFactory.buildList(2),
  logograms: logogramFactory.buildList(2),
  derived: [derivedFactory.buildList(2), derivedFactory.buildList(2)],
  derivedFrom: derivedFactory.build(),
  source: '**source**',
  guideWord: defaultChance.word(),
  oraccWords: oraccWordFactory.buildList(2),
  arabicGuideWord: '',
  cdaAddenda: '',
  supplementsAkkadianDictionaries: '',
  origin: '',
  akkadischeGlossareUndIndices: [],
}))
