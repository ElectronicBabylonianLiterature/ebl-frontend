import React from 'react'
import { render, screen } from '@testing-library/react'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentLemmaLines from 'dictionary/ui/search/FragmentLemmaLines'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

jest.mock('fragmentarium/application/FragmentService')

test('marks an approximate match count', async () => {
  const fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  fragmentService.query.mockResolvedValue({
    items: [],
    matchCountTotal: 3,
    isMatchCountTotalExact: false,
  })

  const { container } = render(
    <FragmentLemmaLines lemmaId="aklu I" fragmentService={fragmentService} />,
  )
  await waitForSpinnerToBeRemoved(screen)

  expect(container).toHaveTextContent('About 3 matches')
  expect(container).toHaveTextContent('Show matches in Library search')
})
