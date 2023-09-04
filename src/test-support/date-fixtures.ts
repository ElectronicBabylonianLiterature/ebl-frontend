import { Factory } from 'fishery'
import { MesopotamianDate, Ur3Calendar } from 'fragmentarium/domain/Date'
import Chance from 'chance'
import BrinkmanKings from 'common/BrinkmanKings.json'
import { EponymsNeoAssyrian } from 'common/Eponyms'

const chance = new Chance()

export const mesopotamianDateFactory = Factory.define<MesopotamianDate>(() => {
  const isSeleucidEra = chance.bool()
  const isAssyrianDate = isSeleucidEra ? false : chance.bool()
  const king =
    isSeleucidEra || isAssyrianDate ? undefined : chance.pickone(BrinkmanKings)
  const year = {
    value: chance.integer({ min: 1, max: 25 }).toString(),
    isBroken: chance.bool(),
    isUncertain: chance.bool(),
  }
  const eponym = isAssyrianDate ? chance.pickone(EponymsNeoAssyrian) : undefined
  const ur3Calendar =
    king && king.dynastyNumber === '2'
      ? chance.pickone(Object.values(Ur3Calendar))
      : undefined

  return new MesopotamianDate(
    year,
    {
      value: chance.integer({ min: 1, max: 12 }).toString(),
      isBroken: chance.bool(),
      isUncertain: chance.bool(),
      isIntercalary: chance.bool(),
    },
    {
      value: chance.integer({ min: 1, max: 29 }).toString(),
      isBroken: chance.bool(),
      isUncertain: chance.bool(),
    },
    king,
    eponym,
    isSeleucidEra,
    isAssyrianDate,
    ur3Calendar
  )
})
