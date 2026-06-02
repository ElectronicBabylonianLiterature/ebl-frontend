import { MesopotamianDate } from 'chronology/domain/Date'
import {
  king,
  nabonassarEraKing,
  nabonidusKing,
  rimushKing,
} from 'test-support/date-fixtures'

describe('MesopotamianDate', () => {
  it('returns the correct string representation, zero year, first in dynasty (Nabonassar era)', () => {
    const date = new MesopotamianDate({
      year: { value: '0' },
      month: { value: '1' },
      day: { value: '1' },
      king: king,
      isSeleucidEra: false,
    })
    expect(date.toString()).toBe('1.I.0 Sargon (ca. 2334–2279 BCE PJC)')
  })

  it('returns the correct string representation, zero year (Nabonassar era)', () => {
    const date = new MesopotamianDate({
      year: { value: '0' },
      month: { value: '5' },
      day: { value: '12' },
      king: nabonassarEraKing,
      isSeleucidEra: false,
    })
    expect(date.toString()).toBe(
      '12.V.0 Darius I (3 August 522 BCE PJC | 28 July 522 BCE PGC)',
    )
  })

  it('preserves zero-year display for Nabonidus and converts using last numeric predecessor year', () => {
    const date = new MesopotamianDate({
      year: { value: '0' },
      month: { value: '5' },
      day: { value: '12' },
      king: nabonidusKing,
      isSeleucidEra: false,
    })

    expect(date.zeroYearKing?.name).toBe('Nabonidus')
    expect(date.yearZero?.value).toBe('0')
    expect(date.king?.name).toBe('Neriglissar')
    expect(date.year.value).toBe('4')
    expect(date.toString()).toContain('12.V.0 Nabonidus')
    expect(date.toString()).not.toContain('Labaši-Marduk')
    expect(date.toModernDate()).toBe('18 August 556 BCE PJC')
  })

  it('handles year 0 in king-date conversion path and uses previous king year for calculation', () => {
    const date = new MesopotamianDate({
      year: { value: '0' },
      month: { value: '1' },
      day: { value: '1' },
      king: rimushKing,
    })

    expect(date.dateType).toBe('kingDate')
    expect(date.zeroYearKing?.name).toBe('Rimuš')
    expect(date.yearZero?.value).toBe('0')
    expect(date.king?.name).toBe('Sargon')
    expect(date.year.value).toBe('56')
    expect(date.year.isUncertain).toBe(true)
    expect(date.toString()).toContain('1.I.0 Rimuš')
    expect(date.toModernDate()).toBe('ca. 2279 BCE PJC')
  })

  it('keeps original king when year 0 has no numeric predecessor for calculation', () => {
    const yamsiElKing = {
      orderGlobal: 72,
      dynastyNumber: '5',
      dynastyName: 'Marad Dynasty',
      orderInDynasty: '4',
      name: 'Yamsi-El',
      date: '',
      totalOfYears: '',
      notes: '',
    }

    const date = new MesopotamianDate({
      year: { value: '0' },
      month: { value: '1' },
      day: { value: '1' },
      king: yamsiElKing,
    })

    expect(date.zeroYearKing).toBeUndefined()
    expect(date.yearZero).toBeUndefined()
    expect(date.king?.name).toBe('Yamsi-El')
    expect(date.year.value).toBe('0')
  })

  describe('toJulianDate branching', () => {
    it('returns empty when none of the conditions are met', () => {
      const date = new MesopotamianDate({
        year: { value: '1' },
        month: { value: '1' },
        day: { value: '1' },
      })
      expect(date.toModernDate()).toBe('')
    })

    it('returns the correct modern date for a king without orderGlobal', () => {
      const unorderedKing = { ...king, orderGlobal: -1 }
      const date = new MesopotamianDate({
        year: { value: '10' },
        month: { value: '5' },
        day: { value: '12' },
        king: unorderedKing,
      })
      expect(date.toModernDate()).toBe('ca. 2325 BCE PJC')
    })
  })

  it('handles king with orderGlobal matching rulerToBrinkmanKings', () => {
    const kingWithSpecificOrder = { ...king, orderGlobal: 1 }
    const date = new MesopotamianDate({
      year: { value: '1' },
      month: { value: '1' },
      day: { value: '1' },
      king: kingWithSpecificOrder,
    })
    const result = date.toModernDate()
    expect(result).toBe('ca. 2334 BCE PJC')
  })

  it('handles king without a date', () => {
    const kingWithoutDate = { ...king, date: '' }
    const date = new MesopotamianDate({
      year: { value: '1' },
      month: { value: '1' },
      day: { value: '1' },
      king: kingWithoutDate,
    })
    expect(date.toModernDate()).toBe('')
  })
})

describe('handles king date with non-numeric characters', () => {
  it('parses and processes king date correctly', () => {
    const kingWithDirtyDate = {
      ...king,
      date: 'c. 818–c. 813',
    }

    const date = new MesopotamianDate({
      year: { value: '5' },
      month: { value: '3' },
      day: { value: '10' },
      king: kingWithDirtyDate,
    })

    expect(date.toModernDate()).toBe('ca. 814 BCE PJC')
  })
})
