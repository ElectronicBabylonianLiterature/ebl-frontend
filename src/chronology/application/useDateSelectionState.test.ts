import { renderHook } from '@testing-library/react'
import useDateSelectionState from 'chronology/application/DateSelectionState'
import { MesopotamianDate } from 'chronology/domain/Date'
import Kings from 'chronology/domain/Kings.json'

describe('useDateSelectionState', () => {
  it('initializes with the original king and year-0 when a year-0 date is passed', () => {
    const nabonidusKing = Kings.find((k) => k.name === 'Nabonidus')!
    const yearZeroDate = new MesopotamianDate({
      year: { value: '0', isReconstructed: true, isEmended: true },
      month: { value: '1' },
      day: { value: '1' },
      king: nabonidusKing,
      isSeleucidEra: false,
    })

    const { result } = renderHook(() =>
      useDateSelectionState({
        date: yearZeroDate,
        updateDate: jest.fn(),
        setDate: jest.fn(),
        setIsDisplayed: jest.fn(),
        setIsSaving: jest.fn(),
        setSaveError: jest.fn(),
      }),
    )

    expect(result.current.yearValue).toBe('0')
    expect(result.current.yearReconstructed).toBe(true)
    expect(result.current.yearEmended).toBe(true)
    expect(result.current.king?.name).toBe('Nabonidus')
  })
})
