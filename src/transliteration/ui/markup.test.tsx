import React from 'react'
import Chance from 'chance'
import { render, screen } from '@testing-library/react'
import Markup, {
  DisplayBibliographyPart,
  DisplayLanguagePart,
  DisplayTextPart,
  DisplayUrlPart,
} from 'transliteration/ui/markup'
import {
  BibliographyPart,
  LanguagePart,
  TextPart,
  UrlPart,
} from 'transliteration/domain/markup'
import { raToken } from 'test-support/test-tokens'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import WordService from 'dictionary/application/WordService'
import {
  referenceDtoFactory,
  referenceFactory,
} from 'test-support/bibliography-fixtures'

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

test.each([
  '/corpus/L/1/4',
  'mailto:editor@example.org',
  'https://example.org/path with spaces',
])('DisplayUrlPart links an allowed URL: %s', (allowedUrl) => {
  render(<DisplayUrlPart part={{ ...urlPart, url: allowedUrl }} />)

  expect(screen.getByRole('link', { name: linkText })).toHaveAttribute(
    'href',
    allowedUrl,
  )
  expect(screen.getByRole('link', { name: linkText })).toHaveAttribute(
    'target',
    '_blank',
  )
  expect(screen.getByRole('link', { name: linkText })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  )
})

test.each([
  ['java', 'script:alert(document.domain)'].join(''),
  'data:text/html,<script>alert(document.domain)</script>',
  'https://www.ebl.lmu.de@evil.com/',
])('DisplayUrlPart does not link a disallowed URL: %s', (disallowedUrl) => {
  render(<DisplayUrlPart part={{ ...urlPart, url: disallowedUrl }} />)

  expect(screen.getByText(linkText)).toBeVisible()
  expect(screen.queryByRole('link', { name: linkText })).not.toBeInTheDocument()
})

test('DisplayUrlPart uses the URL when text is empty', () => {
  render(<DisplayUrlPart part={{ ...urlPart, text: '' }} />)

  expect(screen.getByText(url)).toHaveAttribute('href', url)
})

test('DisplayUrlPart preserves a backend URL with Unicode and spaces', () => {
  const backendUrl = 'www.example.com/#špecial cḫars'
  render(
    <DisplayUrlPart part={{ type: 'UrlPart', url: backendUrl, text: '' }} />,
  )

  const link = screen.getByRole('link', { name: backendUrl })
  expect(link).toHaveAttribute('href', backendUrl)
  expect(link).toHaveProperty('hash', '#%C5%A1pecial%20c%E1%B8%ABars')
  expect(link).toHaveProperty('origin', window.location.origin)
})

test('DisplayBibliographyPart', () => {
  const { container } = render(
    <DisplayBibliographyPart part={bibliographyPart} />,
  )

  expect(container).toHaveTextContent(reference.document.primaryAuthor)
})

test('DisplayBibliographyPart preserves an unresolved reference', () => {
  render(
    <DisplayBibliographyPart
      part={{
        type: 'BibliographyPart',
        reference: referenceDtoFactory.build({
          id: 'MISSING',
          pages: '1–2',
        }),
      }}
    />,
  )

  expect(screen.getByText('@bib{MISSING@1–2}')).toBeVisible()
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

test('Markup rejects an unsplit paragraph part', () => {
  expect(() =>
    Markup({ parts: [{ type: 'ParagraphPart', text: '' }] }),
  ).toThrow(
    'Unexpected ParagraphPart. Use createParagraphs to split parts into paragraphs',
  )
})

test('DisplayUrlPart without text shows the url', () => {
  render(<DisplayUrlPart part={{ ...urlPart, text: '' }} />)

  expect(screen.getByText(url)).toHaveAttribute('href', url)
})
