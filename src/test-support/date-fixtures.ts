import { Factory } from 'fishery'
import { MesopotamianDate } from 'chronology/domain/Date'
import { Ur3Calendar } from 'chronology/domain/DateBase'
import Chance from 'chance'
import Kings from 'chronology/domain/Kings.json'
import { Eponym, eponymsNeoAssyrian } from 'chronology/ui/DateEditor/Eponyms'

export const king = {
  orderGlobal: 1,
  dynastyNumber: '1',
  dynastyName: 'Dynasty of Akkad',
  orderInDynasty: '1',
  name: 'Sargon',
  date: '2334–2279',
  totalOfYears: '56?',
  notes: '',
}

export const kingUr3 = {
  orderGlobal: 14,
  dynastyNumber: '2',
  dynastyName: 'Third Dynasty of Ur',
  orderInDynasty: '3',
  name: 'Amar-Suen',
  date: '2044–2036',
  totalOfYears: '9',
  notes: '',
}

export const eponym = {
  date: '910',
  name: 'Adad-nērārī (II)',
  title: 'king',
  isKing: true,
  phase: 'NA',
} as Eponym

export const nabonassarEraKing = {
  orderGlobal: 172,
  dynastyNumber: '14',
  dynastyName: 'Persian Rulers',
  orderInDynasty: '3',
  name: 'Darius I',
  date: '521–486',
  totalOfYears: '36',
  notes: '',
}

export const cambysesKing = {
  orderGlobal: 168,
  dynastyNumber: '14',
  dynastyName: 'Persian Rulers',
  orderInDynasty: '2',
  name: 'Cambyses',
  date: '529–522',
  totalOfYears: '8',
  notes: '',
}

export const nabonidusKing = {
  orderGlobal: 166,
  dynastyNumber: '13',
  dynastyName: 'Neo-Babylonian Dynasty',
  orderInDynasty: '6',
  name: 'Nabonidus',
  date: '555–539',
  totalOfYears: '17',
  notes: '',
}

export const rimushKing = {
  orderGlobal: 2,
  dynastyNumber: '1',
  dynastyName: 'Dynasty of Akkad',
  orderInDynasty: '2',
  name: 'Rimuš',
  date: '2278–2270',
  totalOfYears: '9?',
  notes: '',
}

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
