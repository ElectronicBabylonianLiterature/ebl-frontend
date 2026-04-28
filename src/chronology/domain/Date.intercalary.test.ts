import { MesopotamianDate } from 'chronology/domain/Date'
import DateConverter from 'chronology/domain/DateConverter'
import { cambysesKing } from 'test-support/date-fixtures'

describe('MesopotamianDate', () => {
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

  describe('adds ca. prefix for approximate date field patterns', () => {
    it('adds ca. for n+ day pattern (Nabonassar era)', () => {
      const converter = new DateConverter()
      converter.setToMesopotamianDate('Cambyses', 3, 6, 16)

      const date = new MesopotamianDate({
        year: { value: '3' },
        month: { value: '6' },
        day: { value: '16+' },
        king: cambysesKing,
      })

      expect(date.toModernDate()).toBe(
        `ca. ${converter.toDateString('Julian')}`,
      )
    })

    it('does not add ca. for exact day pattern (Nabonassar era)', () => {
      const converter = new DateConverter()
      converter.setToMesopotamianDate('Cambyses', 3, 6, 16)

      const date = new MesopotamianDate({
        year: { value: '3' },
        month: { value: '6' },
        day: { value: '16' },
        king: cambysesKing,
      })

      expect(date.toModernDate()).toBe(converter.toDateString('Julian'))
    })

    it('adds ca. for n-n day range pattern (Nabonassar era)', () => {
      const converter = new DateConverter()
      converter.setToMesopotamianDate('Cambyses', 3, 6, 16)

      const date = new MesopotamianDate({
        year: { value: '3' },
        month: { value: '6' },
        day: { value: '16-17' },
        king: cambysesKing,
      })

      expect(date.toModernDate()).toBe(
        `ca. ${converter.toDateString('Julian')}`,
      )
    })

    it('adds ca. for x+n day pattern (Seleucid era)', () => {
      const converter = new DateConverter()
      converter.setToSeBabylonianDate(1, 5, 3)

      const date = new MesopotamianDate({
        year: { value: '1' },
        month: { value: '5' },
        day: { value: 'x+3' },
        isSeleucidEra: true,
      })

      expect(date.toModernDate()).toBe(
        `ca. ${converter.toDateString('Julian')}`,
      )
    })

    it('adds ca. for n/n month pattern (Seleucid era)', () => {
      const converter = new DateConverter()
      converter.setToSeBabylonianDate(1, 5, 16)

      const date = new MesopotamianDate({
        year: { value: '1' },
        month: { value: '5/6' },
        day: { value: '16' },
        isSeleucidEra: true,
      })

      expect(date.toModernDate()).toBe(
        `ca. ${converter.toDateString('Julian')}`,
      )
    })
  })
})
