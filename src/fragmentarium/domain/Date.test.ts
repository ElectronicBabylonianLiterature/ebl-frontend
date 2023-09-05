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

  describe('converts to string', () => {
    it('returns the correct string representation (standard)', () => {
      const date = new MesopotamianDate(
        { value: '10' },
        { value: '5' },
        { value: '12' },
        king
      )
      expect(date.toString()).toBe('12.V.10 Sargon')
    })
  })

  it('returns the correct string representation (Seleucid)', () => {
    const date = new MesopotamianDate(
      { value: '10' },
      { value: '5' },
      { value: '12' },
      undefined,
      true
    )
    expect(date.toString()).toBe('12.V.10 SE')
  })

  it('returns the correct string representation (Ur III)', () => {
    const date = new MesopotamianDate(
      { value: '10' },
      { value: '5' },
      { value: '12' },
      kingUr3,
      false,
      Ur3Calendar.UR
    )

    expect(date.toString()).toBe('12.V.10 Amar-Suen, Ur calendar')
  })

  it('returns the correct string representation (empty)', () => {
    const date = new MesopotamianDate(
      { value: '' },
      { value: '' },
      { value: '' },
      king
    )

    expect(date.toString()).toBe('∅.∅.∅ Sargon')
  })

  it('returns the correct string representation (empty)', () => {
    const date = new MesopotamianDate(
      { value: '' },
      { value: '' },
      { value: '' },
      king
    )

    expect(date.toString()).toBe('∅.∅.∅ Sargon')
  })

  it('returns the correct string representation (broken)', () => {
    const date = new MesopotamianDate(
      { value: '1', isBroken: true },
      { value: '2', isBroken: true, isIntercalary: true },
      { value: '3', isBroken: true },
      king
    )

    expect(date.toString()).toBe('[x].[x]².[x] Sargon')
  })

  it('returns the correct string representation (uncertain)', () => {
    const date = new MesopotamianDate(
      { value: '1', isUncertain: true },
      { value: '2', isUncertain: true, isIntercalary: true },
      { value: '3', isUncertain: true },
      king
    )

    expect(date.toString()).toBe('3?.II²?.1? Sargon')
  })

  it('returns the correct string representation (broken and uncertain)', () => {
    const date = new MesopotamianDate(
      { value: '1', isBroken: true, isUncertain: true },
      { value: '2', isBroken: true, isUncertain: true, isIntercalary: true },
      { value: '3', isBroken: true, isUncertain: true },
      king
    )

    expect(date.toString()).toBe('[x]?.[x]²?.[x]? Sargon')
  })
})
