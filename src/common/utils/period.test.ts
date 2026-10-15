import { testContainsAllValues } from 'test-support/test-values-complete'
import {
  periodModifiers,
  PeriodModifiers,
  periods,
  Periods,
} from 'common/utils/period'

testContainsAllValues(PeriodModifiers, periodModifiers, 'period modifiers')
testContainsAllValues(Periods, periods, 'periods')
