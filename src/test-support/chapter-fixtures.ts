import { Factory } from 'fishery'
import Chance from 'chance'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { ChapterDisplayDto } from 'corpus/application/dtos'
import { chapterFixtureChance } from 'test-support/chapter-fixture-chance'
import {
  chapterIdFactory,
  textIdFactory,
} from 'test-support/chapter-id-fixtures'
import {
  lineDisplayDtoFactory,
  lineDisplayFactory,
} from 'test-support/line-display-fixtures'

export { textIdFactory, chapterIdFactory }
export { lineDisplayDtoFactory, lineDisplayFactory }

export const chapterDisplayDtoFactory = Factory.define<
  ChapterDisplayDto,
  { chance: Chance.Chance }
>(({ transientParams }) => {
  const chance = transientParams.chance ?? chapterFixtureChance
  return {
    id: chapterIdFactory.build({}, { transient: { chance } }),
    textHasDoi: chance.bool(),
    textName: chance.sentence(),
    isSingleStage: chance.bool(),
    title: [
      {
        text: chance.sentence(),
        type: 'StringPart',
      },
    ],
    lines: lineDisplayDtoFactory.buildList(2, {}, { transient: { chance } }),
    record: { authors: [], translators: [], publicationDate: '' },
    atf: chance.sentence(),
  }
})

class ChapterDisplayFactory extends Factory<
  ChapterDisplay,
  { chance: Chance.Chance }
> {
  published() {
    return this.params({
      record: {
        authors: [
          {
            name: 'Test',
            prefix: 'A.',
            role: 'EDITOR',
            orcidNumber: '',
          },
        ],
        translators: [],
        publicationDate: '2020-02-25',
      },
    })
  }
}

export const chapterDisplayFactory = ChapterDisplayFactory.define(
  ({ transientParams }) => {
    const chance = transientParams.chance ?? chapterFixtureChance
    return new ChapterDisplay(
      chapterIdFactory.build({}, { transient: { chance } }),
      chance.bool(),
      chance.sentence(),
      chance.bool(),
      [
        {
          text: chance.sentence(),
          type: 'StringPart',
        },
      ],
      [
        lineDisplayFactory.build(
          { originalIndex: 0 },
          { transient: { chance } },
        ),
        lineDisplayFactory.build(
          { originalIndex: 1 },
          { transient: { chance } },
        ),
      ],
      { authors: [], translators: [], publicationDate: '' },
      chance.sentence(),
    )
  },
)
