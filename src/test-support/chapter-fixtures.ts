import { Factory } from 'fishery'
import Chance from 'chance'
import { ChapterDisplay, ChapterId, LineDisplay } from 'corpus/domain/chapter'
import { TextId } from 'corpus/domain/text'
import { periods } from 'corpus/domain/period'
import _ from 'lodash'
import { reconstructionTokens } from './test-corpus-text'
import { LineNumber } from 'transliteration/domain/line-number'
import TranslationLine, {
  Extent,
} from 'transliteration/domain/translation-line'
import { MarkupPart } from 'transliteration/domain/markup'
import { Token } from 'transliteration/domain/token'

const defaultChance = new Chance()
const maxRoman = 3999

export const textIdFactory = Factory.define<TextId, { chance: Chance.Chance }>(
  ({ transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    return {
      genre: chance.pickone(['L', 'D', 'Lex']),
      category: chance.integer({ min: 0, max: maxRoman }),
      index: chance.integer({ min: 0 }),
    }
  }
)

export const chapterIdFactory = Factory.define<
  ChapterId,
  { chance: Chance.Chance }
>(({ transientParams }) => {
  const chance = transientParams.chance ?? defaultChance
  return {
    textId: textIdFactory.build({}, { transient: { chance } }),
    stage: chance.pickone([...periods]).name,
    name: chance.sentence(),
  }
})

export const lineNumberFactory = Factory.define<LineNumber>(({ sequence }) => ({
  number: sequence,
  hasPrime: false,
  prefixModifier: null,
  suffixModifier: null,
  type: 'LineNumber',
}))

type LineDisplayDto = Pick<
  LineDisplay,
  | 'number'
  | 'isSecondLineOfParallelism'
  | 'isBeginningOfSection'
  | 'intertext'
  | 'reconstruction'
> & {
  translation: {
    language: string
    extent: Extent | null
    parts: MarkupPart[]
    content: Token[]
  }[]
}

export const lineDisplayDtoFactory = Factory.define<
  LineDisplayDto,
  { chance: Chance.Chance }
>(({ transientParams }) => {
  const chance = transientParams.chance ?? defaultChance
  return {
    number: lineNumberFactory.build(),
    isSecondLineOfParallelism: chance.bool(),
    isBeginningOfSection: chance.bool(),
    intertext: [
      {
        text: chance.sentence(),
        type: 'StringPart',
      },
    ],
    reconstruction: _.cloneDeep(reconstructionTokens),
    translation: [
      {
        language: 'en',
        extent: null,
        parts: [
          {
            text: chance.sentence(),
            type: 'StringPart',
          },
        ],
        content: [],
      },
    ],
  }
})

export const lineDisplayFactory = Factory.define<
  LineDisplay,
  { chance: Chance.Chance }
>(({ transientParams }) => {
  const chance = transientParams.chance ?? defaultChance
  return {
    number: lineNumberFactory.build(),
    isSecondLineOfParallelism: chance.bool(),
    isBeginningOfSection: chance.bool(),
    intertext: [
      {
        text: chance.sentence(),
        type: 'StringPart',
      },
    ],
    reconstruction: _.cloneDeep(reconstructionTokens),
    translation: [
      new TranslationLine({
        language: 'en',
        extent: null,
        parts: [
          {
            text: chance.sentence(),
            type: 'StringPart',
          },
        ],
        content: [],
      }),
    ],
  }
})

type ChapterDisplayDto = Pick<
  ChapterDisplay,
  'id' | 'textName' | 'isSingleStage' | 'title' | 'record'
> & { lines: LineDisplayDto[] }

export const chapterDisplayDtoFactory = Factory.define<
  ChapterDisplayDto,
  { chance: Chance.Chance }
>(({ transientParams }) => {
  const chance = transientParams.chance ?? defaultChance
  return {
    id: chapterIdFactory.build({}, { transient: { chance } }),
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
    const chance = transientParams.chance ?? defaultChance
    return new ChapterDisplay(
      chapterIdFactory.build({}, { transient: { chance } }),
      chance.sentence(),
      chance.bool(),
      [
        {
          text: chance.sentence(),
          type: 'StringPart',
        },
      ],
      lineDisplayFactory.buildList(2, {}, { transient: { chance } }),
      { authors: [], translators: [], publicationDate: '' }
    )
  }
)
