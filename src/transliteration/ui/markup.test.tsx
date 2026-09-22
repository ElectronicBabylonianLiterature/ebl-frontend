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
  ParagraphPart,
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
const paragraphPart: ParagraphPart = {
  type: 'ParagraphPart',
  text: '',
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

test('DisplayUrlPart uses the URL when text is empty', () => {
  render(<DisplayUrlPart part={{ ...urlPart, text: '' }} />)

  expect(screen.getByText(url)).toHaveAttribute('href', url)
})

test('Markup rejects an unsplit paragraph part', () => {
  expect(() => Markup({ parts: [paragraphPart] })).toThrow(
    'Unexpected ParagraphPart. Use createParagraphs to split parts into paragraphs',
  )
})

test('DisplayBibliographyPart', () => {
  const { container } = render(
    <DisplayBibliographyPart part={bibliographyPart} />,
  )

  expect(container).toHaveTextContent(reference.document.primaryAuthor)
})

test('DisplayBibliographyPart renders a resolved reference without pages normally', () => {
  const pageLessReference = reference.setPages('')
  const { container } = render(
    <DisplayBibliographyPart
      part={{ type: 'BibliographyPart', reference: pageLessReference }}
    />,
  )

  expect(container).toHaveTextContent(pageLessReference.document.primaryAuthor)
  expect(container).not.toHaveTextContent('@bib{')
})

test('DisplayBibliographyPart renders a resolved reference with pages normally', () => {
  const pagedReference = reference.setPages('12–14')
  const { container } = render(
    <DisplayBibliographyPart
      part={{ type: 'BibliographyPart', reference: pagedReference }}
    />,
  )

  expect(container).toHaveTextContent('12–14')
  expect(container).not.toHaveTextContent('@bib{')
})

test('DisplayBibliographyPart omits the page separator from an empty fallback', () => {
  render(
    <DisplayBibliographyPart
      part={{
        type: 'BibliographyPart',
        reference: {
          id: 'attinger2014lamentation',
          type: 'DISCUSSION',
          pages: '',
          notes: '',
          linesCited: [],
        },
      }}
    />,
  )

  expect(screen.getByText('@bib{attinger2014lamentation}')).toBeVisible()
})

test('DisplayBibliographyPart includes pages in a paged fallback', () => {
  render(
    <DisplayBibliographyPart
      part={{
        type: 'BibliographyPart',
        reference: {
          id: 'attinger2014lamentation',
          type: 'DISCUSSION',
          pages: '12–14',
          notes: '',
          linesCited: [],
        },
      }}
    />,
  )

  expect(screen.getByText('@bib{attinger2014lamentation@12–14}')).toBeVisible()
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
