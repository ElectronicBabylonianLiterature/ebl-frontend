import { chapter } from 'test-support/test-corpus-text'
import { ChapterAlignment } from 'corpus/domain/alignment'
import { createLine, createManuscriptLine } from 'corpus/domain/line'
import { createChapter, createText } from 'corpus/domain/text'
import { textIdToString } from 'transliteration/domain/text-id'
import { Manuscript } from 'corpus/domain/manuscript'

import {
  manuscriptConfig,
  manuscrpitLineConfig,
  lineConfig,
  stage,
  name,
  chapterConfig,
  textConfig,
  testProperties,
} from 'corpus/domain/text.testSupport'

test.each([
  [{ genre: 'L', category: 0, index: 2 }, '0.2'],
  [{ genre: 'D', category: 1, index: 0 }, 'I.0'],
])('textIdtoString', (id, expected) => {
  expect(textIdToString(id)).toEqual(expected)
})

describe('Text', () => {
  testProperties(textConfig, createText)

  test('id', () => {
    expect(createText(textConfig).id).toEqual({
      genre: textConfig.genre,
      category: textConfig.category,
      index: textConfig.index,
    })
  })

  test.each([
    [[], false],
    [[{ stage: stage, name: name, title: [], uncertainFragments: [] }], false],
    [
      [
        { stage: stage, name: name, title: [], uncertainFragments: [] },
        { stage: stage, name: name, title: [], uncertainFragments: [] },
      ],
      false,
    ],
    [
      [
        {
          stage: 'Old Assyrian',
          name: name,
          title: [],
          uncertainFragments: [],
        },
        {
          stage: 'Neo Babylonian',
          name: name,
          title: [],
          uncertainFragments: [],
        },
      ],
      true,
    ],
  ])('hasMultipleStages %o', (chapters, expected) => {
    expect(createText({ chapters }).hasMultipleStages).toEqual(expected)
  })
})

describe('Chapter', () => {
  testProperties(chapterConfig, createChapter)

  test('alignment', () => {
    expect(chapter.alignment).toEqual(
      new ChapterAlignment([
        [
          [
            {
              alignment: [
                {
                  value: 'kur',
                  alignment: null,
                  variant: null,
                  isAlignable: true,
                  suggested: false,
                },
                {
                  value: 'ra',
                  alignment: 1,
                  variant: {
                    value: 'ra',
                    type: 'Word',
                    language: 'AKKADIAN',
                  },
                  isAlignable: true,
                  suggested: false,
                },
                {
                  value: '...',
                  alignment: null,
                  variant: null,
                  isAlignable: false,
                  suggested: false,
                },
              ],
              omittedWords: [],
            },
          ],
        ],
      ]),
    )
  })
})

describe('Manuscript', () => {
  testProperties(manuscriptConfig, () => new Manuscript(manuscriptConfig))
})

describe('Manuscript line', () => {
  testProperties(manuscrpitLineConfig, createManuscriptLine)
})

describe('Line', () => {
  testProperties(lineConfig, createLine)
})
