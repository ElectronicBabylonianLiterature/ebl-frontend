import React from 'react'
import Chance from 'chance'
import { render, screen } from '@testing-library/react'
import Markup, {
  DisplayBibliographyPart,
  DisplayLaguagePart,
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

const textPart: TextPart = { type: 'EmphasisPart', text: word }
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

test('DisplayTextPart', () => {
  render(<DisplayTextPart part={textPart} />)

  expect(screen.getByText(word)).toBeVisible()
  expect(screen.getByText(word)).toContainHTML(`<em>${word}</em>`)
})

test('DisplayLaguagePart', () => {
  render(
    <DictionaryContext.Provider value={wordServiceMock}>
      <DisplayLaguagePart part={languagePart} />
    </DictionaryContext.Provider>
  )

  expect(screen.getByText('ra')).toBeVisible()
})

test('DisplayUrlPart', () => {
  render(<DisplayUrlPart part={urlPart} />)

  expect(screen.getByText(linkText)).toHaveAttribute('href', url)
})

test('DisplayBibliographyPart', () => {
  const { container } = render(
    <DisplayBibliographyPart part={bibliographyPart} />
  )

  expect(container).toHaveTextContent(reference.document.primaryAuthor)
})

test('Markup', () => {
  const parts = [textPart, languagePart, urlPart, bibliographyPart]
  const { container } = render(
    <DictionaryContext.Provider value={wordServiceMock}>
      <Markup parts={parts} />
    </DictionaryContext.Provider>
  )
  expect(container).toMatchSnapshot()
})
