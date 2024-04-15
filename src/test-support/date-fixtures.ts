import { Factory } from 'fishery'
import { MesopotamianDate } from 'chronology/domain/Date'
import { Ur3Calendar } from 'chronology/domain/DateBase'
import Chance from 'chance'
import Kings from 'chronology/domain/Kings.json'
import { eponymsNeoAssyrian } from 'chronology/ui/DateEditor/Eponyms'

const chance = new Chance()

export const mesopotamianDateFactory = Factory.define<MesopotamianDate>(() => {
  const isSeleucidEra = chance.bool()
  const isAssyrianDate = isSeleucidEra ? false : chance.bool()
  const king =
    isSeleucidEra || isAssyrianDate ? undefined : chance.pickone(Kings)
  const year = {
    value: chance.integer({ min: 1, max: 25 }).toString(),
    isBroken: chance.bool(),
    isUncertain: chance.bool(),
  }
  const eponym = isAssyrianDate ? chance.pickone(eponymsNeoAssyrian) : undefined
  const ur3Calendar =
    king && king.dynastyNumber === '2'
      ? chance.pickone(Object.values(Ur3Calendar))
      : undefined

  return new MesopotamianDate({
    year,
    month: {
      value: chance.integer({ min: 1, max: 12 }).toString(),
      isBroken: chance.bool(),
      isUncertain: chance.bool(),
      isIntercalary: chance.bool(),
    },
    day: {
      value: chance.integer({ min: 1, max: 29 }).toString(),
      isBroken: chance.bool(),
      isUncertain: chance.bool(),
    },
    king,
    eponym,
    isSeleucidEra,
    isAssyrianDate,
    ur3Calendar,
  })
})
