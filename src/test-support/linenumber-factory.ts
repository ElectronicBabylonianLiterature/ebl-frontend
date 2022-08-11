import { Factory } from 'fishery'
import Chance from 'chance'
import { LineNumber, OldLineNumber } from 'transliteration/domain/line-number'
import { referenceFactory } from './bibliography-fixtures'

const defaultChance = new Chance()

export const lineNumberFactory = Factory.define<LineNumber>(({ sequence }) => ({
  number: sequence,
  hasPrime: false,
  prefixModifier: null,
  suffixModifier: null,
  type: 'LineNumber',
}))

export const oldLineNumberFactory = Factory.define<
  OldLineNumber,
  { chance: Chance.Chance }
>(({ associations, transientParams }) => {
  const chance = transientParams.chance ?? defaultChance
  return {
    number: associations.number ?? chance.string(),
    reference: associations.reference ?? referenceFactory.build(),
  }
})
