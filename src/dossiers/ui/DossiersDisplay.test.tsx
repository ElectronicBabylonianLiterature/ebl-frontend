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
import { act } from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'

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
})

describe('DossierRecordsListDisplay', () => {
  it('renders an empty component when no records are present', () => {
    render(<DossierRecordsListDisplay data={{ records: [] }} />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('renders a list of records', async () => {
    const records = [
      mockRecord,
      new DossierRecord({ ...mockRecordDto, _id: 'test2' }),
    ]
    render(<DossierRecordsListDisplay data={{ records }} />)

    await act(async () => {
      const dossierSpan = screen.getByText('test')
      userEvent.click(dossierSpan)
    })

    expect(screen.getAllByText(/test/, { selector: 'span' })).toHaveLength(
      records.length
    )
    expect(screen.getByText(/ca. 500 BCE - 470 BCE/)).toBeInTheDocument()
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

    await act(async () => {
      render(
        <FragmentDossierRecordsDisplay
          dossiersService={(mockDossiersService as unknown) as DossiersService}
          fragment={mockFragment as Fragment}
        />
      )
    })
    await act(async () => {
      const dossierSpan = screen.getByText(/test/)
      userEvent.click(dossierSpan)
    })
    await screen.findByText(/Test description/)
    expect(mockDossiersService.queryByIds).toHaveBeenCalledWith(['test'])
  })
})
