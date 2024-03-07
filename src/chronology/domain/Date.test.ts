import { Eponym } from 'chronology/ui/DateEditor/Eponyms'
import { MesopotamianDate } from 'chronology/domain/Date'
import { Ur3Calendar } from 'chronology/domain/DateParameters'

const king = {
  orderGlobal: 1,
  dynastyNumber: '1',
  dynastyName: 'Dynasty of Akkad',
  orderInDynasty: '1',
  name: 'Sargon',
  date: '2334–2279',
  totalOfYears: '56?',
  notes: '',
}

const kingUr3 = {
  orderGlobal: 14,
  dynastyNumber: '2',
  dynastyName: 'Third Dynasty of Ur',
  orderInDynasty: '3',
  name: 'Amar-Suen',
  date: '2044–2036',
  totalOfYears: '9',
  notes: '',
}

const eponym = {
  date: '910',
  name: 'Adad-nērārī (II)',
  title: 'king',
  isKing: true,
  phase: 'NA',
} as Eponym

const nabonassarEraKing = {
  orderGlobal: 172,
  dynastyNumber: '14',
  dynastyName: 'Persian Rulers',
  orderInDynasty: '3',
  name: 'Darius I',
  date: '521–486',
  totalOfYears: '36',
  notes: '',
}

describe('MesopotamianDate', () => {
  describe('converts from json', () => {
    it('initializes from JSON', () => {
      const json = {
        year: { value: '2023' },
        month: { value: '5' },
        day: { value: '12' },
        king,
        isSeleucidEra: true,
        ur3Calendar: Ur3Calendar.UR,
      }

      const date = MesopotamianDate.fromJson(json)

      expect(date.year.value).toBe('2023')
      expect(date.month.value).toBe('5')
      expect(date.day.value).toBe('12')
      expect(date.king?.name).toBe('Sargon')
      expect(date.isSeleucidEra).toBe(true)
      expect(date.ur3Calendar).toBe(Ur3Calendar.UR)
    })
  })

  describe('converts from json with missing properties', () => {
    it('handles missing optional properties', () => {
      const json = {
        year: { value: '2023' },
        month: { value: '5' },
        day: { value: '12' },
      }

      const date = MesopotamianDate.fromJson(json)

      expect(date.year.value).toBe('2023')
      expect(date.month.value).toBe('5')
      expect(date.day.value).toBe('12')
      expect(date.king).toBeUndefined()
      expect(date.eponym).toBeUndefined()
      expect(date.isSeleucidEra).toBeUndefined()
      expect(date.isAssyrianDate).toBeUndefined()
      expect(date.ur3Calendar).toBeUndefined()
    })
  })

  describe('converts to string', () => {
    it('returns the correct string representation (standard)', () => {
      const date = new MesopotamianDate({
        year: { value: '10' },
        month: { value: '5' },
        day: { value: '12' },
        king,
      })
      expect(date.toString()).toBe('12.V.10 Sargon (ca. 2325 BCE PJC)')
    })
  })

  it('returns the correct string representation (Seleucid)', () => {
    const date = new MesopotamianDate({
      year: { value: '10' },
      month: { value: '5' },
      day: { value: '12' },
      isSeleucidEra: true,
    })
    expect(date.toString()).toBe(
      '12.V.10 SE (30 August 302 BCE PJC | 25 August 302 BCE PGC)'
    )
  })

  it('returns the correct string representation (Seleucid, no day)', () => {
    const date = new MesopotamianDate({
      year: { value: '10' },
      month: { value: '5' },
      day: { value: '' },
      isSeleucidEra: true,
    })
    expect(date.toString()).toBe(
      '∅.V.10 SE (ca. 19 August - 16 September 302 BCE PJC | ca. 14 August - 11 September 302 BCE PGC)'
    )
  })

  it('returns the correct string representation (Seleucid, no month)', () => {
    const date = new MesopotamianDate({
      year: { value: '10' },
      month: { value: '' },
      day: { value: '12' },
      isSeleucidEra: true,
    })
    expect(date.toString()).toBe(
      '12.∅.10 SE (ca. 4 May 302 - 24 March 301 BCE PJC | ca. 29 April 302 - 20 March 301 BCE PGC)'
    )
  })

  it('returns the correct string representation (Seleucid, no year)', () => {
    const date = new MesopotamianDate({
      year: { value: '' },
      month: { value: '5' },
      day: { value: '12' },
      isSeleucidEra: true,
    })
    expect(date.toString()).toBe('12.V.∅ SE')
  })

  it('returns the correct string representation (Nabonassar era)', () => {
    const date = new MesopotamianDate({
      year: { value: '10' },
      month: { value: '5' },
      day: { value: '12' },
      king: nabonassarEraKing,
      isSeleucidEra: false,
    })
    expect(date.toString()).toBe(
      '12.V.10 Darius I (11 August 512 BCE PJC | 5 August 512 BCE PGC)'
    )
  })

  it('returns the correct string representation (Nabonassar era, no year)', () => {
    const date = new MesopotamianDate({
      year: { value: '10' },
      month: { value: '5' },
      day: { value: '' },
      king: nabonassarEraKing,
      isSeleucidEra: false,
    })
    expect(date.toString()).toBe(
      '∅.V.10 Darius I (ca. 31 July - 29 August 512 BCE PJC | ca. 25 July - 23 August 512 BCE PGC)'
    )
  })

  it('returns the correct string representation (Nabonassar era, no month)', () => {
    const date = new MesopotamianDate({
      year: { value: '10' },
      month: { value: '' },
      day: { value: '12' },
      king: nabonassarEraKing,
      isSeleucidEra: false,
    })
    expect(date.toString()).toBe(
      '12.∅.10 Darius I (ca. 16 April 512 - 6 March 511 BCE PJC | ca. 10 April 512 - 28 February 511 BCE PGC)'
    )
  })

  it('returns the correct string representation (Nabonassar era, no day)', () => {
    const date = new MesopotamianDate({
      year: { value: '10' },
      month: { value: '5' },
      day: { value: '' },
      king: nabonassarEraKing,
      isSeleucidEra: false,
    })
    expect(date.toString()).toBe(
      '∅.V.10 Darius I (ca. 31 July - 29 August 512 BCE PJC | ca. 25 July - 23 August 512 BCE PGC)'
    )
  })

  it('returns the correct string representation (Nabonassar era, king only)', () => {
    const date = new MesopotamianDate({
      year: { value: '' },
      month: { value: '' },
      day: { value: '' },
      king: nabonassarEraKing,
      isSeleucidEra: false,
    })
    expect(date.toString()).toBe(
      'Darius I (ca. 14 April 521 - 5 April 485 BCE PJC | ca. 8 April 521 - 31 March 485 BCE PGC)'
    )
  })

  it('returns the correct string representation (Ur III)', () => {
    const date = new MesopotamianDate({
      year: { value: '10' },
      month: { value: '5' },
      day: { value: '12' },
      king: kingUr3,
      ur3Calendar: Ur3Calendar.UR,
    })
    expect(date.toString()).toBe(
      '12.V.10 Amar-Suen, Ur calendar (ca. 2035 BCE PJC)'
    )
  })

  it('returns the correct string representation (Assyrian date with eponym)', () => {
    const date = new MesopotamianDate({
      year: { value: '1' },
      month: { value: '1' },
      day: { value: '1' },
      isAssyrianDate: true,
      eponym,
    })

    expect(date.toString()).toBe(
      '1.I.1 Adad-nērārī (II) (NA eponym) (ca. 910 BCE PJC)'
    )
  })

  it('returns the correct string representation (empty)', () => {
    const date = new MesopotamianDate({
      year: { value: '' },
      month: { value: '' },
      day: { value: '' },
      king,
    })
    expect(date.toString()).toBe('Sargon (ca. 2334–2279 BCE PJC)')
  })

  it('returns the correct string representation (empty, uncertain)', () => {
    const date = new MesopotamianDate({
      year: { value: '', isUncertain: true },
      month: { value: '' },
      day: { value: '' },
      king,
    })
    expect(date.toString()).toBe('∅.∅.∅? Sargon (ca. 2334–2279 BCE PJC)')
  })

  it('returns the correct string representation (broken, missing)', () => {
    const date = new MesopotamianDate({
      year: { value: '', isBroken: true },
      month: { value: '', isBroken: true, isIntercalary: true },
      day: { value: '', isBroken: true },
      king,
    })
    expect(date.toString()).toBe('[x].[x]².[x] Sargon (ca. 2334–2279 BCE PJC)')
  })

  it('returns the correct string representation (broken, reconstructed)', () => {
    const date = new MesopotamianDate({
      year: { value: '1', isBroken: true },
      month: { value: '2', isBroken: true, isIntercalary: true },
      day: { value: '3', isBroken: true },
      king,
    })
    expect(date.toString()).toBe('[3].[II²].[1] Sargon (ca. 2334 BCE PJC)')
  })

  it('returns the correct string representation (uncertain)', () => {
    const date = new MesopotamianDate({
      year: { value: '1', isUncertain: true },
      month: { value: '2', isUncertain: true, isIntercalary: true },
      day: { value: '3', isUncertain: true },
      king,
    })
    expect(date.toString()).toBe('3?.II²?.1? Sargon (ca. 2334 BCE PJC)')
  })

  it('returns the correct string representation (broken and uncertain)', () => {
    const date = new MesopotamianDate({
      year: { value: '1', isBroken: true, isUncertain: true },
      month: {
        value: '2',
        isBroken: true,
        isUncertain: true,
        isIntercalary: true,
      },
      day: { value: '3', isBroken: true, isUncertain: true },
      king,
    })
    expect(date.toString()).toBe('[3]?.[II²]?.[1]? Sargon (ca. 2334 BCE PJC)')
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
