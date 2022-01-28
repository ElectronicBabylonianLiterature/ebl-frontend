import { singleRuling } from 'test-support/lines/dollar'
import note from 'test-support/lines/note'
import { ManuscriptLineDisplay } from './line-details'
import { ManuscriptTypes } from './manuscript'
import { PeriodModifiers, Periods } from './period'
import { Provenances } from './provenance'
import textLine from 'test-support/lines/text-line'
import { manuscriptLineDisplay } from 'test-support/line-details-fixtures'

test('constructor', () => {
  const provenance = Provenances.Assyria
  const modifier = PeriodModifiers.Early
  const period = Periods.Persian
  const type = ManuscriptTypes.Library
  const disambiguator = 'a'
  const labels = ['r']
  const line = textLine
  const paratext = [note, singleRuling]

  const manuscriptLineDisplay = new ManuscriptLineDisplay(
    provenance,
    modifier,
    period,
    type,
    disambiguator,
    labels,
    line,
    paratext
  )

  expect(manuscriptLineDisplay.provenance).toEqual(provenance)
  expect(manuscriptLineDisplay.periodModifier).toEqual(modifier)
  expect(manuscriptLineDisplay.period).toEqual(period)
  expect(manuscriptLineDisplay.type).toEqual(type)
  expect(manuscriptLineDisplay.siglumDisambiguator).toEqual(disambiguator)
  expect(manuscriptLineDisplay.labels).toEqual(labels)
  expect(manuscriptLineDisplay.line).toEqual(line)
  expect(manuscriptLineDisplay.paratext).toEqual(paratext)
})

test.each([
  [manuscriptLineDisplay.build(), false],
  [manuscriptLineDisplay.standardText().build(), true],
])('isStandardText', (line, expected) => {
  expect(line.isStandardText).toEqual(expected)
})

test.each([
  [[], []],
  [[note], []],
  [[singleRuling], [singleRuling]],
  [[note, singleRuling], [singleRuling]],
  [
    [singleRuling, singleRuling],
    [singleRuling, singleRuling],
  ],
])('dollarLines %s', (paratext, expected) => {
  const line = manuscriptLineDisplay.build({}, { associations: { paratext } })
  expect(line.dollarLines).toEqual(expected)
})
