import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { DossiersGroupedDisplay } from './DossiersGroupedDisplay'
import DossierRecord from 'dossiers/domain/DossierRecord'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'

jest.mock('common/utils/MarkdownAndHtmlToHtml', () => ({
  __esModule: true,
  default: ({ markdownAndHtml }: { markdownAndHtml: string }) => (
    <div>{markdownAndHtml}</div>
  ),
}))

jest.mock('common/ui/InlineMarkdown', () => ({
  __esModule: true,
  default: ({ source }: { source: string }) => <span>{source}</span>,
}))

const createMockRecordDto = (
  id: string,
  description: string,
  period: string,
  periodModifier: string,
  provenance: string,
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
        'Nippur',
      ),
    )
    render(<DossiersGroupedDisplay records={[record]} />)

    expect(
      screen.getByText(/Neo-Babylonian \(Late\) — Nippur/),
    ).toBeInTheDocument()
    expect(screen.getByText('Dossiers:')).toBeInTheDocument()
    expect(screen.getByText('D001')).toBeInTheDocument()
  })

  it('groups dossiers by script period and provenance', () => {
    const records = [
      new DossierRecord(
        createMockRecordDto(
          'D001',
          'First',
          'Neo-Babylonian',
          'Late',
          'Nippur',
        ),
      ),
      new DossierRecord(
        createMockRecordDto(
          'D002',
          'Second',
          'Neo-Babylonian',
          'Late',
          'Nippur',
        ),
      ),
      new DossierRecord(
        createMockRecordDto('D003', 'Third', 'Old Babylonian', '', 'Ur'),
      ),
    ]
    render(<DossiersGroupedDisplay records={records} />)

    expect(
      screen.getByText(/Neo-Babylonian \(Late\) — Nippur/),
    ).toBeInTheDocument()
    expect(screen.getByText(/Old Babylonian — Ur/)).toBeInTheDocument()

    expect(screen.getByText('D001')).toBeInTheDocument()
    expect(screen.getByText('D002')).toBeInTheDocument()
    expect(screen.getByText('D003')).toBeInTheDocument()
  })

  it('shows comma-separated dossiers in same group', () => {
    const records = [
      new DossierRecord(
        createMockRecordDto(
          'D001',
          'First',
          'Neo-Babylonian',
          'Late',
          'Nippur',
        ),
      ),
      new DossierRecord(
        createMockRecordDto(
          'D002',
          'Second',
          'Neo-Babylonian',
          'Late',
          'Nippur',
        ),
      ),
    ]
    render(<DossiersGroupedDisplay records={records} />)

    expect(screen.getByText('D001')).toBeInTheDocument()
    expect(screen.getByText('D002')).toBeInTheDocument()
    expect(
      screen.getByText(/Neo-Babylonian \(Late\) — Nippur/),
    ).toBeInTheDocument()
  })

  it('handles dossier without period modifier', () => {
    const record = new DossierRecord(
      createMockRecordDto('D001', 'Test', 'Old Babylonian', '', 'Ur'),
    )
    render(<DossiersGroupedDisplay records={[record]} />)

    expect(screen.getByText(/Old Babylonian — Ur/)).toBeInTheDocument()
    expect(screen.queryByText(/\(\)/)).not.toBeInTheDocument()
  })

  it('does not display None period modifier in group title', () => {
    const record = new DossierRecord(
      createMockRecordDto('D001', 'Test', 'Old Babylonian', 'None', 'Ur'),
    )
    render(<DossiersGroupedDisplay records={[record]} />)

    expect(screen.getByText(/Old Babylonian — Ur/)).toBeInTheDocument()
    expect(screen.queryByText(/None/)).not.toBeInTheDocument()
  })

  it('links each dossier to library search filtered by dossier id', () => {
    const record = new DossierRecord(
      createMockRecordDto('D001', 'Test', 'Neo-Babylonian', 'Late', 'Nippur'),
    )
    render(<DossiersGroupedDisplay records={[record]} />)

    expect(screen.getByRole('link', { name: 'D001' })).toHaveAttribute(
      'href',
      '/library/search/?dossier=D001',
    )
  })

  it('focuses dossier links from the keyboard', async () => {
    const record = new DossierRecord(
      createMockRecordDto('D001', 'Test', 'Neo-Babylonian', 'Late', 'Nippur'),
    )
    const user = userEvent.setup()
    render(<DossiersGroupedDisplay records={[record]} />)

    const dossierLink = screen.getByRole('link', { name: 'D001' })

    await user.tab()

    expect(dossierLink).toHaveFocus()
  })

  it('sorts groups by script period order and provenance name', () => {
    const records = [
      new DossierRecord(
        createMockRecordDto(
          'D001',
          'First',
          'Old Babylonian',
          'None',
          'Nippur',
        ),
      ),
      new DossierRecord(
        createMockRecordDto('D002', 'Second', 'Ur III', 'None', 'Ur'),
      ),
      new DossierRecord(
        createMockRecordDto('D003', 'Third', 'Ur III', 'None', 'Larsa'),
      ),
      new DossierRecord(
        createMockRecordDto(
          'D004',
          'Fourth',
          'Old Babylonian',
          'None',
          'Babylon',
        ),
      ),
    ]
    render(<DossiersGroupedDisplay records={records} />)

    const groupHeaders = screen.getAllByText(
      /^\*\*(Ur III|Old Babylonian).*\*\*$/,
    )

    expect(groupHeaders).toEqual([
      screen.getByText('**Ur III — Larsa**'),
      screen.getByText('**Ur III — Ur**'),
      screen.getByText('**Old Babylonian — Babylon**'),
      screen.getByText('**Old Babylonian — Nippur**'),
    ])
  })

  it('sorts dossiers by id within the same group', () => {
    const records = [
      new DossierRecord(
        createMockRecordDto(
          'D010',
          'First',
          'Neo-Babylonian',
          'Late',
          'Nippur',
        ),
      ),
      new DossierRecord(
        createMockRecordDto(
          'D002',
          'Second',
          'Neo-Babylonian',
          'Late',
          'Nippur',
        ),
      ),
      new DossierRecord(
        createMockRecordDto(
          'D001',
          'Third',
          'Neo-Babylonian',
          'Late',
          'Nippur',
        ),
      ),
    ]
    render(<DossiersGroupedDisplay records={records} />)

    const dossierLinks = screen
      .getAllByRole('link')
      .map((link) => link.textContent)

    expect(dossierLinks).toEqual(['D001', 'D002', 'D010'])
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

    expect(
      screen.getByText(/Unknown Period — Unknown Provenance/),
    ).toBeInTheDocument()
  })

  it('applies correct CSS classes for styling', () => {
    const record = new DossierRecord(
      createMockRecordDto('D001', 'Test', 'Neo-Babylonian', 'Late', 'Nippur'),
    )
    render(<DossiersGroupedDisplay records={[record]} />)

    expect(
      screen.getByText(/Neo-Babylonian \(Late\) — Nippur/),
    ).toBeInTheDocument()
    expect(screen.getByText('Dossiers:')).toBeInTheDocument()
    expect(screen.getByText('D001')).toBeInTheDocument()
  })

  it('groups multiple provenances correctly', () => {
    const records = [
      new DossierRecord(
        createMockRecordDto(
          'D001',
          'First',
          'Neo-Babylonian',
          'Late',
          'Nippur',
        ),
      ),
      new DossierRecord(
        createMockRecordDto('D002', 'Second', 'Neo-Babylonian', 'Late', 'Ur'),
      ),
      new DossierRecord(
        createMockRecordDto('D003', 'Third', 'Old Babylonian', '', 'Nippur'),
      ),
    ]
    render(<DossiersGroupedDisplay records={records} />)

    expect(
      screen.getByText(/Neo-Babylonian \(Late\) — Nippur/),
    ).toBeInTheDocument()
    expect(screen.getByText(/Neo-Babylonian \(Late\) — Ur/)).toBeInTheDocument()
    expect(screen.getByText(/Old Babylonian — Nippur/)).toBeInTheDocument()
  })
})
