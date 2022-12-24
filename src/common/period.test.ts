import { testContainsAllValues } from 'test-support/test-values-complete'
import { periodModifiers, PeriodModifiers, periods, Periods } from './period'

testContainsAllValues(PeriodModifiers, periodModifiers, 'period modifiers')
testContainsAllValues(Periods, periods, 'periods')
