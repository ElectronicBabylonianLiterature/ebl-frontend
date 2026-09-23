import { Factory } from 'fishery'
import Chance from 'chance'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { TextId } from 'transliteration/domain/text-id'
import { periods } from 'common/utils/period'
import { chapterFixtureChance } from 'test-support/chapter-fixture-chance'

const maxRoman = 3999

export const textIdFactory = Factory.define<TextId, { chance: Chance.Chance }>(
  ({ transientParams }) => {
    const chance = transientParams.chance ?? chapterFixtureChance
    return {
      genre: chance.pickone(['L', 'D']),
      category: chance.integer({ min: 0, max: maxRoman }),
      index: chance.integer({ min: 0 }),
    }
  },
)

export const chapterIdFactory = Factory.define<
  ChapterId,
  { chance: Chance.Chance }
>(({ transientParams }) => {
  const chance = transientParams.chance ?? chapterFixtureChance
  return {
    textId: textIdFactory.build({}, { transient: { chance } }),
    stage: chance.pickone([...periods]).name,
    name: chance.sentence(),
  }
})
