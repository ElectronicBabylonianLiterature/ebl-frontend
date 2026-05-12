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
    type ApproxCase = {
      label: string
      year: string
      month: string
      day: string
      isSeleucidEra: boolean
      converterArgs:
        | {
            type: 'mesopotamian'
            king: string
            y: number
            m: number
            d: number
          }
        | { type: 'seleucid'; y: number; m: number; d: number }
      expectsCa: boolean
    }

    const cases: ApproxCase[] = [
      {
        label: 'n+ day pattern (Nabonassar era)',
        year: '3',
        month: '6',
        day: '16+',
        isSeleucidEra: false,
        converterArgs: {
          type: 'mesopotamian',
          king: 'Cambyses',
          y: 3,
          m: 6,
          d: 16,
        },
        expectsCa: true,
      },
      {
        label: 'exact day pattern (Nabonassar era)',
        year: '3',
        month: '6',
        day: '16',
        isSeleucidEra: false,
        converterArgs: {
          type: 'mesopotamian',
          king: 'Cambyses',
          y: 3,
          m: 6,
          d: 16,
        },
        expectsCa: false,
      },
      {
        label: 'n-n day range pattern (Nabonassar era)',
        year: '3',
        month: '6',
        day: '16-17',
        isSeleucidEra: false,
        converterArgs: {
          type: 'mesopotamian',
          king: 'Cambyses',
          y: 3,
          m: 6,
          d: 16,
        },
        expectsCa: true,
      },
      {
        label: 'x+n day pattern (Seleucid era)',
        year: '1',
        month: '5',
        day: 'x+3',
        isSeleucidEra: true,
        converterArgs: { type: 'seleucid', y: 1, m: 5, d: 3 },
        expectsCa: true,
      },
      {
        label: 'n/n month pattern (Seleucid era)',
        year: '1',
        month: '5/6',
        day: '16',
        isSeleucidEra: true,
        converterArgs: { type: 'seleucid', y: 1, m: 5, d: 16 },
        expectsCa: true,
      },
    ]

    it.each(cases)(
      '$expectsCa ? adds : does not add ca. for $label',
      ({ year, month, day, isSeleucidEra, converterArgs, expectsCa }) => {
        const converter = new DateConverter()
        if (converterArgs.type === 'mesopotamian') {
          converter.setToMesopotamianDate(
            converterArgs.king,
            converterArgs.y,
            converterArgs.m,
            converterArgs.d,
          )
        } else {
          converter.setToSeBabylonianDate(
            converterArgs.y,
            converterArgs.m,
            converterArgs.d,
          )
        }

        const date = new MesopotamianDate({
          year: { value: year },
          month: { value: month },
          day: { value: day },
          ...(isSeleucidEra ? { isSeleucidEra: true } : { king: cambysesKing }),
        })

        const julian = converter.toDateString('Julian')
        expect(date.toModernDate()).toBe(expectsCa ? `ca. ${julian}` : julian)
      },
    )
  })
})
