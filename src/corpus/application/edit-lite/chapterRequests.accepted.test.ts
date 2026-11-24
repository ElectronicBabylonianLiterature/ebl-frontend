import { toChapterUpdate } from 'corpus/application/edit-lite/chapterRequests'
import { setAlignmentToken } from 'corpus/domain/alignment'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { createLineAlignment, Line } from 'corpus/domain/line'
import {
  buildAnnotatedLines,
  buildDictionaryWord,
  buildLineLemmatization,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import Lemma from 'transliteration/domain/Lemma'

const [line]: readonly Line[] = buildAnnotatedLines(1)
const lemma = new Lemma(buildDictionaryWord('eliš'))

test('the body of an alignment save leaves out the suggestions that were not accepted', () => {
  const [[firstManuscript, secondManuscript]] = createLineAlignment(line)
  const [first] = firstManuscript.alignment
  const alignment = [
    [
      setAlignmentToken(firstManuscript, 0, { ...first, suggested: false }),
      secondManuscript,
    ],
  ]

  expect(
    toChapterUpdate({ type: 'saveAlignment', index: 0, alignment }),
  ).toEqual({
    endpoint: 'lines/0/alignment',
    body: {
      alignment: [
        [
          {
            alignment: [
              {
                value: 'e-nu-ma',
                alignment: 1,
                variant: '',
                type: '',
                language: '',
              },
              {
                value: 'e-liš',
                alignment: null,
                variant: '',
                type: '',
                language: '',
              },
            ],
            omittedWords: [],
          },
          {
            alignment: [
              { value: '[x' },
              { value: 'x' },
              { value: 'x]' },
              {
                value: 'e-li-iš',
                alignment: null,
                variant: '',
                type: '',
                language: '',
              },
            ],
            omittedWords: [],
          },
        ],
      ],
    },
  })
})

test('the body of a lemmatization save leaves out the suggestions that were not accepted', () => {
  const [[reconstruction, manuscripts]] = buildLineLemmatization(line)
  const lemmatization: LineLemmatization[] = [
    [
      [
        reconstruction[0],
        reconstruction[1].setUniqueLemma([lemma]),
        reconstruction[2],
        reconstruction[3].setUniqueLemma([lemma], true),
      ],
      [
        [manuscripts[0][0], manuscripts[0][1].setUniqueLemma([lemma], true)],
        [
          ...manuscripts[1].slice(0, 3),
          manuscripts[1][3].setUniqueLemma([lemma]),
        ],
      ],
    ],
  ]

  expect(
    toChapterUpdate({ type: 'saveLemmatization', index: 4, lemmatization }),
  ).toEqual({
    endpoint: 'lines/4/lemmatization',
    body: {
      lemmatization: [
        {
          reconstruction: [
            { value: '%n' },
            { value: 'enūma', uniqueLemma: ['eliš I'] },
            { value: '|' },
            { value: 'eliš', uniqueLemma: [] },
          ],
          manuscripts: [
            [
              { value: 'e-nu-ma', uniqueLemma: [] },
              { value: 'e-liš', uniqueLemma: [] },
            ],
            [
              { value: '[x' },
              { value: 'x' },
              { value: 'x]' },
              { value: 'e-li-iš', uniqueLemma: ['eliš I'] },
            ],
          ],
        },
      ],
    },
  })
})
