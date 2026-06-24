import { Factory } from 'fishery'
import Chance from 'chance'
import {
  RealiaEntry,
  AfoRegisterEntry,
  ReallexikonEntry,
  RealiaCrossReference,
} from 'realia/domain/RealiaEntry'

const chance = new Chance()

export const afoRegisterEntryFactory = Factory.define<AfoRegisterEntry>(() => ({
  mainWord: chance.word(),
  note: chance.sentence(),
  AfO: `AfO ${chance.integer({ min: 10, max: 52 })} (${chance.year()}), ${chance.integer(
    { min: 1, max: 700 },
  )}`,
  reference: `${chance.last()}, ${chance.word().toUpperCase()} ${chance.integer(
    {
      min: 1,
      max: 20,
    },
  )}, ${chance.integer({ min: 1, max: 400 })}ff.`,
  crossReference: '',
}))

export const reallexikonEntryFactory = Factory.define<ReallexikonEntry>(() => ({
  id: chance.guid(),
  title: chance.sentence({ words: 4 }),
  reference: null,
}))

export const realiaCrossReferenceFactory = Factory.define<RealiaCrossReference>(
  () => ({
    id: `realia_${chance.integer({ min: 100000, max: 999999 })}`,
    lemma: chance.word(),
  }),
)

export const realiaEntryFactory = Factory.define<RealiaEntry>(() => ({
  id: chance.word(),
  relatedTerms: [chance.word(), chance.word()],
  type: ['Divine names'],
  wikidataId: [],
  afoRegister: afoRegisterEntryFactory.buildList(1),
  reallexikon: reallexikonEntryFactory.buildList(1),
  crossReferences: [],
  afoCrossReferences: [],
  references: [],
}))
