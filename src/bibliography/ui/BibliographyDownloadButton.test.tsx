import React from 'react'
import { render, screen } from '@testing-library/react'
import BibliographyDownloadButton from './BibliographyDownloadButton'

describe('BibliographyDownloadButton', () => {
  const mockOnClick = jest.fn()

  test('Renders download buttons with correct labels', () => {
    render(
      <>
        <BibliographyDownloadButton
          format="bibtex"
          filename="test.bib"
          label="BibTeX"
          onClick={mockOnClick}
        />
        <BibliographyDownloadButton
          format="data"
          filename="test.json"
          label="CSL-JSON"
          onClick={mockOnClick}
        />
        <BibliographyDownloadButton
          format="ris"
          filename="test.ris"
          label="RIS"
          onClick={mockOnClick}
        />
      </>,
    )

    expect(screen.getByText('BibTeX')).toBeInTheDocument()
    expect(screen.getByText('CSL-JSON')).toBeInTheDocument()
    expect(screen.getByText('RIS')).toBeInTheDocument()
  })

  test('Calls onClick handler with correct arguments', () => {
    render(
      <BibliographyDownloadButton
        format="bibtex"
        filename="test.bib"
        label="BibTeX"
        onClick={mockOnClick}
      />,
    )

    const button = screen.getByText('BibTeX')
    button.click()

    expect(mockOnClick).toHaveBeenCalledWith('bibtex', 'test.bib')
  })
})
