import { Factory } from 'fishery'
import Chance from 'chance'
import {
  RealiaEntry,
  AfoRegisterEntry,
  ReallexikonEntry,
} from 'realia/domain/RealiaEntry'

const chance = new Chance()

export const afoRegisterEntryFactory = Factory.define<AfoRegisterEntry>(() => ({
  mainWord: chance.word(),
  note: chance.sentence(),
  AfO: `${chance.integer({ min: 10, max: 52 })}`,
  reference: `(${chance.year()}) ${chance.integer({ min: 1, max: 700 })}`,
  crossReference: '',
}))

export const reallexikonEntryFactory = Factory.define<ReallexikonEntry>(() => ({
  id: chance.guid(),
  title: chance.sentence({ words: 4 }),
  content: chance.word(),
  reference: null,
}))

export const realiaEntryFactory = Factory.define<RealiaEntry>(() => ({
  id: chance.word(),
  relatedTerms: [chance.word(), chance.word()],
  type: ['OBJECT_NAME'],
  wikidataId: [],
  afoRegister: afoRegisterEntryFactory.buildList(1),
  reallexikon: reallexikonEntryFactory.build(),
  references: [],
}))
