import { Factory } from 'fishery'
import Chance from 'chance'
import _ from 'lodash'
import { LineDisplay } from 'corpus/domain/chapter'
import { LineDisplayDto } from 'corpus/application/dtos'
import TranslationLine from 'transliteration/domain/translation-line'
import { NoteLine } from 'transliteration/domain/note-line'
import {
  ParallelComposition,
  parallelLinePrefix,
} from 'transliteration/domain/parallel-line'
import { reconstructionTokens } from 'test-support/test-corpus-text'
import { lineNumberFactory } from 'test-support/linenumber-factory'
import { chapterFixtureChance } from 'test-support/chapter-fixture-chance'

export const lineDisplayDtoFactory = Factory.define<
  LineDisplayDto,
  { chance: Chance.Chance }
>(({ associations, sequence, transientParams }) => {
  const chance = transientParams.chance ?? chapterFixtureChance
  return {
    number: lineNumberFactory.build(),
    originalIndex: associations.originalIndex ?? sequence,
    oldLineNumbers: associations.oldLineNumbers ?? [],
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
        originalIndex: 0,
        isPrimaryVariant: true,
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
>(({ associations, sequence, transientParams }) => {
  const chance = transientParams.chance ?? chapterFixtureChance
  return {
    number: lineNumberFactory.build(),
    originalIndex: associations.originalIndex ?? sequence,
    oldLineNumbers: associations.oldLineNumbers ?? [],
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
        originalIndex: 0,
        isPrimaryVariant: true,
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
