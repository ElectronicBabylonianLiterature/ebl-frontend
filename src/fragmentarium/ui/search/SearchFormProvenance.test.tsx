import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Promise from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import SearchFormProvenance from './SearchFormProvenance'

jest.mock('fragmentarium/application/FragmentService')

describe('SearchFormProvenance', () => {
  let fragmentService: jest.Mocked<FragmentService>
  const onChange = jest.fn()

  beforeEach(() => {
    fragmentService = new (FragmentService as jest.Mock<
      jest.Mocked<FragmentService>
    >)()
    onChange.mockReset()
  })

  it('renders options from API provenances', async () => {
    fragmentService.fetchProvenances.mockReturnValue(
      Promise.resolve([
        {
          id: 'assur',
          longName: 'Aššur',
          abbreviation: 'Ašš',
          parent: 'Assyria',
          sortKey: 1,
        },
      ]),
    )

    render(
      <SearchFormProvenance
        value={null}
        onChange={onChange}
        fragmentService={fragmentService}
      />,
    )

    await userEvent.click(await screen.findByLabelText('select-site'))
    expect(await screen.findByText('Aššur')).toBeVisible()
  })

  it('shows empty state for empty API response', async () => {
    fragmentService.fetchProvenances.mockReturnValue(Promise.resolve([]))

    render(
      <SearchFormProvenance
        value={null}
        onChange={onChange}
        fragmentService={fragmentService}
      />,
    )

    await userEvent.click(await screen.findByLabelText('select-site'))
    expect(await screen.findByText('No options')).toBeVisible()
  })

  it('shows API error fallback', async () => {
    fragmentService.fetchProvenances.mockReturnValue(
      Promise.reject(new Error('Failed to load provenances')),
    )

    render(
      <SearchFormProvenance
        value={null}
        onChange={onChange}
        fragmentService={fragmentService}
      />,
    )

    expect(
      await screen.findByText('Failed to load provenances'),
    ).toBeInTheDocument()
  })

  it('keeps unknown selected provenance value visible', async () => {
    fragmentService.fetchProvenances.mockReturnValue(
      Promise.resolve([
        {
          id: 'assur',
          longName: 'Aššur',
          abbreviation: 'Ašš',
          parent: 'Assyria',
          sortKey: 1,
        },
      ]),
    )

    render(
      <SearchFormProvenance
        value="Unknown Site"
        onChange={onChange}
        fragmentService={fragmentService}
      />,
    )

    expect(await screen.findByText('Unknown Site')).toBeVisible()
  })
})
