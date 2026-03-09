import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import AfoRegisterSearch from 'afo-register/ui/AfoRegisterSearch'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import FragmentService from 'fragmentarium/application/FragmentService'
import Bluebird from 'bluebird'
import { afoRegisterRecordFactory } from 'test-support/afo-register-fixtures'

jest.mock('afo-register/application/AfoRegisterService')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}))

const afoRegisterService = new (AfoRegisterService as jest.Mock<
  jest.Mocked<AfoRegisterService>
>)()

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

describe('AfO-Register search display', () => {
  const mockQuery = { text: 'testText', textNumber: 'testNumber' }
  let record

  beforeEach(() => {
    jest.clearAllMocks()
    record = afoRegisterRecordFactory.build()
  })

  it('renders correctly with initial state', async () => {
    afoRegisterService.search.mockReturnValue(Bluebird.resolve([record]))
    render(
      <AfoRegisterSearch
        query={mockQuery}
        afoRegisterService={afoRegisterService}
        fragmentService={fragmentService}
      />,
    )
    await waitForSpinnerToBeRemoved(screen)
    await waitFor(() => {
      const item = screen.getByRole('listitem')
      expect(item).toBeVisible()
    })
    const item = screen.getByRole('listitem')
    expect(item).toHaveTextContent(record.text)
  })

  it('renders correctly with empty result', async () => {
    afoRegisterService.search.mockReturnValue(Bluebird.resolve([]))
    render(
      <AfoRegisterSearch
        query={mockQuery}
        afoRegisterService={afoRegisterService}
        fragmentService={fragmentService}
      />,
    )
    await waitForSpinnerToBeRemoved(screen)
    await waitFor(() => {
      expect(screen.getByText('No records found')).toBeVisible()
    })
  })
})
