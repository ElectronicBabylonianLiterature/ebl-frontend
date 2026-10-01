import { mesopotamianDateFactory } from 'test-support/date-fixtures'

const dates = mesopotamianDateFactory.buildList(1000)

test('Seleucid era dates have neither king nor eponym', () => {
  dates
    .filter((date) => date.isSeleucidEra)
    .forEach((date) => {
      expect(date.isAssyrianDate).toBe(false)
      expect(date.king).toBeUndefined()
      expect(date.eponym).toBeUndefined()
    })
})

test('Assyrian dates have an eponym and no king', () => {
  dates
    .filter((date) => date.isAssyrianDate)
    .forEach((date) => {
      expect(date.eponym).toBeDefined()
      expect(date.king).toBeUndefined()
    })
})

test('only Ur III kings get an Ur III calendar', () => {
  dates.forEach((date) => {
    expect(date.ur3Calendar !== undefined).toBe(
      date.king?.dynastyNumber === '2',
    )
  })
})

test('the factory produces every kind of date', () => {
  expect(dates.some((date) => date.isSeleucidEra)).toBe(true)
  expect(dates.some((date) => date.isAssyrianDate)).toBe(true)
  expect(dates.some((date) => date.king)).toBe(true)
  expect(dates.some((date) => date.ur3Calendar)).toBe(true)
})
