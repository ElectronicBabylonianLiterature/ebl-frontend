import React from 'react'
import { render, screen } from '@testing-library/react'
import Promise from 'bluebird'
import { InitializeLemmatizer } from 'fragmentarium/ui/fragment/lemma-annotation/InitializeLemmatizer'
import { Text } from 'transliteration/domain/text'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import Word from 'dictionary/domain/Word'
import textLine from 'test-support/lines/text-line'
import { TextLine } from 'transliteration/domain/text-line'
import { AkkadianWord } from 'transliteration/domain/token'
import { wordFactory } from 'test-support/word-fixtures'

const token: AkkadianWord = {
  enclosureType: [],
  erasure: 'NONE',
  cleanValue: 'kur',
  value: 'kur',
  language: 'AKKADIAN',
  normalized: true,
  lemmatizable: true,
  alignable: true,
  uniqueLemma: ['aklu I'],
  alignment: null,
  variant: null,
  modifiers: [],
  parts: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'kur',
      value: 'kur',
      name: 'kur',
      nameParts: [
        {
          enclosureType: [],
          erasure: 'NONE',
          cleanValue: 'kur',
          value: 'kur',
          type: 'ValueToken',
        },
      ],
      subIndex: 1,
      modifiers: [],
      flags: [],
      sign: null,
      type: 'Reading',
    },
  ],
  type: 'AkkadianWord',
  hasVariantAlignment: false,
  hasOmittedAlignment: false,
}
const partlyLemmatizedLine = new TextLine({
  prefix: '2.',
  content: [token],
  lineNumber: {
    number: 2,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber',
  },
  type: 'TextLine',
})

const lines: readonly AbstractLine[] = [textLine, partlyLemmatizedLine]
const text = new Text({ lines })
const words: Word[] = [
  wordFactory.build({
    _id: 'aklu I',
    lemma: ['aklu'],
    homonym: 'I',
  }),
]
const fragmentNumber = 'Test.Fragment'
let container

jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')

const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const fragmentServiceMock = new MockFragmentService()
const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()
const updateLemmaAnnotation = jest.fn()

const setup = async () => {
  wordServiceMock.findAll.mockReturnValue(Promise.resolve(words))
  container = render(
    <InitializeLemmatizer
      text={text}
      museumNumber={fragmentNumber}
      wordService={wordServiceMock}
      fragmentService={fragmentServiceMock}
      updateAnnotation={updateLemmaAnnotation}
    />,
  ).container
  await screen.findByText('aklu I')
}

it('displays the annotation tool', async () => {
  await setup()
  expect(container).toMatchSnapshot()
})
it('displays the existing lemmas', async () => {
  await setup()
  expect(screen.getByText('aklu I')).toBeVisible()
})
it('loads existing lemmas', async () => {
  await setup()
  expect(wordServiceMock.findAll).toBeCalledWith(['aklu I'])
})
