import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'

import { whenClicked } from 'test-support/utils'
import Lemma from 'transliteration/domain/Lemma'
import {
  createChapter,
  createManuscript,
  createLine,
  createManuscriptLine,
  Chapter,
} from 'corpus/domain/text'
import ChapterLemmatization from './ManuscriptLineLemmatizer'
import Word from 'dictionary/domain/Word'
import produce from 'immer'
import { lemmatizeWord } from 'test-support/lemmatization'

let element: RenderResult
let fragmentService
let wordService
let updateLemmatization: jest.Mock<void, []>
let onChange: jest.Mock<void, [Chapter]>
let chapter: Chapter
let word: Word
let oldWord: Word
let lemma: Lemma

beforeEach(async () => {
  word = await factory.build('word')
  lemma = new Lemma(word)
  oldWord = await factory.build('word')
  updateLemmatization = jest.fn()
  onChange = jest.fn()
  fragmentService = {
    searchLemma: jest.fn(),
    createLemmatization: jest.fn(),
    findSuggestions: jest.fn(),
  }
  fragmentService.searchLemma.mockReturnValue(Promise.resolve([word]))
  fragmentService.findSuggestions.mockReturnValue(Promise.resolve([]))
  wordService = {
    find: jest.fn(),
  }
  wordService.find.mockReturnValue(Promise.resolve(oldWord))
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
                enclosureType: [],
              },
            ],
          }),
        ],
      }),
    ],
  })
  element = render(
    <ChapterLemmatization
      chapter={chapter}
      onChange={onChange}
      onSave={updateLemmatization}
      disabled={false}
      fragmentService={fragmentService}
      wordService={wordService}
    />
  )
  await element.findByText(chapter.getSiglum(chapter.lines[0].manuscripts[0]))
})

test('onChange is called on updates', async () => {
  await lemmatizeWord(element, lemma)

  expect(onChange).toHaveBeenCalledWith(
    produce(chapter, (draft) => {
      draft.lines[0].manuscripts[0].atfTokens[0].uniqueLemma = [lemma.value]
    })
  )
})

test('Clicking save button calls onSave', async () => {
  await lemmatizeWord(element, lemma)

  await whenClicked(element, 'Save lemmatization')
    .expect(updateLemmatization)
    .toHaveBeenCalledWith()
})
