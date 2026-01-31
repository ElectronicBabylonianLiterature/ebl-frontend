import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import DossierRecord from 'dossiers/domain/DossierRecord'
import DossiersService from 'dossiers/application/DossiersService'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentDossierRecordsDisplay, {
  DossierRecordDisplay,
  DossierRecordsListDisplay,
} from './DossiersDisplay'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'
import {} from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'
import Citation from 'bibliography/domain/Citation'

jest.mock('common/MarkdownAndHtmlToHtml', () => ({
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

    const dossierSpan = screen.getByText('test')
    await userEvent.click(dossierSpan)

    expect(screen.getAllByText(/test/, { selector: 'span' })).toHaveLength(
      records.length,
    )
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
})

describe('withData HOC integration', () => {
  it('fetches data and passes it to the wrapped component', async () => {
    const mockDossiersService = {
      queryByIds: jest.fn().mockResolvedValueOnce([mockRecord]),
    }
    const mockFragment = fragmentFactory.build({
      dossiers: [{ dossierId: 'test', isUncertain: true }],
    })

    render(
      <FragmentDossierRecordsDisplay
        dossiersService={mockDossiersService as unknown as DossiersService}
        fragment={mockFragment as Fragment}
      />,
    )
    const dossierSpan = screen.getByText(/test/)
    await userEvent.click(dossierSpan)
    await screen.findByText(/Test description/)
    expect(mockDossiersService.queryByIds).toHaveBeenCalledWith(['test'])
  })
})
