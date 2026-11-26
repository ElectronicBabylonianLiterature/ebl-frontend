import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TextService from 'corpus/application/TextService'
import FragmentService from 'fragmentarium/application/FragmentService'
import ManuscriptsTable from 'corpus/ui/ManuscriptsTable'
import { chapterId } from 'corpus/application/TextService.testSupport'

jest.mock('corpus/application/TextService')
jest.mock('fragmentarium/application/FragmentService')

const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

beforeEach(() => {
  jest.resetAllMocks()
  textService.findManuscripts.mockResolvedValue([])
  textService.findExtantLines.mockResolvedValue({})
})

function renderTable(): void {
  render(
    <MemoryRouter>
      <ManuscriptsTable
        id={chapterId}
        uncertainFragments={[{ museumNumber: 'K.404' }]}
        textService={textService}
        fragmentService={fragmentService}
      />
    </MemoryRouter>,
  )
}

test('renders a missing uncertain fragment as text after the lookup resolves', async () => {
  fragmentService.isInFragmentarium.mockResolvedValue(false)
  renderTable()

  expect(await screen.findByText('K.404')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'K.404' })).not.toBeInTheDocument()
  expect(fragmentService.isInFragmentarium).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('table')).toBeInTheDocument()
})

test('keeps the manuscripts table visible when uncertain-fragment lookup fails', async () => {
  fragmentService.isInFragmentarium.mockRejectedValue(
    new Error('Lookup unavailable'),
  )
  renderTable()

  expect(await screen.findByText('Lookup unavailable')).toBeInTheDocument()
  expect(screen.getByRole('table')).toBeInTheDocument()
  expect(screen.getByText('Uncertain Fragments')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'K.404' })).not.toBeInTheDocument()
})
