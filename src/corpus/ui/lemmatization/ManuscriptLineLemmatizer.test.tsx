import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'

import { whenClicked, clickNth, changeValueByLabel } from 'test-support/utils'
import Lemma from 'transliteration/domain/Lemma'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import {
  createChapter,
  createManuscript,
  types,
  createLine,
  createManuscriptLine,
  Chapter,
} from 'corpus/domain/text'
import { periodModifiers, periods } from 'corpus/domain/period'
import { provenances } from 'corpus/domain/provenance'
import ChapterLemmatization from './ManuscriptLineLemmatizer'
import Word from 'dictionary/domain/Word'
import produce from 'immer'

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
  }
  fragmentService.searchLemma.mockReturnValue(Promise.resolve([word]))
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
        siglumDisambiguator: '1',
        museumNumber: 'BM.X',
        accession: 'X.1',
        periodModifier: periodModifiers.get('Early'),
        period: periods.get('Ur III'),
        provenance: provenances.get('Nippur'),
        type: types.get('School'),
        notes: 'a note',
        references: [],
      }),
    ],
    lines: [
      createLine({
        number: '1',
        reconstruction: 'reconstructed text',
        reconstructionTokens: [
          {
            type: 'AkkadianWord',
            value: 'reconstructed',
          },
          {
            type: 'AkkadianWord',
            value: 'text',
          },
        ],
        isBeginningOfSection: true,
        isSecondLineOfParallelism: true,
        manuscripts: [
          createManuscriptLine({
            manuscriptId: 1,
            labels: ['o', 'iii'],
            number: 'a+1',
            atf: 'kur ra',
            atfTokens: [
              {
                type: 'Word',
                value: 'kur',
                uniqueLemma: [],
                normalized: false,
                language: 'AKKADIAN',
                lemmatizable: true,
                erasure: 'NONE',
              },
              {
                type: 'Word',
                value: 'ra',
                uniqueLemma: [oldWord._id],
                normalized: false,
                language: 'AKKADIAN',
                lemmatizable: true,
                erasure: 'NONE',
                alignment: 1,
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
  await lemmatizeWord()

  expect(onChange).toHaveBeenCalledWith(
    produce(chapter, (draft) => {
      draft.lines[0].manuscripts[0].atfTokens[0].uniqueLemma = [lemma.value]
    })
  )
})

test('Clicking save button calls onSave', async () => {
  await lemmatizeWord()

  await whenClicked(element, 'Save lemmatization')
    .expect(updateLemmatization)
    .toHaveBeenCalledWith()
})

async function lemmatizeWord(): Promise<void> {
  await element.findByText('kur')
  await clickNth(element, 'kur', 0)
  await element.findByLabelText('Lemma')
  changeValueByLabel(element, 'Lemma', 'a')
  await element.findByText(lemma.lemma)
  await clickNth(element, lemma.lemma, 0)
}
