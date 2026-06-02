import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import DossiersSearchPage from 'dossiers/ui/DossiersSearchPage'
import DossierRecord from 'dossiers/domain/DossierRecord'
import DossiersService from 'dossiers/application/DossiersService'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'
import Bluebird from 'bluebird'

jest.mock('common/ui/Markdown', () => ({
  __esModule: true,
  Markdown: ({ text }: { text: string }) => <div>{text}</div>,
}))

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

function makeDossierDto(
  id: string,
  period: string,
  periodModifier: string,
  provenance: string,
) {
  return {
    _id: id,
    description: `Description of ${id}`,
    isApproximateDate: false,
    yearRangeFrom: -600,
    yearRangeTo: -550,
    relatedKings: [],
    provenance,
    script: { period, periodModifier, uncertain: false },
    references: referenceDtoFactory.buildList(1),
  }
}

const records = [
  new DossierRecord(makeDossierDto('D001', 'Neo-Babylonian', 'None', 'Nippur')),
  new DossierRecord(makeDossierDto('D002', 'Old Babylonian', 'None', 'Ur')),
  new DossierRecord(
    makeDossierDto('D003', 'Neo-Babylonian', 'None', 'Babylon'),
  ),
]

function makeDossiersService(
  data: readonly DossierRecord[] = records,
): DossiersService {
  return {
    fetchAllDossiers: jest.fn().mockReturnValue(Bluebird.resolve(data)),
  } as unknown as DossiersService
}

describe('DossiersSearchPage', () => {
  it('renders introduction text after data loads', async () => {
    const dossiersService = makeDossiersService()
    render(<DossiersSearchPage dossiersService={dossiersService} />)
    expect(
      await screen.findByText(/Dossiers group cuneiform/),
    ).toBeInTheDocument()
  })

  it('renders period and provenance filter dropdowns', async () => {
    const dossiersService = makeDossiersService()
    render(<DossiersSearchPage dossiersService={dossiersService} />)
    expect(
      await screen.findByRole('combobox', { name: /Filter by period/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: /Filter by provenance/ }),
    ).toBeInTheDocument()
  })

  it('populates period options from fetched records', async () => {
    const dossiersService = makeDossiersService()
    render(<DossiersSearchPage dossiersService={dossiersService} />)
    expect(await screen.findByText('Neo-Babylonian')).toBeInTheDocument()
    expect(screen.getByText('Old Babylonian')).toBeInTheDocument()
  })

  it('populates provenance options from fetched records', async () => {
    const dossiersService = makeDossiersService()
    render(<DossiersSearchPage dossiersService={dossiersService} />)
    expect(await screen.findByText('Nippur')).toBeInTheDocument()
    expect(screen.getByText('Ur')).toBeInTheDocument()
    expect(screen.getByText('Babylon')).toBeInTheDocument()
  })

  it('shows all dossiers by default', async () => {
    const dossiersService = makeDossiersService()
    render(<DossiersSearchPage dossiersService={dossiersService} />)
    expect(await screen.findByText('D001')).toBeInTheDocument()
    expect(screen.getByText('D002')).toBeInTheDocument()
    expect(screen.getByText('D003')).toBeInTheDocument()
  })

  it('filters dossiers when a period is selected', async () => {
    const dossiersService = makeDossiersService()
    render(<DossiersSearchPage dossiersService={dossiersService} />)
    const periodSelect = await screen.findByRole('combobox', {
      name: /Filter by period/,
    })
    await userEvent.selectOptions(periodSelect, 'Old Babylonian')
    expect(screen.getByText('D002')).toBeInTheDocument()
    expect(screen.queryByText('D001')).not.toBeInTheDocument()
    expect(screen.queryByText('D003')).not.toBeInTheDocument()
  })

  it('filters dossiers when a provenance is selected', async () => {
    const dossiersService = makeDossiersService()
    render(<DossiersSearchPage dossiersService={dossiersService} />)
    const provenanceSelect = await screen.findByRole('combobox', {
      name: /Filter by provenance/,
    })
    await userEvent.selectOptions(provenanceSelect, 'Nippur')
    expect(screen.getByText('D001')).toBeInTheDocument()
    expect(screen.queryByText('D002')).not.toBeInTheDocument()
    expect(screen.queryByText('D003')).not.toBeInTheDocument()
  })

  it('applies both period and provenance filters together', async () => {
    const dossiersService = makeDossiersService()
    render(<DossiersSearchPage dossiersService={dossiersService} />)
    const periodSelect = await screen.findByRole('combobox', {
      name: /Filter by period/,
    })
    const provenanceSelect = screen.getByRole('combobox', {
      name: /Filter by provenance/,
    })
    await userEvent.selectOptions(periodSelect, 'Neo-Babylonian')
    await userEvent.selectOptions(provenanceSelect, 'Babylon')
    expect(screen.getByText('D003')).toBeInTheDocument()
    expect(screen.queryByText('D001')).not.toBeInTheDocument()
    expect(screen.queryByText('D002')).not.toBeInTheDocument()
  })

  it('shows empty message when no dossiers match the filters', async () => {
    const dossiersService = makeDossiersService()
    render(<DossiersSearchPage dossiersService={dossiersService} />)
    const periodSelect = await screen.findByRole('combobox', {
      name: /Filter by period/,
    })
    const provenanceSelect = screen.getByRole('combobox', {
      name: /Filter by provenance/,
    })
    await userEvent.selectOptions(periodSelect, 'Old Babylonian')
    await userEvent.selectOptions(provenanceSelect, 'Nippur')
    expect(
      screen.getByText(/No dossiers match the selected filters/),
    ).toBeInTheDocument()
  })

  it('renders correctly with an empty dossiers list', async () => {
    const dossiersService = makeDossiersService([])
    render(<DossiersSearchPage dossiersService={dossiersService} />)
    expect(
      await screen.findByRole('combobox', { name: /Filter by period/ }),
    ).toBeInTheDocument()
    expect(screen.queryByText('D001')).not.toBeInTheDocument()
  })
})
