import { Eponym } from 'chronology/ui/DateEditor/Eponyms'
import { MesopotamianDate } from 'chronology/domain/Date'
import { Ur3Calendar } from 'chronology/domain/DateParameters'
import DateConverter from 'chronology/domain/DateConverter'

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

const cambysesKing = {
  orderGlobal: 168,
  dynastyNumber: '14',
  dynastyName: 'Persian Rulers',
  orderInDynasty: '2',
  name: 'Cambyses',
  date: '529–522',
  totalOfYears: '8',
  notes: '',
}

const nabonidusKing = {
  orderGlobal: 166,
  dynastyNumber: '13',
  dynastyName: 'Neo-Babylonian Dynasty',
  orderInDynasty: '6',
  name: 'Nabonidus',
  date: '555–539',
  totalOfYears: '17',
  notes: '',
}

const rimushKing = {
  orderGlobal: 2,
  dynastyNumber: '1',
  dynastyName: 'Dynasty of Akkad',
  orderInDynasty: '2',
  name: 'Rimuš',
  date: '2278–2270',
  totalOfYears: '9?',
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

    it('preserves king broken and uncertain flags from JSON', () => {
      const json = {
        year: { value: '2023' },
        month: { value: '5' },
        day: { value: '12' },
        king: {
          orderGlobal: 1,
          isBroken: true,
          isUncertain: true,
        },
      }

      const date = MesopotamianDate.fromJson(json)

      expect(date.king?.name).toBe('Sargon')
      expect(date.king?.isBroken).toBe(true)
      expect(date.king?.isUncertain).toBe(true)
    })

    it.each([
      [{ isBroken: true, isUncertain: false }],
      [{ isBroken: false, isUncertain: true }],
      [{ isBroken: false, isUncertain: false }],
    ])('preserves king flags %p from JSON', (flags) => {
      const json = {
        year: { value: '2023' },
        month: { value: '5' },
        day: { value: '12' },
        king: { orderGlobal: 1, ...flags },
      }

      const date = MesopotamianDate.fromJson(json)

      expect(date.king?.isBroken).toBe(flags.isBroken)
      expect(date.king?.isUncertain).toBe(flags.isUncertain)
    })

    it('leaves king flags undefined when JSON omits them', () => {
      const json = {
        year: { value: '2023' },
        month: { value: '5' },
        day: { value: '12' },
        king: { orderGlobal: 1 },
      }

      const date = MesopotamianDate.fromJson(json)

      expect(date.king?.name).toBe('Sargon')
      expect(date.king?.isBroken).toBeUndefined()
      expect(date.king?.isUncertain).toBeUndefined()
    })

    it('preserves king broken and uncertain flags through toDto', () => {
      const date = new MesopotamianDate({
        year: { value: '2023' },
        month: { value: '5' },
        day: { value: '12' },
        king: { ...king, isBroken: true, isUncertain: true },
      })

      const dto = date.toDto()

      expect(dto.king?.orderGlobal).toBe(1)
      expect(dto.king?.isBroken).toBe(true)
      expect(dto.king?.isUncertain).toBe(true)
    })

    it('round-trips king broken and uncertain flags through toDto and fromJson', () => {
      const original = new MesopotamianDate({
        year: { value: '2023' },
        month: { value: '5' },
        day: { value: '12' },
        king: { ...king, isBroken: true, isUncertain: true },
      })

      const restored = MesopotamianDate.fromJson(original.toDto())

      expect(restored.king?.name).toBe('Sargon')
      expect(restored.king?.isBroken).toBe(true)
      expect(restored.king?.isUncertain).toBe(true)
    })

    it('round-trips year-0 date: toDto preserves original king and year-0 so fromJson restores them', () => {
      const original = new MesopotamianDate({
        year: { value: '0' },
        month: { value: '1' },
        day: { value: '1' },
        king: nabonidusKing,
        isSeleucidEra: false,
      })

      const dto = original.toDto()

      expect(dto.king?.orderGlobal).toBe(166)
      expect(dto.year.value).toBe('0')

      const restored = MesopotamianDate.fromJson(dto)

      expect(restored.zeroYearKing?.name).toBe('Nabonidus')
      expect(restored.yearZero?.value).toBe('0')
      expect(restored.king?.name).toBe('Neriglissar')
      expect(restored.year.value).toBe('4')
      expect(restored.toString()).toContain('1.I.0 Nabonidus')
      expect(restored.toModernDate()).toBe(original.toModernDate())
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
      '12.V.10 SE (30 August 302 BCE PJC | 25 August 302 BCE PGC)',
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
      '∅.V.10 SE (ca. 19 August - 16 September 302 BCE PJC | ca. 14 August - 11 September 302 BCE PGC)',
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
      '12.∅.10 SE (ca. 4 May 302 - 24 March 301 BCE PJC | ca. 29 April 302 - 20 March 301 BCE PGC)',
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

  it('renders reconstructed and emended year metadata in the year display', () => {
    const date = new MesopotamianDate({
      year: { value: '136', isReconstructed: true, isEmended: true },
      month: { value: '5' },
      day: { value: '12' },
      isSeleucidEra: true,
    })

    expect(date.toString()).toContain('12.V.<136>! SE')
  })

  it('converts wrapped year values without failing the Seleucid date conversion', () => {
    const wrappedDate = new MesopotamianDate({
      year: { value: '<136>' },
      month: { value: '5' },
      day: { value: '12' },
      isSeleucidEra: true,
    })
    const plainDate = new MesopotamianDate({
      year: { value: '136', isReconstructed: true },
      month: { value: '5' },
      day: { value: '12' },
      isSeleucidEra: true,
    })

    expect(wrappedDate.toModernDate()).toBe(plainDate.toModernDate())
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
      '12.V.10 Darius I (11 August 512 BCE PJC | 5 August 512 BCE PGC)',
    )
  })

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

  it('returns the correct string representation (Nabonassar era, no year)', () => {
    const date = new MesopotamianDate({
      year: { value: '10' },
      month: { value: '5' },
      day: { value: '' },
      king: nabonassarEraKing,
      isSeleucidEra: false,
    })
    expect(date.toString()).toBe(
      '∅.V.10 Darius I (ca. 31 July - 29 August 512 BCE PJC | ca. 25 July - 23 August 512 BCE PGC)',
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
      '12.∅.10 Darius I (ca. 16 April 512 - 6 March 511 BCE PJC | ca. 10 April 512 - 28 February 511 BCE PGC)',
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
      '∅.V.10 Darius I (ca. 31 July - 29 August 512 BCE PJC | ca. 25 July - 23 August 512 BCE PGC)',
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
      'Darius I (ca. 14 April 521 - 5 April 485 BCE PJC | ca. 8 April 521 - 31 March 485 BCE PGC)',
    )
  })

  it('uses intercalary month metadata for Nabonassar-era conversion', () => {
    const date = new MesopotamianDate({
      year: { value: '3' },
      month: { value: '6', isIntercalary: true },
      day: { value: '16' },
      king: cambysesKing,
    })

    const converter = new DateConverter()
    converter.setToMesopotamianDate('Cambyses', 3, 13, 16)

    expect(date.toModernDate()).toBe(converter.toDateString('Julian'))
  })

  it('uses intercalary XII month metadata for Nabonassar-era conversion', () => {
    const date = new MesopotamianDate({
      year: { value: '5' },
      month: { value: '12', isIntercalary: true },
      day: { value: '16' },
      king: cambysesKing,
    })

    const converter = new DateConverter()
    converter.setToMesopotamianDate('Cambyses', 5, 14, 16)

    expect(date.toModernDate()).toBe(converter.toDateString('Julian'))
  })

  it('uses intercalary XII month metadata for Seleucid-era conversion', () => {
    const date = new MesopotamianDate({
      year: { value: '1' },
      month: { value: '12', isIntercalary: true },
      day: { value: '16' },
      isSeleucidEra: true,
    })

    const converter = new DateConverter()
    converter.setToSeBabylonianDate(1, 14, 16)

    expect(date.toModernDate()).toBe(converter.toDateString('Julian'))
  })

  it('falls back intercalary VI metadata for Seleucid-era conversion when month 13 is unavailable', () => {
    const date = new MesopotamianDate({
      year: { value: '2' },
      month: { value: '6', isIntercalary: true },
      day: { value: '16' },
      isSeleucidEra: true,
    })

    const converter = new DateConverter()
    converter.setToSeBabylonianDate(2, 6, 16)

    expect(date.toModernDate()).toBe(converter.toDateString('Julian'))
  })

  it('falls back intercalary XII metadata for Nabonassar-era conversion when month 14 is unavailable', () => {
    const date = new MesopotamianDate({
      year: { value: '1' },
      month: { value: '12', isIntercalary: true },
      day: { value: '16' },
      king: cambysesKing,
    })

    const converter = new DateConverter()
    converter.setToMesopotamianDate('Cambyses', 1, 12, 16)

    expect(date.toModernDate()).toBe(converter.toDateString('Julian'))
  })

  it('falls back intercalary XII metadata for partial Seleucid range when month 14 is unavailable', () => {
    const intercalaryDate = new MesopotamianDate({
      year: { value: '2' },
      month: { value: '12', isIntercalary: true },
      day: { value: '' },
      isSeleucidEra: true,
    })

    const regularDate = new MesopotamianDate({
      year: { value: '2' },
      month: { value: '12' },
      day: { value: '' },
      isSeleucidEra: true,
    })

    expect(intercalaryDate.toModernDate()).toBe(regularDate.toModernDate())
  })

  it('falls back intercalary XII metadata for partial Nabonassar range when month 14 is unavailable', () => {
    const intercalaryDate = new MesopotamianDate({
      year: { value: '1' },
      month: { value: '12', isIntercalary: true },
      day: { value: '' },
      king: cambysesKing,
    })

    const regularDate = new MesopotamianDate({
      year: { value: '1' },
      month: { value: '12' },
      day: { value: '' },
      king: cambysesKing,
    })

    expect(intercalaryDate.toModernDate()).toBe(regularDate.toModernDate())
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
      '12.V.10 Amar-Suen, Ur calendar (ca. 2035 BCE PJC)',
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
      '1.I.1 Adad-nērārī (II) (NA eponym) (ca. 910 BCE PJC)',
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
