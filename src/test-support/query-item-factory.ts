import { Factory } from 'fishery'
import Chance from 'chance'
import { QueryItem } from 'query/QueryResult'

const defaultChance = new Chance()

export const queryItemFactory = Factory.define<QueryItem>(() => ({
  museumNumber: {
    prefix: `${defaultChance.word()}`,
    number: `${defaultChance.word()}`,
    suffix: '',
  },
  matchingLines: [],
  matchCount: 0,
}))
