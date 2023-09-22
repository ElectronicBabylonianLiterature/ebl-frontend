import { Eponym } from 'common/Eponyms'
import { MesopotamianDate, Ur3Calendar } from './Date' // Adjust the import path

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
      const date = new MesopotamianDate(
        { value: '10' },
        { value: '5' },
        { value: '12' },
        king
      )
      expect(date.toString()).toBe('12.V.10 Sargon (ca. 2325 BCE)')
    })
  })

  it('returns the correct string representation (Seleucid)', () => {
    const date = new MesopotamianDate(
      { value: '10' },
      { value: '5' },
      { value: '12' },
      undefined,
      undefined,
      true
    )
    expect(date.toString()).toBe('12.V.10 SE (30 August 302 BCE)')
  })

  it('returns the correct string representation (Ur III)', () => {
    const date = new MesopotamianDate(
      { value: '10' },
      { value: '5' },
      { value: '12' },
      kingUr3,
      undefined,
      undefined,
      false,
      Ur3Calendar.UR
    )
    expect(date.toString()).toBe(
      '12.V.10 Amar-Suen, Ur calendar (ca. 2035 BCE)'
    )
  })

  it('returns the correct string representation (Assyrian date with eponym)', () => {
    const date = new MesopotamianDate(
      { value: '1' },
      { value: '1' },
      { value: '1' },
      undefined,
      eponym,
      undefined,
      true,
      undefined
    )

    expect(date.toString()).toBe(
      '1.I.1 Adad-nērārī (II) (NA eponym) (ca. 910 BCE)'
    )
  })

  it('returns the correct string representation (empty)', () => {
    const date = new MesopotamianDate(
      { value: '' },
      { value: '' },
      { value: '' },
      king
    )
    expect(date.toString()).toBe('∅.∅.∅ Sargon (ca. 2334–2279 BCE)')
  })

  it('returns the correct string representation (empty)', () => {
    const date = new MesopotamianDate(
      { value: '' },
      { value: '' },
      { value: '' },
      king
    )
    expect(date.toString()).toBe('∅.∅.∅ Sargon (ca. 2334–2279 BCE)')
  })

  it('returns the correct string representation (broken)', () => {
    const date = new MesopotamianDate(
      { value: '1', isBroken: true },
      { value: '2', isBroken: true, isIntercalary: true },
      { value: '3', isBroken: true },
      king
    )

    expect(date.toString()).toBe('[x].[x]².[x] Sargon (ca. 2334–2279 BCE)')
  })

  it('returns the correct string representation (uncertain)', () => {
    const date = new MesopotamianDate(
      { value: '1', isUncertain: true },
      { value: '2', isUncertain: true, isIntercalary: true },
      { value: '3', isUncertain: true },
      king
    )
    expect(date.toString()).toBe('3?.II²?.1? Sargon (ca. 2334 BCE)')
  })

  it('returns the correct string representation (broken and uncertain)', () => {
    const date = new MesopotamianDate(
      { value: '1', isBroken: true, isUncertain: true },
      { value: '2', isBroken: true, isUncertain: true, isIntercalary: true },
      { value: '3', isBroken: true, isUncertain: true },
      king
    )
    expect(date.toString()).toBe('[x]?.[x]²?.[x]? Sargon (ca. 2334–2279 BCE)')
  })

  describe('toModernDate branching', () => {
    it('returns empty when none of the conditions are met', () => {
      const date = new MesopotamianDate(
        { value: '1' },
        { value: '1' },
        { value: '1' }
      )
      expect(date.toModernDate()).toBe('')
    })

    it('returns the correct modern date for a king without orderGlobal', () => {
      const unorderedKing = { ...king, orderGlobal: -1 }
      const date = new MesopotamianDate(
        { value: '10' },
        { value: '5' },
        { value: '12' },
        unorderedKing
      )
      expect(date.toModernDate()).toBe('ca. 2325 BCE')
    })
  })

  it('handles king with orderGlobal matching rulerToBrinkmanKings', () => {
    const kingWithSpecificOrder = { ...king, orderGlobal: 1 }
    const date = new MesopotamianDate(
      { value: '1' },
      { value: '1' },
      { value: '1' },
      kingWithSpecificOrder
    )

    const result = date.toModernDate()
    expect(result).toBe('ca. 2334 BCE')
  })

  it('handles king without a date', () => {
    const kingWithoutDate = { ...king, date: '' }
    const date = new MesopotamianDate(
      { value: '1' },
      { value: '1' },
      { value: '1' },
      kingWithoutDate
    )

    expect(date.toModernDate()).toBe('')
  })
})
