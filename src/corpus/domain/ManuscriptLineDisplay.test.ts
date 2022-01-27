import { singleRuling } from 'test-support/lines/dollar'
import note from 'test-support/lines/note'
import { ManuscriptLineDisplay } from './line-details'
import { ManuscriptTypes } from './manuscript'
import { PeriodModifiers, Periods } from './period'
import { Provenances } from './provenance'
import textLine from 'test-support/lines/text-line'

test('dollarLines', () => {
  const line = new ManuscriptLineDisplay(
    Provenances.Assyria,
    PeriodModifiers.Early,
    Periods.Persian,
    ManuscriptTypes.Library,
    'a',
    ['r'],
    textLine,
    [note, singleRuling]
  )
  expect(line.dollarLines).toEqual([singleRuling])
})
