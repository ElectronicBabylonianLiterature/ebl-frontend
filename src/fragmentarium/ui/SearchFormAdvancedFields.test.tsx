import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { Periods } from 'common/utils/period'
import SearchFormAdvancedFields from 'fragmentarium/ui/SearchFormAdvancedFields'
import { createSearchFormState } from 'fragmentarium/ui/SearchFormState'
import { genres, provenances } from 'fragmentarium/ui/SearchForm.testSupport'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')

it('searches dossier suggestions with the selected filters', async () => {
  const fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  const dossiersService = new (DossiersService as jest.Mock<
    jest.Mocked<DossiersService>
  >)()
  fragmentService.fetchPeriods.mockResolvedValue(Object.keys(Periods))
  fragmentService.fetchGenres.mockResolvedValue(genres)
  fragmentService.fetchProvenances.mockResolvedValue(provenances)
  dossiersService.searchSuggestions.mockResolvedValue([])

  render(
    <SearchFormAdvancedFields
      state={createSearchFormState({ site: 'Nippur' })}
      onChange={() => jest.fn()}
      fragmentService={fragmentService}
      dossiersService={dossiersService}
    />,
  )
  await screen.findByText('Genre')
  await userEvent.type(screen.getByLabelText('Dossier'), 'D1')

  await waitFor(() =>
    expect(dossiersService.searchSuggestions).toHaveBeenCalledWith('D1', {
      provenance: 'Nippur',
      scriptPeriod: '',
      genre: '',
    }),
  )
})
