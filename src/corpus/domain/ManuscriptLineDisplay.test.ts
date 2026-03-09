import { singleRuling } from 'test-support/lines/dollar'
import note from 'test-support/lines/note'
import { ManuscriptLineDisplay } from './line-details'
import { ManuscriptTypes } from './manuscript'
import { PeriodModifiers, Periods } from 'common/period'
import { Provenances } from './provenance'
import textLine from 'test-support/lines/text-line'
import { manuscriptLineDisplayFactory } from 'test-support/line-details-fixtures'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import { joinFactory } from 'test-support/join-fixtures'
import { oldSiglumFactory } from 'test-support/old-siglum-fixtures'

test('constructor', () => {
  const provenance = Provenances.Assyria
  const modifier = PeriodModifiers.Early
  const period = Periods.Persian
  const type = ManuscriptTypes.Library
  const disambiguator = 'a'
  const oldSigla = [oldSiglumFactory.build()]
  const labels = ['r']
  const line = textLine
  const paratext = [note, singleRuling]
  const references = [referenceFactory.build()]
  const joins = [[joinFactory.build()]]
  const museumNumber = 'X.1'
  const isInFragmentarium = false
  const accession = 'A 42'

  const manuscriptLineDisplay = new ManuscriptLineDisplay(
    provenance,
    modifier,
    period,
    type,
    disambiguator,
    oldSigla,
    labels,
    line,
    paratext,
    references,
    joins,
    museumNumber,
    isInFragmentarium,
    accession,
  )

  expect(manuscriptLineDisplay.provenance).toEqual(provenance)
  expect(manuscriptLineDisplay.periodModifier).toEqual(modifier)
  expect(manuscriptLineDisplay.period).toEqual(period)
  expect(manuscriptLineDisplay.type).toEqual(type)
  expect(manuscriptLineDisplay.siglumDisambiguator).toEqual(disambiguator)
  expect(manuscriptLineDisplay.oldSigla).toEqual(oldSigla)
  expect(manuscriptLineDisplay.labels).toEqual(labels)
  expect(manuscriptLineDisplay.line).toEqual(line)
  expect(manuscriptLineDisplay.paratext).toEqual(paratext)
  expect(manuscriptLineDisplay.references).toEqual(references)
  expect(manuscriptLineDisplay.joins).toEqual(joins)
  expect(manuscriptLineDisplay.museumNumber).toEqual(museumNumber)
  expect(manuscriptLineDisplay.isInFragmentarium).toEqual(isInFragmentarium)
  expect(manuscriptLineDisplay.accession).toEqual(accession)
})

test.each([
  [manuscriptLineDisplayFactory.build(), false],
  [manuscriptLineDisplayFactory.standardText().build(), true],
])('isStandardText', (line, expected) => {
  expect(line.isStandardText).toEqual(expected)
})

test.each([
  [manuscriptLineDisplayFactory.build(), false],
  [manuscriptLineDisplayFactory.parallelText().build(), true],
])('isStandardText', (line, expected) => {
  expect(line.isParallelText).toEqual(expected)
})

describe.each([
  [[], []],
  [[], [note]],
  [[singleRuling], []],
  [[singleRuling], [note]],
  [[singleRuling, singleRuling], []],
  [[], [note, note]],
])('paratext %s', (dollarLines, noteLines) => {
  const line = manuscriptLineDisplayFactory.build(
    {},
    { associations: { paratext: [...dollarLines, ...noteLines] } },
  )
  test('dollarLines', () => expect(line.dollarLines).toEqual(dollarLines))
  test('hasNotelines', () =>
    expect(line.hasNotes).toEqual(noteLines.length > 0))
  test('noteLines', () => expect(line.noteLines).toEqual(noteLines))
})
