import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MesopotamianDate } from 'chronology/domain/Date'
import DateDisplay from 'chronology/ui/DateDisplay'
import { findKingByOrderGlobal, King } from 'chronology/ui/Kings/Kings'

function createDateWithString(dateString: string): MesopotamianDate {
  return { toString: () => dateString } as unknown as MesopotamianDate
}

describe('DateDisplay', () => {
  it('switches a Seleucid date between the Julian and Gregorian calendars', async () => {
    render(
      <DateDisplay
        date={
          new MesopotamianDate({
            year: { value: '10' },
            month: { value: '5' },
            day: { value: '12', isUncertain: true },
            isSeleucidEra: true,
          })
        }
      />,
    )
    const dateDisplay = screen.getByRole('time')

    expect(dateDisplay).toHaveTextContent(
      '12?.V.10 SE (ca. 30 August 302 BCE PJC)',
    )
    expect(screen.getByText('?')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'PJC' }))
    expect(dateDisplay).toHaveTextContent('(ca. 25 August 302 BCE PGC)')

    await userEvent.click(screen.getByRole('button', { name: 'PGC' }))
    expect(dateDisplay).toHaveTextContent('(ca. 30 August 302 BCE PJC)')
  })

  it('shows a regnal date without a calendar switch', () => {
    const sargon = findKingByOrderGlobal(1) as King
    render(
      <DateDisplay
        date={
          new MesopotamianDate({
            year: { value: '10' },
            month: { value: '5' },
            day: { value: '12' },
            king: sargon,
          })
        }
      />,
    )

    expect(screen.getByRole('time')).toHaveTextContent(
      '12.V.10 Sargon (ca. 2325 BCE PJC)',
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('raises every uncertainty and emendation marker, including a trailing one', () => {
    render(<DateDisplay date={createDateWithString('12!.V?')} />)

    expect(screen.getByText('!')).toBeInTheDocument()
    expect(screen.getByText('?')).toBeInTheDocument()
    expect(screen.getByRole('time')).toHaveTextContent('12!.V?')
  })
})
