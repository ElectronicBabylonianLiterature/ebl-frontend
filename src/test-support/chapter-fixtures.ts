import { Factory } from 'fishery'
import Chance from 'chance'
import { ChapterDisplay, LineDisplay } from 'corpus/domain/chapter'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { TextId } from 'transliteration/domain/text-id'
import { periods } from 'corpus/domain/period'
import _ from 'lodash'
import { reconstructionTokens } from './test-corpus-text'
import { LineNumber } from 'transliteration/domain/line-number'
import { ChapterDisplayDto, LineDisplayDto } from 'corpus/application/dtos'
import TranslationLine from 'transliteration/domain/translation-line'
import { NoteLine } from 'transliteration/domain/note-line'
import {
  ParallelComposition,
  parallelLinePrefix,
} from 'transliteration/domain/parallel-line'

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

export const lineDisplayDtoFactory = Factory.define<
  LineDisplayDto,
  { chance: Chance.Chance }
>(({ transientParams }) => {
  const chance = transientParams.chance ?? defaultChance
  return {
    number: lineNumberFactory.build(),
    isSecondLineOfParallelism: chance.bool(),
    isBeginningOfSection: chance.bool(),
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
      {
        language: 'de',
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
    variants: [
      {
        intertext: [
          {
            text: chance.sentence(),
            type: 'StringPart',
          },
        ],
        reconstruction: _.cloneDeep(reconstructionTokens),
        note: {
          prefix: '#note: ',
          content: [],
          parts: [
            {
              text: chance.sentence(),
              type: 'StringPart',
            },
          ],
        },
        manuscripts: [],
        parallelLines: [
          {
            type: 'ParallelComposition',
            prefix: parallelLinePrefix,
            hasCf: false,
            name: 'A Composition',
            lineNumber: {
              prefixModifier: '',
              number: 2,
              hasPrime: false,
              suffixModifier: '',
            },
            content: [],
          },
        ],
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
      new TranslationLine({
        language: 'de',
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

    variants: [
      {
        intertext: [
          {
            text: chance.sentence(),
            type: 'StringPart',
          },
        ],
        reconstruction: _.cloneDeep(reconstructionTokens),
        manuscripts: [],
        note: new NoteLine({
          content: [],
          parts: [
            {
              text: chance.sentence(),
              type: 'StringPart',
            },
          ],
        }),
        parallelLines: [
          new ParallelComposition({
            hasCf: false,
            name: 'A Composition',
            lineNumber: {
              prefixModifier: '',
              number: 2,
              hasPrime: false,
              suffixModifier: '',
            },
            content: [],
          }),
        ],
      },
    ],
  }
})

export const chapterDisplayDtoFactory = Factory.define<
  ChapterDisplayDto,
  { chance: Chance.Chance }
>(({ transientParams }) => {
  const chance = transientParams.chance ?? defaultChance
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
      chance.bool(),
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
