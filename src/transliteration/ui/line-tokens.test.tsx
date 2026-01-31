import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  EmptyLineToken,
  LineColumns,
  LineToken,
  LineTokens,
} from './line-tokens'
import { lemmatizableToken } from 'test-support/line-group-fixtures'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import textLine from 'test-support/lines/text-line'
import { LemmatizableToken } from 'transliteration/domain/token'
import _ from 'lodash'

jest.mock('dictionary/application/WordService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()

const token = lemmatizableToken as LemmatizableToken

test('LineTokens', () => {
  render(
    <DictionaryContext.Provider value={wordServiceMock}>
      <LineTokens content={[lemmatizableToken]} />
    </DictionaryContext.Provider>,
  )
  expect(screen.getByText(token.cleanValue)).toBeVisible()
})

test('LineColumns', () => {
  const container = render(
    <DictionaryContext.Provider value={wordServiceMock}>
      <LineColumns columns={textLine.columns} maxColumns={1} />
    </DictionaryContext.Provider>,
  ).container

  expect(container).toMatchSnapshot()
})

test('LineToken', () => {
  const siglum = 'testSiglum1'
  const lineToken = new LineToken(token, siglum)

  const lineTokenDto = {
    token: token,
    lemma: null,
    siglum: siglum,
    type: 'LineToken',
    alignment: token.alignment,
    isVariant: !_.isNil(token.variant),
    cleanValue: token.cleanValue,
    uniqueLemma: token.uniqueLemma,
  }

  expect({
    ...lineToken,
    alignment: lineToken.alignment,
    isVariant: lineToken.isVariant,
    cleanValue: lineToken.cleanValue,
    uniqueLemma: lineToken.uniqueLemma,
  }).toEqual(lineTokenDto)
})

test('EmptyLineToken', () => {
  const siglum = 'testSiglum2'
  const lineToken = new EmptyLineToken(siglum, 1)

  const emptyLineTokenDto = {
    siglum: siglum,
    alignment: 1,
    cleanValue: lineToken.cleanValue,
    isVariant: true,
    uniqueLemma: lineToken.uniqueLemma,
    type: 'EmptyLineToken',
  }

  expect(lineToken).toEqual(emptyLineTokenDto)
})
