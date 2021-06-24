import { periodModifiers, PeriodModifiers, periods, Periods } from './period'

test.each(Object.values(PeriodModifiers))(
  '%s is in periodModifiers',
  (modifier) => {
    expect(periodModifiers).toContain(modifier)
  }
)

test.each(Object.values(Periods))('%s is in periods', (period) => {
  expect(periods).toContain(period)
})
