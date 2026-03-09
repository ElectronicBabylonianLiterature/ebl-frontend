import React from 'react'
import { render, screen } from '@testing-library/react'
import { Promise } from 'bluebird'
import { produce, castDraft } from 'immer'

import { whenClicked } from 'test-support/utils'
import Lemma from 'transliteration/domain/Lemma'
import { createManuscriptLine } from 'corpus/domain/line'
import { Chapter } from 'corpus/domain/chapter'
import Word from 'dictionary/domain/Word'
import { lemmatizeWord } from 'test-support/lemmatization'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import { ChapterLemmatization } from 'corpus/domain/lemmatization'
import ChapterLemmatizer from './ChapterLemmatization'
import { chapter as chapter_ } from 'test-support/test-corpus-text'
import { wordFactory } from 'test-support/word-fixtures'

let fragmentService
let textService
let updateLemmatization: jest.Mock<void, [ChapterLemmatization]>
let chapter: Chapter
let word: Word
let oldWord: Word
let lemma: Lemma
let lemmatization: ChapterLemmatization

const setup = async () => {
  word = wordFactory.build()
  lemma = new Lemma(word)
  oldWord = wordFactory.build()
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
  chapter = produce(chapter_, (draft) => {
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
              alignable: true,
              erasure: 'NONE',
              enclosureType: [],
              alignment: 1,
              variant: null,
              hasVariantAlignment: false,
              hasOmittedAlignment: false,
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
              alignable: true,
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
                alignable: true,
                erasure: 'NONE',
                alignment: null,
                variant: null,
                enclosureType: [],
                hasVariantAlignment: false,
                hasOmittedAlignment: false,
              },
              enclosureType: [],
              hasVariantAlignment: false,
              hasOmittedAlignment: false,
            },
          ],
        }),
      ),
    ]
  })

  render(
    <ChapterLemmatizer
      chapter={chapter}
      onSave={updateLemmatization}
      disabled={false}
      fragmentService={fragmentService}
      textService={textService}
    />,
  )
  await screen.findByText(
    chapter.getSiglum(chapter.lines[0].variants[0].manuscripts[0]),
  )
}

test('Lemmatize manuscript', async () => {
  await setup()
  await lemmatizeWord('kur', lemma)

  await whenClicked(screen, 'Save lemmatization')
    .expect(updateLemmatization)
    .toHaveBeenCalledWith(
      produce(lemmatization, (draft) => {
        draft[0][0][1][0][0] = castDraft(
          new LemmatizationToken('kur', true, [lemma], []),
        )
      }),
    )
})

test('Lemmatize reconstruction', async () => {
  await setup()
  await lemmatizeWord('kur-kur', lemma)

  await whenClicked(screen, 'Save lemmatization')
    .expect(updateLemmatization)
    .toHaveBeenCalledWith(
      produce(lemmatization, (draft) => {
        draft[0][0][0][1] = castDraft(
          new LemmatizationToken('kur-kur', true, [lemma], []),
        )
        draft[0][0][1][0][0] = castDraft(
          new LemmatizationToken('kur', true, [lemma], [], true),
        )
      }),
    )
})
