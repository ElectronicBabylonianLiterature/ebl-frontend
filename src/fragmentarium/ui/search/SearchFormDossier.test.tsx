import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import SearchFormDossier from './SearchFormDossier'
import DossierRecord from 'dossiers/domain/DossierRecord'
import DossiersService from 'dossiers/application/DossiersService'

const mockReact = React

jest.mock('http/withData', () => {
  return function withData(Component: any, dataFetcher: any) {
    return function WrappedComponent(props: any) {
      const [data, setData] = mockReact.useState<any>(null)
      const [loading, setLoading] = mockReact.useState(true)

      mockReact.useEffect(() => {
        dataFetcher(props)
          .then((result: any) => {
            setData(result)
            setLoading(false)
          })
          .catch(() => setLoading(false))
      }, [])

      if (loading || !data) {
        return <div>Loading...</div>
      }

      return <Component {...props} data={data} />
    }
  }
})

const mockDossierDto = {
  _id: 'D001',
  description: 'Test dossier description',
  isApproximateDate: false,
  yearRangeFrom: -500,
  yearRangeTo: -470,
  relatedKings: [],
  provenance: 'Nippur',
  script: {
    period: 'Neo-Babylonian',
    periodModifier: 'Late',
    uncertain: false,
  },
  references: [],
}

describe('SearchFormDossier', () => {
  let mockDossiersService: jest.Mocked<DossiersService>
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
    mockDossiersService = {
      fetchAllDossiers: jest.fn(),
      searchDossier: jest.fn(),
      queryByIds: jest.fn(),
    } as any
  })

  it('renders Select with correct placeholder after loading', async () => {
    const dossiers = [new DossierRecord(mockDossierDto)]
    mockDossiersService.fetchAllDossiers.mockResolvedValue(dossiers)

    render(
      <SearchFormDossier
        value={null}
        onChange={mockOnChange}
        dossiersService={mockDossiersService}
      />
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('ID — Description')).toBeInTheDocument()
    })
  })

  it('fetches all dossiers on mount', async () => {
    const dossiers = [new DossierRecord(mockDossierDto)]
    mockDossiersService.fetchAllDossiers.mockResolvedValue(dossiers)

    render(
      <SearchFormDossier
        value={null}
        onChange={mockOnChange}
        dossiersService={mockDossiersService}
      />
    )

    await waitFor(() => {
      expect(mockDossiersService.fetchAllDossiers).toHaveBeenCalled()
    })
  })

  it('displays selected dossier value', async () => {
    const selectedDossier = new DossierRecord(mockDossierDto)
    mockDossiersService.fetchAllDossiers.mockResolvedValue([selectedDossier])

    render(
      <SearchFormDossier
        value={selectedDossier}
        onChange={mockOnChange}
        dossiersService={mockDossiersService}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText(/D001 — Test dossier description/)
      ).toBeInTheDocument()
    })
  })

  it('displays all dossiers in dropdown', async () => {
    const dossiers = [
      new DossierRecord(mockDossierDto),
      new DossierRecord({
        ...mockDossierDto,
        _id: 'D002',
        description: 'Second dossier',
      }),
    ]
    mockDossiersService.fetchAllDossiers.mockResolvedValue(dossiers)

    render(
      <SearchFormDossier
        value={null}
        onChange={mockOnChange}
        dossiersService={mockDossiersService}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const input = screen.getByLabelText('select-dossier')
    userEvent.click(input)

    await waitFor(() => {
      expect(
        screen.getAllByText(/D001 — Test dossier description/)[0]
      ).toBeInTheDocument()
      expect(
        screen.getAllByText(/D002 — Second dossier/)[0]
      ).toBeInTheDocument()
    })
  })

  it('calls onChange when option is selected', async () => {
    const dossier = new DossierRecord(mockDossierDto)
    mockDossiersService.fetchAllDossiers.mockResolvedValue([dossier])

    render(
      <SearchFormDossier
        value={null}
        onChange={mockOnChange}
        dossiersService={mockDossiersService}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const input = screen.getByLabelText('select-dossier')
    userEvent.click(input)

    await waitFor(() => {
      expect(
        screen.getAllByText(/D001 — Test dossier description/)[0]
      ).toBeInTheDocument()
    })

    const options = screen.getAllByText(/D001 — Test dossier description/)
    const option = options.find((el) =>
      el.className.includes('dossier-selector__option')
    )
    userEvent.click(option!)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(dossier)
    })
  })

  it('handles dossier without description', async () => {
    const dossierNoDesc = new DossierRecord({
      ...mockDossierDto,
      description: undefined,
    })
    mockDossiersService.fetchAllDossiers.mockResolvedValue([dossierNoDesc])

    render(
      <SearchFormDossier
        value={null}
        onChange={mockOnChange}
        dossiersService={mockDossiersService}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const input = screen.getByLabelText('select-dossier')
    userEvent.click(input)

    await waitFor(() => {
      expect(screen.getAllByText(/D001 —/)[0]).toBeInTheDocument()
    })
  })

  it('syncs with external value prop changes', async () => {
    const dossier1 = new DossierRecord(mockDossierDto)
    const dossier2 = new DossierRecord({ ...mockDossierDto, _id: 'D002' })
    mockDossiersService.fetchAllDossiers.mockResolvedValue([dossier1, dossier2])

    const { rerender } = render(
      <SearchFormDossier
        value={dossier1}
        onChange={mockOnChange}
        dossiersService={mockDossiersService}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/D001/)).toBeInTheDocument()
    })

    rerender(
      <SearchFormDossier
        value={dossier2}
        onChange={mockOnChange}
        dossiersService={mockDossiersService}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/D002/)).toBeInTheDocument()
    })
  })
})
