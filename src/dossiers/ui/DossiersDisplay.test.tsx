import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import DossierRecord from 'dossiers/domain/DossierRecord'
import FragmentDossierRecordsDisplay, {
  DossierRecordDisplay,
  DossierRecordsListDisplay,
} from 'dossiers/ui/DossiersDisplay'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'
import userEvent from '@testing-library/user-event'
import Citation from 'bibliography/domain/Citation'

jest.mock('common/utils/MarkdownAndHtmlToHtml', () => ({
  __esModule: true,
  default: ({ markdownAndHtml }: { markdownAndHtml: string }) => (
    <div>{markdownAndHtml}</div>
  ),
}))

const mockRecordDto = {
  _id: 'test',
  description: 'Test description',
  isApproximateDate: true,
  yearRangeFrom: -500,
  yearRangeTo: -470,
  relatedKings: [10.2, 11],
  provenance: 'Assyria',
  script: {
    period: 'Neo-Assyrian',
    periodModifier: 'None',
    uncertain: false,
  },
  references: referenceDtoFactory.buildList(3),
}

const mockRecord = new DossierRecord(mockRecordDto)

describe('DossierRecordDisplay', () => {
  it('renders correctly with a record', () => {
    render(<DossierRecordDisplay record={mockRecord} index={0} />)
    expect(screen.getByText(/Test description/)).toBeInTheDocument()
  })

  it('renders bibliography references and handles popups', async () => {
    render(<DossierRecordDisplay record={mockRecord} index={0} />)
    mockRecord.references.forEach((reference) => {
      const referenceMarkdown = Citation.for(reference).getMarkdown()
      expect(
        screen.getByText(new RegExp(referenceMarkdown, 'i')),
      ).toBeInTheDocument()
    })
    const firstReferenceMarkdown = Citation.for(
      mockRecord.references[0],
    ).getMarkdown()
    const referenceElement = screen.getByText(
      new RegExp(firstReferenceMarkdown, 'i'),
    )

    await userEvent.click(referenceElement)
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp(mockRecord.references[0].notes)),
    ).toBeInTheDocument()
  })
})

describe('DossierRecordsListDisplay', () => {
  it('renders an empty component when no records are present', () => {
    render(<DossierRecordsListDisplay data={{ records: [] }} />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('renders a list of records and handles bibliography popups', async () => {
    const records = [
      mockRecord,
      new DossierRecord({ ...mockRecordDto, _id: 'test2' }),
    ]
    render(<DossierRecordsListDisplay data={{ records }} />)

    const dossierButton = screen.getByRole('button', { name: 'test' })
    await userEvent.click(dossierButton)

    expect(screen.getAllByRole('button')).toHaveLength(records.length)
    expect(screen.getByText(/ca. 500 BCE - 470 BCE/)).toBeInTheDocument()
    const firstReferenceMarkdown = Citation.for(
      mockRecord.references[0],
    ).getMarkdown()
    const referenceElement = screen.getByText(
      new RegExp(firstReferenceMarkdown, 'i'),
    )

    await userEvent.click(referenceElement)

    expect(await screen.findAllByRole('tooltip')).toHaveLength(2)
    expect(
      screen.getByText(new RegExp(mockRecord.references[0].notes)),
    ).toBeInTheDocument()
  })

  it('opens dossier popups from the keyboard', async () => {
    const records = [mockRecord]
    const user = userEvent.setup()
    render(<DossierRecordsListDisplay data={{ records }} />)

    const dossierButton = screen.getByRole('button', { name: 'test' })

    await user.tab()
    expect(dossierButton).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
  })

  it('closes the dossier popup when the dossier is clicked again', async () => {
    render(<DossierRecordsListDisplay data={{ records: [mockRecord] }} />)
    const dossierButton = screen.getByRole('button', { name: 'test' })
    await userEvent.click(dossierButton)
    await userEvent.click(dossierButton)

    expect(dossierButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the dossier popup on a click outside', async () => {
    render(<DossierRecordsListDisplay data={{ records: [mockRecord] }} />)
    const dossierButton = screen.getByRole('button', { name: 'test' })
    await userEvent.click(dossierButton)
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()

    await userEvent.click(document.body)

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    expect(dossierButton).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('withData HOC integration', () => {
  it('shows no dossiers without querying when the fragment has none', async () => {
    const mockDossiersService = { queryByIds: jest.fn() }
    const { container } = render(
      <FragmentDossierRecordsDisplay
        dossiersService={mockDossiersService}
        fragment={fragmentFactory.build({ dossiers: [] })}
      />,
    )

    await waitFor(() => expect(container).toBeEmptyDOMElement())
    expect(mockDossiersService.queryByIds).not.toHaveBeenCalled()
  })

  it('fetches data and passes it to the wrapped component', async () => {
    const mockDossiersService = {
      queryByIds: jest.fn().mockResolvedValueOnce([mockRecord]),
    }
    const mockFragment = fragmentFactory.build({
      dossiers: [{ dossierId: 'test', isUncertain: true }],
    })

    render(
      <FragmentDossierRecordsDisplay
        dossiersService={mockDossiersService}
        fragment={mockFragment}
      />,
    )
    const dossierButton = await screen.findByRole('button', { name: /test/ })
    await userEvent.click(dossierButton)
    await screen.findByText(/Test description/)
    expect(mockDossiersService.queryByIds).toHaveBeenCalledWith(['test'])
  })

  it('does not refetch when dossier IDs are unchanged but object references change', async () => {
    const queryByIds = jest.fn().mockResolvedValue([mockRecord])
    const mockDossiersService = { queryByIds }
    const fragmentA = fragmentFactory.build({
      dossiers: [{ dossierId: 'test' }],
    })

    const { rerender } = render(
      <FragmentDossierRecordsDisplay
        dossiersService={mockDossiersService}
        fragment={fragmentA}
      />,
    )

    await screen.findByRole('button', { name: /test/ })
    expect(queryByIds).toHaveBeenCalledTimes(1)

    const fragmentB = fragmentFactory.build({
      dossiers: [{ dossierId: 'test' }],
    })

    rerender(
      <FragmentDossierRecordsDisplay
        dossiersService={mockDossiersService}
        fragment={fragmentB}
      />,
    )

    expect(queryByIds).toHaveBeenCalledTimes(1)
  })

  it('refetches when dossier IDs change', async () => {
    const queryByIds = jest.fn().mockResolvedValue([mockRecord])
    const mockDossiersService = { queryByIds }
    const fragmentA = fragmentFactory.build({
      dossiers: [{ dossierId: 'test' }],
    })

    const { rerender } = render(
      <FragmentDossierRecordsDisplay
        dossiersService={mockDossiersService}
        fragment={fragmentA}
      />,
    )

    await screen.findByRole('button', { name: /test/ })
    expect(queryByIds).toHaveBeenCalledTimes(1)

    const fragmentB = fragmentFactory.build({
      dossiers: [{ dossierId: 'other' }],
    })

    rerender(
      <FragmentDossierRecordsDisplay
        dossiersService={mockDossiersService}
        fragment={fragmentB}
      />,
    )

    await screen.findByRole('button', { name: /test/ })
    expect(queryByIds).toHaveBeenCalledTimes(2)
    expect(queryByIds).toHaveBeenCalledWith(['other'])
  })
})
