import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import {
  AfoRegisterRecordDisplay,
  AfoRegisterRecordsListDisplay,
} from './AfoRegisterDisplay'
import { afoRegisterRecordFactory } from 'test-support/afo-register-fixtures'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

const mockRecord = afoRegisterRecordFactory.build()
const anotherMockRecord = afoRegisterRecordFactory.build()

describe('AfoRegisterRecordDisplay', () => {
  it('renders correctly', async () => {
    render(
      <div data-testid="item">
        <AfoRegisterRecordDisplay record={mockRecord} index={0} />
      </div>,
    )
    await waitForSpinnerToBeRemoved(screen)
    const { text, textNumber } = mockRecord
    await waitFor(() => {
      const item = screen.getByTestId('item')
      expect(item).toHaveTextContent(text)
    })
    const item = screen.getByTestId('item')
    expect(item).toHaveTextContent(textNumber)
  })
})

describe('AfoRegisterRecordsListDisplay', () => {
  it('displays no records message when empty', () => {
    render(<AfoRegisterRecordsListDisplay records={[]} />)
    expect(screen.getByText('No records found')).toBeInTheDocument()
  })

  it('renders records correctly', async () => {
    render(
      <AfoRegisterRecordsListDisplay
        records={[mockRecord, anotherMockRecord]}
      />,
    )
    await waitForSpinnerToBeRemoved(screen)
    await waitFor(() => {
      expect(screen.getAllByRole('listitem').length).toBe(2)
      screen.getAllByRole('listitem').forEach((item, index) => {
        expect(item).toHaveClass('afo-register-records__list-item')
        const { text, textNumber } = [mockRecord, anotherMockRecord][index]
        expect(item).toHaveTextContent(text)
        expect(item).toHaveTextContent(textNumber)
      })
    })
  })
})
