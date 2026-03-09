import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getKingsByDynasty, findKingByOrderGlobal, KingField } from './Kings'

describe('getKingsByDynasty', () => {
  it('returns kings from the specified dynasty', () => {
    const result = getKingsByDynasty('Dynasty of Akkad')
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ dynastyName: 'Dynasty of Akkad' }),
      ]),
    )
  })

  it('returns an empty array for a dynasty that does not exist', () => {
    const result = getKingsByDynasty('Nonexistent Dynasty')
    expect(result).toHaveLength(0)
  })
})

describe('findKingByOrderGlobal', () => {
  it('finds and returns the king with the specified orderGlobal', () => {
    const result = findKingByOrderGlobal(1)
    expect(result).toEqual(expect.objectContaining({ name: 'Sargon' }))
  })

  it('returns null if no king with the specified orderGlobal exists', () => {
    const result = findKingByOrderGlobal(999)
    expect(result).toBeNull()
  })
})

describe('KingField Component', () => {
  it('renders without crashing', () => {
    render(<KingField setKing={() => {}} />)
    expect(screen.getByLabelText(/select-king/i)).toBeInTheDocument()
  })

  it('updates the king selection', async () => {
    const setKing = jest.fn()
    render(<KingField setKing={setKing} />)
    const selectInput = screen.getByLabelText(/select-king/i)
    await userEvent.type(selectInput, 'Sargon', { skipClick: true })
    await userEvent.keyboard('{arrowdown}')
    await userEvent.keyboard('{enter}')

    expect(setKing).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '709–705',
        dynastyName: 'Miscellaneous Dynasties',
        dynastyNumber: '12',
        name: 'Sargon II',
        notes: '',
        orderGlobal: 147,
        orderInDynasty: '22',
        totalOfYears: '5',
      }),
    )
  })
})
