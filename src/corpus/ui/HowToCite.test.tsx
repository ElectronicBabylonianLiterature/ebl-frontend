import React from 'react'
import { render, screen } from '@testing-library/react'
import { HowToCite } from 'corpus/ui/HowToCite'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'

function buildChapter(textHasDoi: boolean): ChapterDisplay {
  return chapterDisplayFactory.build({
    textHasDoi,
    record: {
      authors: [
        { name: 'Zeta', prefix: 'Anna-Maria', role: 'EDITOR', orcidNumber: '' },
        { name: 'Alpha', prefix: 'Bruno', role: 'EDITOR', orcidNumber: '' },
        { name: 'Alpha', prefix: 'Carla', role: 'EDITOR', orcidNumber: '' },
        { name: 'Omega', prefix: 'Gerd', role: 'EDITOR', orcidNumber: '' },
        { name: 'Mu', prefix: 'Dora', role: 'REVISION', orcidNumber: '' },
      ],
      translators: [
        { name: 'Xi', prefix: 'Emil', orcidNumber: '', language: 'en' },
        { name: 'Beta', prefix: 'Fritz', orcidNumber: '', language: 'de' },
      ],
      publicationDate: '2020-02-25',
    },
  })
}

beforeEach(() => {
  ;(URL.createObjectURL as jest.Mock).mockReturnValue('blob:citation')
})

describe('HowToCite', () => {
  it('cites every editor, contributor and translator in order', () => {
    render(<HowToCite chapter={buildChapter(false)} />)

    const citationPattern =
      /^Alpha, B\., Alpha, C\., Omega, G\. and Zeta, A\. M\. \(2020\)\. .+\. With contributions by D\. Mu\. Translated by Fritz Beta and Emil Xi\. electronic Babylonian Library\./
    expect(
      screen.getByText(
        (_content, element) =>
          element?.tagName === 'SPAN' &&
          citationPattern.test(element.textContent ?? ''),
      ),
    ).toBeInTheDocument()
  })

  it('leaves out contributors and translators when there are none', () => {
    const chapter = chapterDisplayFactory.published().build()
    render(<HowToCite chapter={chapter} />)

    const citation = screen.getByText(
      (_content, element) =>
        element?.tagName === 'SPAN' &&
        /^Test, A\. \(2020\)\. .+ electronic Babylonian Library\./.test(
          element.textContent ?? '',
        ),
    )
    expect(citation).not.toHaveTextContent('With contributions by')
    expect(citation).not.toHaveTextContent('Translated by')
  })

  it('links to the chapter page when the text has no DOI', () => {
    const chapter = buildChapter(false)
    render(<HowToCite chapter={chapter} />)

    expect(screen.getByRole('link', { name: chapter.url })).toHaveAttribute(
      'href',
      chapter.url,
    )
  })

  it('links to the DOI when the text has one', () => {
    const chapter = buildChapter(true)
    render(<HowToCite chapter={chapter} />)

    const doiUrl = `https://doi.org/${chapter.doi}`
    expect(screen.getByRole('link', { name: doiUrl })).toHaveAttribute(
      'href',
      doiUrl,
    )
  })

  it('offers the citation for download in every format', () => {
    render(<HowToCite chapter={buildChapter(false)} />)

    expect(screen.getByRole('button', { name: 'BibTeX' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'RIS' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'CSL-JSON' })).toBeInTheDocument()
  })
})
