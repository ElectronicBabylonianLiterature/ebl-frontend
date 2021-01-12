import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'
import produce, { castDraft } from 'immer'

import { whenClicked } from 'test-support/utils'
import Lemma from 'transliteration/domain/Lemma'
import { createManuscriptLine, Chapter } from 'corpus/domain/text'
import Word from 'dictionary/domain/Word'
import { lemmatizeWord } from 'test-support/lemmatization'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import { ChapterLemmatization } from 'corpus/domain/lemmatization'
import ChapterLemmatizer from './ChapterLemmatization'
import { text } from 'test-support/test-corpus-text'

let element: RenderResult
let fragmentService
let textService
let updateLemmatization: jest.Mock<void, [ChapterLemmatization]>
let chapter: Chapter
let word: Word
let oldWord: Word
let lemma: Lemma
let lemmatization: ChapterLemmatization

beforeEach(async () => {
  word = await factory.build('word')
  lemma = new Lemma(word)
  oldWord = await factory.build('word')
  updateLemmatization = jest.fn()
  fragmentService = {
    searchLemma: jest.fn(),
    createLemmatization: jest.fn(),
    findSuggestions: jest.fn(),
  }
  fragmentService.searchLemma.mockReturnValue(Promise.resolve([word]))
  textService = {
    findSuggestions: jest.fn(),
  }
  lemmatization = [
    [
      [
        [
          new LemmatizationToken('%n', false, null, null),
          new LemmatizationToken('kur-kur', true, [], []),
        ],
        [
          [
            new LemmatizationToken('kur', true, [], []),
            new LemmatizationToken('ra', true, [new Lemma(oldWord)], []),
          ],
        ],
      ],
    ],
  ]
  textService.findSuggestions.mockReturnValue(Promise.resolve(lemmatization))
  chapter = produce(text.chapters[0], (draft) => {
    draft.lines[0].variants[0].manuscripts = [
      castDraft(
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
              alignment: 1,
              variant: null,
            },
            {
              type: 'Word',
              value: 'ra',
              parts: [],
              cleanValue: 'ra',
              uniqueLemma: [oldWord._id],
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
                uniqueLemma: [oldWord._id],
                normalized: false,
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
        })
      ),
    ]
  })

  element = render(
    <ChapterLemmatizer
      chapter={chapter}
      onSave={updateLemmatization}
      disabled={false}
      fragmentService={fragmentService}
      textService={textService}
    />
  )
  await element.findByText(
    chapter.getSiglum(chapter.lines[0].variants[0].manuscripts[0])
  )
})

test('Lemmatize manuscript', async () => {
  await lemmatizeWord(element, 'kur', lemma)

  await whenClicked(element, 'Save lemmatization')
    .expect(updateLemmatization)
    .toHaveBeenCalledWith(
      produce(lemmatization, (draft) => {
        draft[0][0][1][0][0] = castDraft(
          new LemmatizationToken('kur', true, [lemma], [])
        )
      })
    )
})

test('Lemmatize reconstruction', async () => {
  await lemmatizeWord(element, 'kur-kur', lemma)

  await whenClicked(element, 'Save lemmatization')
    .expect(updateLemmatization)
    .toHaveBeenCalledWith(
      produce(lemmatization, (draft) => {
        draft[0][0][0][1] = castDraft(
          new LemmatizationToken('kur-kur', true, [lemma], [])
        )
        draft[0][0][1][0][0] = castDraft(
          new LemmatizationToken('kur', true, [lemma], [], true)
        )
      })
    )
})
