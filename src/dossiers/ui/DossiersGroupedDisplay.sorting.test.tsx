import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import 'test-support/mockMarkdownRenderers'
import { DossiersGroupedDisplay } from 'dossiers/ui/DossiersGroupedDisplay'
import DossierRecord from 'dossiers/domain/DossierRecord'
import { createMockRecordDto } from 'dossiers/ui/DossiersGroupedDisplay.testSupport'

describe('DossiersGroupedDisplay sorting', () => {
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
})
