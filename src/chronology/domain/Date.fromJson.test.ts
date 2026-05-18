import { MesopotamianDate } from 'chronology/domain/Date'
import { Ur3Calendar } from 'chronology/domain/DateParameters'
import { king, nabonidusKing } from 'test-support/date-fixtures'

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
})
