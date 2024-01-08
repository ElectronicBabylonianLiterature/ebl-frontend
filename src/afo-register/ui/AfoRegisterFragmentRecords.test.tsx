import React from 'react'
import { render, waitFor, screen, act } from '@testing-library/react'
import AfoRegisterFragmentRecords from './AfoRegisterFragmentRecords'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { afoRegisterRecordFactory } from 'test-support/afo-register-fixtures'

jest.mock('afo-register/application/AfoRegisterService')

describe('AfoRegisterFragmentRecords', () => {
  const mockRecords = [
    afoRegisterRecordFactory.build(),
    afoRegisterRecordFactory.build(),
  ]

  it('fetches records and displays them', async () => {
    const mockService = new (AfoRegisterService as jest.Mock<
      jest.Mocked<AfoRegisterService>
    >)()
    mockService.searchTextsAndNumbers.mockResolvedValue(mockRecords)

    const fragment = fragmentFactory.build({
      traditionalReferences: mockRecords.map((record) => record.id),
    })
    await act(async () => {
      render(
        <AfoRegisterFragmentRecords
          afoRegisterService={mockService}
          fragment={fragment}
        />
      )
    })
    await waitFor(() => {
      mockRecords.forEach(async (record) => {
        expect(await screen.findByText(record.id)).toBeInTheDocument()
      })
    })
  })
})
