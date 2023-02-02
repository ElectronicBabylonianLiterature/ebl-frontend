import { Factory } from 'fishery'
import Chance from 'chance'
import { QueryItem } from 'query/QueryResult'

const defaultChance = new Chance()

export const queryItemFactory = Factory.define<QueryItem>(
  ({ associations, sequence }) => ({
    museumNumber:
      associations.museumNumber ?? `${defaultChance.word()}.${sequence}`,
    matchingLines: associations.matchingLines ?? [],
    matchCount: associations.matchCount ?? 0,
  })
)
