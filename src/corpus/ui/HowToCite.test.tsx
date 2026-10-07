import React from 'react'
import { render, screen } from '@testing-library/react'
import { HowToCite } from 'corpus/ui/HowToCite'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import { Author, Translator } from 'corpus/domain/chapter'

const createObjectURL: jest.MockedFunction<typeof URL.createObjectURL> =
  jest.fn()
URL.createObjectURL = createObjectURL

const author = (
  name: string,
  prefix: string,
  role: Author['role'],
): Author => ({
  name,
  prefix,
  role,
  orcidNumber: '',
})

const translator = (name: string, prefix: string): Translator => ({
  name,
  prefix,
  orcidNumber: '',
  language: 'en',
})

it('cites every editor, contributor and translator with the DOI', () => {
  const chapter = chapterDisplayFactory.build({
    textHasDoi: true,
    record: {
      authors: [
        author('Smith', 'John', 'EDITOR'),
        author('Jones', 'Karl-Heinz', 'EDITOR'),
        author('Smith', 'Adam', 'EDITOR'),
        author('Miller', 'Mary', 'REVISION'),
      ],
      translators: [translator('Brown', 'Anna'), translator('Green', 'Ben')],
      publicationDate: '2020-02-25',
    },
  })
  render(<HowToCite chapter={chapter} />)

  expect(
    screen.getByText(
      /^Jones, K\. H\., Smith, J\. and Smith, A\. \(2020\)\. .+\. With contributions by M\. Miller\. Translated by Anna Brown and Ben Green\./,
    ),
  ).toBeVisible()
  expect(
    screen.getByRole('link', { name: `https://doi.org/${chapter.doi}` }),
  ).toHaveAttribute('href', `https://doi.org/${chapter.doi}`)
})

it('cites a single editor with the chapter URL', () => {
  const chapter = chapterDisplayFactory.build({
    textHasDoi: false,
    record: {
      authors: [author('Smith', 'John', 'EDITOR')],
      translators: [],
      publicationDate: '2021-01-01',
    },
  })
  render(<HowToCite chapter={chapter} />)

  expect(screen.getByText(/^Smith, J\. \(2021\)\. .+\.$/)).toBeVisible()
  expect(screen.getByRole('link', { name: chapter.url })).toHaveAttribute(
    'href',
    chapter.url,
  )
})

it.each([
  ['BibTeX', 'bibtex'],
  ['RIS', 'ris'],
  ['CSL-JSON', 'json'],
])('offers the citation as a %s file', (format, extension) => {
  createObjectURL.mockReturnValue('blob:citation')
  const chapter = chapterDisplayFactory.published().build()
  render(<HowToCite chapter={chapter} />)

  expect(screen.getByRole('link', { name: format })).toHaveAttribute(
    'download',
    `${chapter.uniqueIdentifier}.${extension}`,
  )
})
