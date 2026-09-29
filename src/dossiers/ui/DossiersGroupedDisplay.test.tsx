import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import 'test-support/mockMarkdownRenderers'
import { DossiersGroupedDisplay } from 'dossiers/ui/DossiersGroupedDisplay'
import DossierRecord from 'dossiers/domain/DossierRecord'
import { createMockRecordDto } from 'dossiers/ui/DossiersGroupedDisplay.testSupport'

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
