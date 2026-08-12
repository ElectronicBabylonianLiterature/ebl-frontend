import React from 'react'
import { render, screen } from '@testing-library/react'
import CompactFragmentLines from 'fragmentarium/ui/search/CompactFragmentLines'
import {
  compactPreviewLines,
  SUMMARY_LEMMA_ID,
} from 'test-support/fragment-query-summary'

describe('CompactFragmentLines', () => {
  it('renders authoritative text, highlights matching lemmata, and limits rows', () => {
    render(
      <CompactFragmentLines
        lines={compactPreviewLines}
        lemmaIds={[SUMMARY_LEMMA_ID]}
        linesToShow={1}
        totalLines={3}
      />,
    )

    expect(screen.getByText('1.')).toBeVisible()
    expect(screen.getByRole('table')).toHaveTextContent('kur ša')
    expect(screen.getByText('kur')).toHaveClass(
      'fragment-query-preview__token--highlight',
    )
    expect(screen.queryByText('2.')).not.toBeInTheDocument()
    expect(screen.getByText('And 2 more')).toBeVisible()
  })

  it('falls back safely for empty and unmatched lightweight tokens', () => {
    render(
      <CompactFragmentLines
        lines={[
          {
            number: 9,
            prefix: '',
            text: '',
            tokens: [
              {
                type: 'ValueToken',
                value: '',
                cleanValue: '',
                uniqueLemma: [],
              },
              {
                type: 'Word',
                value: 'missing',
                cleanValue: 'missing',
                uniqueLemma: [],
              },
            ],
          },
          {
            number: 10,
            prefix: '10.',
            text: 'visible text',
            tokens: [
              {
                type: 'Word',
                value: 'absent',
                cleanValue: 'absent',
                uniqueLemma: [],
              },
            ],
          },
        ]}
        linesToShow={2}
        totalLines={2}
      />,
    )

    expect(screen.getByText('9')).toBeVisible()
    expect(screen.getByText('visible text')).toBeVisible()
    expect(screen.queryByText(/And .* more/)).not.toBeInTheDocument()
  })
})
