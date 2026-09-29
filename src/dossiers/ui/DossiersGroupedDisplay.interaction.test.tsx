import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import 'test-support/mockMarkdownRenderers'
import { DossiersGroupedDisplay } from 'dossiers/ui/DossiersGroupedDisplay'
import DossierRecord from 'dossiers/domain/DossierRecord'
import {
  createMockRecordDto,
  getDossierSearchLabel,
} from 'dossiers/ui/DossiersGroupedDisplay.testSupport'

describe('DossiersGroupedDisplay interaction', () => {
  it('opens popover when dossier is clicked', async () => {
    const record = new DossierRecord(
      createMockRecordDto(
        'D001',
        'Test description',
        'Neo-Babylonian',
        'Late',
        'Nippur',
      ),
    )
    const user = userEvent.setup()
    render(<DossiersGroupedDisplay records={[record]} />)

    await user.click(screen.getByRole('button', { name: 'D001' }))

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
    expect(screen.getByText(/Test description/)).toBeInTheDocument()
  })

  it('opens popover when dossier is activated from keyboard', async () => {
    const record = new DossierRecord(
      createMockRecordDto(
        'D001',
        'Test description',
        'Neo-Babylonian',
        'Late',
        'Nippur',
      ),
    )
    const user = userEvent.setup()
    render(<DossiersGroupedDisplay records={[record]} />)

    const dossierButton = screen.getByRole('button', { name: 'D001' })

    await user.tab()
    expect(dossierButton).toHaveFocus()
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
  })

  it('links dossier search arrow to library search filtered by dossier id', () => {
    const record = new DossierRecord(
      createMockRecordDto('D001', 'Test', 'Neo-Babylonian', 'Late', 'Nippur'),
    )
    render(<DossiersGroupedDisplay records={[record]} />)

    expect(
      screen.getByRole('link', { name: getDossierSearchLabel('D001') }),
    ).toHaveAttribute('href', '/library/search/?dossier=D001')
  })

  it('focuses dossier button first from the keyboard', async () => {
    const record = new DossierRecord(
      createMockRecordDto('D001', 'Test', 'Neo-Babylonian', 'Late', 'Nippur'),
    )
    const user = userEvent.setup()
    render(<DossiersGroupedDisplay records={[record]} />)

    const dossierButton = screen.getByRole('button', { name: 'D001' })

    await user.tab()

    expect(dossierButton).toHaveFocus()
  })
})
