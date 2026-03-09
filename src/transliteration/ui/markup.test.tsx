import React from 'react'
import Chance from 'chance'
import { render, screen } from '@testing-library/react'
import Markup, {
  DisplayBibliographyPart,
  DisplayLanguagePart,
  DisplayTextPart,
  DisplayUrlPart,
} from './markup'
import {
  BibliographyPart,
  LanguagePart,
  TextPart,
  UrlPart,
} from 'transliteration/domain/markup'
import { raToken } from 'test-support/test-tokens'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import WordService from 'dictionary/application/WordService'
import { referenceFactory } from 'test-support/bibliography-fixtures'

const chance = new Chance('markup.test.tsx')
const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()
const word = 'word'
const linkText = 'link to eBL'
const url = 'https://www.ebl.lmu.de/'
const reference = referenceFactory.build({}, { transient: { chance } })

const emphasisPart: TextPart = { type: 'EmphasisPart', text: word }
const boldPart: TextPart = { type: 'BoldPart', text: word }
const superscriptPart: TextPart = { type: 'SuperscriptPart', text: word }
const subscriptPart: TextPart = { type: 'SubscriptPart', text: word }
const stringPart: TextPart = { type: 'StringPart', text: word }
const languagePart: LanguagePart = {
  type: 'LanguagePart',
  language: 'AKKADIAN',
  tokens: [raToken],
}
const urlPart: UrlPart = {
  type: 'UrlPart',
  url: url,
  text: linkText,
}
const bibliographyPart: BibliographyPart = {
  type: 'BibliographyPart',
  reference: reference,
}

test('DisplayTextPart emphasis', () => {
  render(<DisplayTextPart part={emphasisPart} />)
  expect(screen.getByText(word)).toHaveClass('markup-emphasis')
})

test('DisplayTextPart bold', () => {
  render(<DisplayTextPart part={boldPart} />)
  expect(screen.getByText(word)).toHaveClass('markup-bold')
})

test('DisplayTextPart superscript', () => {
  render(<DisplayTextPart part={superscriptPart} />)
  expect(screen.getByText(word)).toHaveClass('markup-superscript')
})

test('DisplayTextPart subscript', () => {
  render(<DisplayTextPart part={subscriptPart} />)
  expect(screen.getByText(word)).toHaveClass('markup-subscript')
})

test('DisplayTextPart string', () => {
  render(<DisplayTextPart part={stringPart} />)
  expect(screen.getByText(word)).not.toHaveClass()
})

test('DisplayLanguagePart', () => {
  render(
    <DictionaryContext.Provider value={wordServiceMock}>
      <DisplayLanguagePart part={languagePart} />
    </DictionaryContext.Provider>,
  )

  expect(screen.getByText('ra')).toBeVisible()
})

test('DisplayUrlPart', () => {
  render(<DisplayUrlPart part={urlPart} />)

  expect(screen.getByText(linkText)).toHaveAttribute('href', url)
})

test('DisplayBibliographyPart', () => {
  const { container } = render(
    <DisplayBibliographyPart part={bibliographyPart} />,
  )

  expect(container).toHaveTextContent(reference.document.primaryAuthor)
})

test('Markup', () => {
  const parts = [
    emphasisPart,
    boldPart,
    superscriptPart,
    subscriptPart,
    languagePart,
    urlPart,
    bibliographyPart,
  ]
  const { container } = render(
    <DictionaryContext.Provider value={wordServiceMock}>
      <Markup parts={parts} />
    </DictionaryContext.Provider>,
  )
  expect(container).toMatchSnapshot()
})
