import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecordView from 'fragmentarium/ui/fragment/RecordView'
import FragmentService from 'fragmentarium/application/FragmentService'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { revision } from 'test-support/record-fixtures'

it('shows the full record of the fragment', async () => {
  const fragment = fragmentFactory.build({ number: 'K.1', record: [revision] })
  const fragmentService: Pick<FragmentService, 'find'> = {
    find: jest.fn().mockResolvedValue(fragment),
  }

  render(
    <MemoryRouter>
      <RecordView number="K.1" fragmentService={fragmentService} />
    </MemoryRouter>,
  )

  expect(
    await screen.findByRole('heading', { name: 'Record of K.1' }),
  ).toBeVisible()
  expect(screen.getByText(/User \(Revision/)).toBeVisible()
  expect(fragmentService.find).toHaveBeenCalledWith('K.1')
})
