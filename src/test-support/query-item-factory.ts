import { Factory } from 'fishery'
import Chance from 'chance'
import { CorpusQueryItem, QueryItem } from 'query/QueryResult'
import { periods } from 'common/period'
import { textIdFactory } from './chapter-fixtures'

const defaultChance = new Chance()

export const queryItemFactory = Factory.define<QueryItem>(
  ({ associations, sequence }) => ({
    museumNumber:
      associations.museumNumber ?? `${defaultChance.word()}.${sequence}`,
    matchingLines: associations.matchingLines ?? [],
    matchCount: associations.matchCount ?? 0,
  }),
)

export const corpusQueryItemFactory = Factory.define<CorpusQueryItem>(
  ({ associations, sequence }) => ({
    textId: associations.textId ?? textIdFactory.build(),
    lines: associations.lines ?? [],
    variants: associations.variants ?? [],
    name: associations.name ?? defaultChance.sentence(),
    stage: associations.stage ?? defaultChance.pickone([...periods]).name,
    matchCount: associations.matchCount ?? 0,
  }),
)
