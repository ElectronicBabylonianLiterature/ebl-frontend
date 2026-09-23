import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  getKingsByDynasty,
  findKingByOrderGlobal,
  KingField,
  King,
} from 'chronology/ui/Kings/Kings'

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

    await userEvent.click(selectInput)
    await userEvent.type(selectInput, 'Sargon II')
    await userEvent.click(
      screen.getByText('Sargon II (709–705), Miscellaneous Dynasties'),
    )

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

  it('shows the calendar field when a Third Dynasty of Ur king is chosen', async () => {
    const setIsCalenderFieldDisplayed = jest.fn()
    render(
      <KingField
        setKing={jest.fn()}
        setIsCalenderFieldDisplayed={setIsCalenderFieldDisplayed}
      />,
    )
    const selectInput = screen.getByLabelText(/select-king/i)

    await userEvent.click(selectInput)
    await userEvent.type(selectInput, 'Ur-Namma')
    await userEvent.click(
      screen.getByText('Ur-Namma (2110–2093), Third Dynasty of Ur'),
    )

    expect(setIsCalenderFieldDisplayed).toHaveBeenCalledWith(true)
  })

  it('hides the calendar field when a king of another dynasty is chosen', async () => {
    const setIsCalenderFieldDisplayed = jest.fn()
    render(
      <KingField
        setKing={jest.fn()}
        setIsCalenderFieldDisplayed={setIsCalenderFieldDisplayed}
      />,
    )
    const selectInput = screen.getByLabelText(/select-king/i)

    await userEvent.click(selectInput)
    await userEvent.type(selectInput, 'Sargon II')
    await userEvent.click(
      screen.getByText('Sargon II (709–705), Miscellaneous Dynasties'),
    )

    expect(setIsCalenderFieldDisplayed).toHaveBeenCalledWith(false)
  })

  it('displays the current king regardless of its broken and uncertain flags', () => {
    const urNamma = findKingByOrderGlobal(12) as King
    render(
      <KingField
        king={{ ...urNamma, isBroken: true, isUncertain: false }}
        setKing={jest.fn()}
      />,
    )

    expect(
      screen.getByText('Ur-Namma (2110–2093), Third Dynasty of Ur'),
    ).toBeInTheDocument()
  })

  it('labels a king without a date by name and dynasty only', () => {
    const urNanshe = findKingByOrderGlobal(0.11) as King
    render(<KingField king={urNanshe} setKing={jest.fn()} />)

    expect(
      screen.getByText('Ur-Nanše, First Dynasty of Lagash'),
    ).toBeInTheDocument()
  })
})
