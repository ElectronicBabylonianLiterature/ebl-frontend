import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import 'test-support/mockMarkdownRenderers'
import { DossiersGroupedDisplay } from 'dossiers/ui/DossiersGroupedDisplay'
import DossierRecord from 'dossiers/domain/DossierRecord'
import { createMockRecordDto } from 'dossiers/ui/DossiersGroupedDisplay.testSupport'

describe('DossiersGroupedDisplay ordering', () => {
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

    const dossierButtons = screen
      .getAllByRole('button')
      .map((button) => button.textContent)

    expect(dossierButtons).toEqual(['D001', 'D002', 'D010'])
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

    expect(screen.getByText('Dossiers:')).toHaveClass('dossier-prefix')
    expect(screen.getByRole('button', { name: 'D001' })).toHaveClass(
      'dossier-name',
    )
    expect(screen.getByRole('link')).toHaveClass('dossier-search-link')
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
  it('orders groups of the same period and provenance by period modifier', () => {
    const records = [
      new DossierRecord(
        createMockRecordDto('D001', 'First', 'Neo-Babylonian', 'Late', 'Ur'),
      ),
      new DossierRecord(
        createMockRecordDto('D002', 'Second', 'Neo-Babylonian', 'Early', 'Ur'),
      ),
    ]
    render(<DossiersGroupedDisplay records={records} />)

    expect(screen.getAllByText(/^\*\*Neo-Babylonian/)).toEqual([
      screen.getByText('**Neo-Babylonian (Early) — Ur**'),
      screen.getByText('**Neo-Babylonian (Late) — Ur**'),
    ])
  })

  it('closes the popover on a click outside', async () => {
    const record = new DossierRecord(
      createMockRecordDto('D001', 'Test', 'Neo-Babylonian', 'Late', 'Nippur'),
    )
    const user = userEvent.setup()
    render(<DossiersGroupedDisplay records={[record]} />)
    const dossierButton = screen.getByRole('button', { name: 'D001' })
    await user.click(dossierButton)
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()

    await user.click(document.body)

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    expect(dossierButton).toHaveAttribute('aria-expanded', 'false')
  })
  it('orders unknown and missing periods after the known periods', () => {
    const records = [
      new DossierRecord({
        _id: 'D001',
        description: 'No script',
        provenance: 'Ur',
        references: [],
      }),
      new DossierRecord(
        createMockRecordDto('D002', 'Unknown', 'Atlantean', 'None', 'Ur'),
      ),
      new DossierRecord(
        createMockRecordDto('D003', 'Known', 'Old Babylonian', 'None', 'Ur'),
      ),
    ]
    render(<DossiersGroupedDisplay records={records} />)

    expect(
      screen.getAllByRole('button').map((button) => button.textContent),
    ).toEqual(['D003', 'D002', 'D001'])
  })

  it('closes the popover when the dossier is clicked again', async () => {
    const record = new DossierRecord(
      createMockRecordDto('D001', 'Test', 'Neo-Babylonian', 'Late', 'Nippur'),
    )
    const user = userEvent.setup()
    render(<DossiersGroupedDisplay records={[record]} />)
    const dossierButton = screen.getByRole('button', { name: 'D001' })
    await user.click(dossierButton)
    await user.click(dossierButton)

    expect(dossierButton).toHaveAttribute('aria-expanded', 'false')
  })
  it('places dossiers without a script after those with one', () => {
    const records = [
      new DossierRecord({ _id: 'D003', description: 'No script' }),
      new DossierRecord(
        createMockRecordDto('D002', 'Late', 'Hellenistic', 'None', 'Ur'),
      ),
      new DossierRecord(
        createMockRecordDto('D001', 'Early', 'Ur III', 'None', 'Ur'),
      ),
    ]
    render(<DossiersGroupedDisplay records={records} />)

    expect(
      screen.getAllByRole('button').map((button) => button.textContent),
    ).toEqual(['D001', 'D002', 'D003'])
  })

  it('closes the popover when the dossier is clicked again', async () => {
    const record = new DossierRecord(
      createMockRecordDto('D001', 'Test', 'Neo-Babylonian', 'Late', 'Nippur'),
    )
    const user = userEvent.setup()
    render(<DossiersGroupedDisplay records={[record]} />)
    const dossierButton = screen.getByRole('button', { name: 'D001' })
    await user.click(dossierButton)
    await user.click(dossierButton)

    expect(dossierButton).toHaveAttribute('aria-expanded', 'false')
  })
})
