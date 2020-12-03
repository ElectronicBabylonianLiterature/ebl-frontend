import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { whenClicked, clickNth, changeValueByLabel } from 'test-support/utils'
import {
  createChapter,
  createManuscript,
  createLine,
  createManuscriptLine,
  Chapter,
} from 'corpus/domain/text'
import { Alignment } from 'corpus/domain/alignment'
import ChapterAlignment from './ChapterAlignment'

let element: RenderResult
let onSave: jest.Mock<void, [Alignment]>
let chapter: Chapter

beforeEach(async () => {
  onSave = jest.fn()
  chapter = createChapter({
    classification: 'Ancient',
    stage: 'Old Babylonian',
    version: 'A',
    name: 'The Only Chapter',
    order: 1,
    manuscripts: [
      createManuscript({
        id: 1,
      }),
    ],
    lines: [
      createLine({
        reconstruction: '%n kur-kur',
        reconstructionTokens: [
          {
            value: '%n',
            cleanValue: '%n',
            enclosureType: [],
            erasure: 'NONE',
            language: 'AKKADIAN',
            normalized: true,
            type: 'LanguageShift',
          },
          {
            value: 'kur-kur',
            cleanValue: 'kur-kur',
            enclosureType: [],
            erasure: 'NONE',
            lemmatizable: true,
            alignment: null,
            variant: null,
            uniqueLemma: [],
            normalized: true,
            language: 'AKKADIAN',
            parts: [
              {
                value: 'kur-kur',
                cleanValue: 'kur-kur',
                enclosureType: [],
                erasure: 'NONE',
                type: 'ValueToken',
              },
            ],
            modifiers: [],
            type: 'AkkadianWord',
          },
        ],
        manuscripts: [
          createManuscriptLine({
            manuscriptId: 1,
            number: '1',
            atf: 'kur ra',
            atfTokens: [
              {
                type: 'Word',
                value: 'kur',
                parts: [],
                cleanValue: 'kur',
                uniqueLemma: [],
                normalized: false,
                language: 'AKKADIAN',
                lemmatizable: true,
                erasure: 'NONE',
                enclosureType: [],
                alignment: null,
                variant: null,
              },
              {
                type: 'Word',
                value: 'ra',
                parts: [],
                cleanValue: 'ra',
                uniqueLemma: [],
                normalized: false,
                language: 'AKKADIAN',
                lemmatizable: true,
                erasure: 'NONE',
                alignment: 1,
                variant: {
                  type: 'Word',
                  value: 'ra',
                  parts: [],
                  cleanValue: 'ra',
                  uniqueLemma: [],
                  normalized: true,
                  language: 'AKKADIAN',
                  lemmatizable: true,
                  erasure: 'NONE',
                  alignment: null,
                  variant: null,
                  enclosureType: [],
                },
                enclosureType: [],
              },
            ],
          }),
        ],
      }),
    ],
  })
  element = render(
    <ChapterAlignment chapter={chapter} onSave={onSave} disabled={false} />
  )
  await element.findByText(chapter.getSiglum(chapter.lines[0].manuscripts[0]))
})

test('Align word', async () => {
  const expected: Alignment = [
    [
      [
        {
          value: 'kur',
          alignment: 1,
          variant: '',
          language: 'AKKADIAN',
          isNormalized: true,
        },
        {
          value: 'ra',
          alignment: 1,
          variant: 'ra',
          language: 'AKKADIAN',
          isNormalized: true,
        },
      ],
    ],
  ]

  await element.findByText('kur')
  clickNth(element, 'kur', 0)
  changeValueByLabel(element, 'Ideal word', '1')

  await whenClicked(element, 'Save alignment')
    .expect(onSave)
    .toHaveBeenCalledWith(expected)
})
