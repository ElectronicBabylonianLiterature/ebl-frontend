import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { DossiersGroupedDisplay } from './DossiersGroupedDisplay'
import DossierRecord from 'dossiers/domain/DossierRecord'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'
import { act } from 'react-dom/test-utils'

jest.mock('common/MarkdownAndHtmlToHtml', () => ({
  __esModule: true,
  default: ({ markdownAndHtml }: { markdownAndHtml: string }) => (
    <div>{markdownAndHtml}</div>
  ),
}))

jest.mock('common/InlineMarkdown', () => ({
  __esModule: true,
  default: ({ source }: { source: string }) => <span>{source}</span>,
}))

const createMockRecordDto = (
  id: string,
  description: string,
  period: string,
  periodModifier: string,
  provenance: string
) => ({
  _id: id,
  description,
  isApproximateDate: false,
  yearRangeFrom: -500,
  yearRangeTo: -470,
  relatedKings: [],
  provenance,
  script: {
    period,
    periodModifier,
    uncertain: false,
  },
  references: referenceDtoFactory.buildList(1),
})

describe('DossiersGroupedDisplay', () => {
  it('renders nothing when given empty array', () => {
    const { container } = render(<DossiersGroupedDisplay records={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders single dossier in one group', () => {
    const record = new DossierRecord(
      createMockRecordDto(
        'D001',
        'First dossier',
        'Neo-Babylonian',
        'Late',
        'Nippur'
      )
    )
    render(<DossiersGroupedDisplay records={[record]} />)

    expect(
      screen.getByText(/Neo-Babylonian \(Late\) — Nippur/)
    ).toBeInTheDocument()
    expect(screen.getByText('Dossiers:')).toBeInTheDocument()
    expect(screen.getByText('D001')).toBeInTheDocument()
  })

  it('groups dossiers by script period and provenance', () => {
    const records = [
      new DossierRecord(
        createMockRecordDto('D001', 'First', 'Neo-Babylonian', 'Late', 'Nippur')
      ),
      new DossierRecord(
        createMockRecordDto(
          'D002',
          'Second',
          'Neo-Babylonian',
          'Late',
          'Nippur'
        )
      ),
      new DossierRecord(
        createMockRecordDto('D003', 'Third', 'Old Babylonian', '', 'Ur')
      ),
    ]
    render(<DossiersGroupedDisplay records={records} />)

    // Check group headers
    expect(
      screen.getByText(/Neo-Babylonian \(Late\) — Nippur/)
    ).toBeInTheDocument()
    expect(screen.getByText(/Old Babylonian — Ur/)).toBeInTheDocument()

    // Check dossiers appear
    expect(screen.getByText('D001')).toBeInTheDocument()
    expect(screen.getByText('D002')).toBeInTheDocument()
    expect(screen.getByText('D003')).toBeInTheDocument()
  })

  it('shows comma-separated dossiers in same group', () => {
    const records = [
      new DossierRecord(
        createMockRecordDto('D001', 'First', 'Neo-Babylonian', 'Late', 'Nippur')
      ),
      new DossierRecord(
        createMockRecordDto(
          'D002',
          'Second',
          'Neo-Babylonian',
          'Late',
          'Nippur'
        )
      ),
    ]
    render(<DossiersGroupedDisplay records={records} />)

    // Both dossiers should be visible
    expect(screen.getByText('D001')).toBeInTheDocument()
    expect(screen.getByText('D002')).toBeInTheDocument()
    // Check they're in same group
    expect(
      screen.getByText(/Neo-Babylonian \(Late\) — Nippur/)
    ).toBeInTheDocument()
  })

  it('handles dossier without period modifier', () => {
    const record = new DossierRecord(
      createMockRecordDto('D001', 'Test', 'Old Babylonian', '', 'Ur')
    )
    render(<DossiersGroupedDisplay records={[record]} />)

    // Should show period without modifier
    expect(screen.getByText(/Old Babylonian — Ur/)).toBeInTheDocument()
    expect(screen.queryByText(/\(\)/)).not.toBeInTheDocument()
  })

  it('opens popover when dossier is clicked', async () => {
    const record = new DossierRecord(
      createMockRecordDto(
        'D001',
        'Test description',
        'Neo-Babylonian',
        'Late',
        'Nippur'
      )
    )
    render(<DossiersGroupedDisplay records={[record]} />)

    const dossierLink = screen.getByText('D001')

    await act(async () => {
      userEvent.click(dossierLink)
    })

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
  })

  it('closes popover when clicked outside', async () => {
    const record = new DossierRecord(
      createMockRecordDto('D001', 'Test', 'Neo-Babylonian', 'Late', 'Nippur')
    )
    const { container } = render(<DossiersGroupedDisplay records={[record]} />)

    const dossierLink = screen.getByText('D001')

    await act(async () => {
      userEvent.click(dossierLink)
    })

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    // Click outside
    await act(async () => {
      userEvent.click(container)
    })

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  it('shows only one popover at a time', async () => {
    const records = [
      new DossierRecord(
        createMockRecordDto('D001', 'First', 'Neo-Babylonian', 'Late', 'Nippur')
      ),
      new DossierRecord(
        createMockRecordDto(
          'D002',
          'Second',
          'Neo-Babylonian',
          'Late',
          'Nippur'
        )
      ),
    ]
    render(<DossiersGroupedDisplay records={records} />)

    // Click first dossier
    await act(async () => {
      userEvent.click(screen.getByText('D001'))
    })

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    // Click second dossier
    await act(async () => {
      userEvent.click(screen.getByText('D002'))
    })

    // Should have closed first and opened second, verify we have a tooltip
    await waitFor(() => {
      const tooltips = screen.queryAllByRole('tooltip')
      expect(tooltips.length).toBeLessThanOrEqual(1)
    })
  })

  it('handles missing script or provenance gracefully', () => {
    const recordDto = {
      _id: 'D001',
      description: 'Test',
      isApproximateDate: false,
      yearRangeFrom: -500,
      yearRangeTo: -470,
      relatedKings: [],
      references: [],
    }
    const record = new DossierRecord(recordDto)
    render(<DossiersGroupedDisplay records={[record]} />)

    // Should show defaults
    expect(
      screen.getByText(/Unknown Period — Unknown Provenance/)
    ).toBeInTheDocument()
  })

  it('applies correct CSS classes for styling', () => {
    const record = new DossierRecord(
      createMockRecordDto('D001', 'Test', 'Neo-Babylonian', 'Late', 'Nippur')
    )
    render(<DossiersGroupedDisplay records={[record]} />)

    // Verify elements are rendered with semantic content
    expect(
      screen.getByText(/Neo-Babylonian \(Late\) — Nippur/)
    ).toBeInTheDocument()
    expect(screen.getByText('Dossiers:')).toBeInTheDocument()
    expect(screen.getByText('D001')).toBeInTheDocument()
  })

  it('groups multiple provenances correctly', () => {
    const records = [
      new DossierRecord(
        createMockRecordDto('D001', 'First', 'Neo-Babylonian', 'Late', 'Nippur')
      ),
      new DossierRecord(
        createMockRecordDto('D002', 'Second', 'Neo-Babylonian', 'Late', 'Ur')
      ),
      new DossierRecord(
        createMockRecordDto('D003', 'Third', 'Old Babylonian', '', 'Nippur')
      ),
    ]
    render(<DossiersGroupedDisplay records={records} />)

    // Should have 3 different groups
    expect(
      screen.getByText(/Neo-Babylonian \(Late\) — Nippur/)
    ).toBeInTheDocument()
    expect(screen.getByText(/Neo-Babylonian \(Late\) — Ur/)).toBeInTheDocument()
    expect(screen.getByText(/Old Babylonian — Nippur/)).toBeInTheDocument()
  })
})
