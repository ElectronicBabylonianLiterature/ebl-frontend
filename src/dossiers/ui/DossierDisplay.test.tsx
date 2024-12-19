import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import DossierRecord from 'dossiers/domain/DossierRecord'
import DossiersService from 'dossiers/application/DossiersService'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  DossierRecordDisplay,
  DossierRecordsListDisplay,
} from './DossiersDisplay'
import Bluebird from 'bluebird'
import withData from 'http/withData'
import { Provenances } from 'corpus/domain/provenance'
import { PeriodModifiers, Periods } from 'common/period'
import { fragmentFactory } from 'test-support/fragment-fixtures'

jest.mock('common/MarkdownAndHtmlToHtml', () => ({
  __esModule: true,
  default: ({ markdownAndHtml }: { markdownAndHtml: string }) => (
    <div>{markdownAndHtml}</div>
  ),
}))

const mockRecord = new DossierRecord({
  id: 'test',
  description: 'Test description',
  isApproximateDate: true,
  yearRangeFrom: -500,
  yearRangeTo: -470,
  relatedKings: [10.2, 11],
  provenance: Provenances['Assyria'],
  script: {
    period: Periods['Neo-Assyrian'],
    periodModifier: PeriodModifiers.None,
    uncertain: false,
  },
  references: ['EDITION', 'DISCUSSION'],
})

describe('DossierRecordDisplay', () => {
  it('renders correctly with a record', () => {
    render(<DossierRecordDisplay record={mockRecord} index={0} />)
    expect(screen.getByText(mockRecord.toMarkdownString())).toBeInTheDocument()
  })
})

describe('DossierRecordsListDisplay', () => {
  it('renders an empty component when no records are present', () => {
    render(<DossierRecordsListDisplay data={{ records: [] }} />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('renders a list of records', () => {
    const records = [
      mockRecord,
      new DossierRecord({ ...mockRecord, id: 'test2' }),
    ]
    render(<DossierRecordsListDisplay data={{ records }} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(records.length)
    expect(screen.getAllByText('ca. 500 BCE - 470 BCE')).toHaveLength(
      records.length
    )
  })
})

describe('withData HOC integration', () => {
  it('fetches data and passes it to the wrapped component', async () => {
    const mockDossiersService = {
      queryByIds: jest.fn().mockResolvedValueOnce([mockRecord]),
    }
    const mockFragment = fragmentFactory.build({
      dossiers: ['test'],
    })

    const WrappedComponent = withData<
      unknown,
      { dossiersService: DossiersService; fragment: Fragment },
      { records: readonly DossierRecord[] }
    >(
      DossierRecordsListDisplay,
      (props) =>
        Bluebird.resolve(
          props.dossiersService
            .queryByIds([...props.fragment.dossiers])
            .then((records) => ({ records }))
        ),
      {
        watch: (props) => [...props.fragment.dossiers],
        filter: (props) => !!props.fragment.dossiers.length,
        defaultData: () => ({ records: [] }),
      }
    )

    render(
      <WrappedComponent
        dossiersService={(mockDossiersService as unknown) as DossiersService}
        fragment={mockFragment as Fragment}
      />
    )

    await screen.findByText(mockRecord.toMarkdownString())
    expect(mockDossiersService.queryByIds).toHaveBeenCalledWith(['test'])
  })
})
