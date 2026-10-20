import {
  bibliographyEntryFactory,
  buildBorger1957,
  buildReferenceWithContainerTitle,
  buildReferenceWithManyAuthors,
  cslDataFactory,
  cslDataWithContainerTitleShortFactory,
  referenceDtoFactory,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import {
  dictionaryLineDisplayFactory,
  lineVariantDisplayFactory,
} from 'test-support/dictionary-line-fixtures'
import {
  externalNumbersFactory,
  folioFactory,
  folioPagerFactory,
  fragmentCollection,
  fragmentDate,
  fragmentDescription,
  measuresFactory,
  recordFactory,
  scriptFactory,
  statisticsFactory,
  uncuratedReferenceFactory,
} from 'test-support/fragment-data-fixtures'
import { joinDtoFactory, joinFactory } from 'test-support/join-fixtures'
import { manuscriptLineDisplayFactory } from 'test-support/line-details-fixtures'
import {
  lineNumberFactory,
  oldLineNumberFactory,
} from 'test-support/linenumber-factory'
import { wordFactory } from 'test-support/word-fixtures'
import { afoRegisterRecordFactory } from 'test-support/afo-register-fixtures'
import { EmptyLine } from 'transliteration/domain/line'
import { ManuscriptTypes } from 'corpus/domain/manuscript'
import { Provenances } from 'corpus/domain/provenance'

const defaultBuilds: ReadonlyArray<[string, () => object]> = [
  ['cslData', () => cslDataFactory.build()],
  [
    'cslDataWithShortTitle',
    () => cslDataWithContainerTitleShortFactory.build(),
  ],
  ['bibliographyEntry', () => bibliographyEntryFactory.build()],
  ['referenceDto', () => referenceDtoFactory.build()],
  ['reference', () => referenceFactory.build()],
  ['borger1957', () => buildBorger1957()],
  [
    'referenceWithContainerTitle',
    () => buildReferenceWithContainerTitle('COPY'),
  ],
  ['referenceWithManyAuthors', () => buildReferenceWithManyAuthors()],
  ['lineVariantDisplay', () => lineVariantDisplayFactory.build()],
  ['dictionaryLineDisplay', () => dictionaryLineDisplayFactory.build()],
  ['externalNumbers', () => externalNumbersFactory.build()],
  ['folio', () => folioFactory.build()],
  ['folioPager', () => folioPagerFactory.build()],
  ['measures', () => measuresFactory.build()],
  ['record', () => recordFactory.build()],
  ['script', () => scriptFactory.build()],
  ['statistics', () => statisticsFactory.build()],
  ['uncuratedReference', () => uncuratedReferenceFactory.build()],
  ['joinDto', () => joinDtoFactory.build()],
  ['join', () => joinFactory.build()],
  ['manuscriptLineDisplay', () => manuscriptLineDisplayFactory.build()],
  ['lineNumber', () => lineNumberFactory.build()],
  ['oldLineNumber', () => oldLineNumberFactory.build()],
  ['word', () => wordFactory.build()],
  ['afoRegisterRecord', () => afoRegisterRecordFactory.build()],
]

test.each(defaultBuilds)('%s builds with default values', (_name, build) => {
  expect(build()).toEqual(expect.any(Object))
})

test('fragment data helpers produce values', () => {
  expect(fragmentDate()).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  expect(fragmentDescription().split('\n')).toHaveLength(2)
  expect(fragmentCollection()).toEqual(expect.any(String))
})

test('historical records get a date range unless a date is given', () => {
  expect(recordFactory.historical().build().date).toContain('/')
  expect(recordFactory.historical('2020-01-01').build().date).toEqual(
    '2020-01-01',
  )
})

test('manuscript line display presets', () => {
  expect(manuscriptLineDisplayFactory.standardText().build()).toMatchObject({
    provenance: Provenances['Standard Text'],
    type: ManuscriptTypes.None,
  })
  expect(manuscriptLineDisplayFactory.parallelText().build().type).toEqual(
    ManuscriptTypes.Parallel,
  )
  expect(manuscriptLineDisplayFactory.empty().build().line).toEqual(
    new EmptyLine(),
  )
})

test('word presets', () => {
  expect(wordFactory.homonymI().build().homonym).toEqual('I')
  expect(wordFactory.homonymNotI().build().homonym).not.toEqual('I')
  expect(wordFactory.verb().build().roots).toEqual(['rrr', 'ttt'])
  expect(wordFactory.verb(['abc']).build().roots).toEqual(['abc'])
  expect(wordFactory.namedEntity().build().namedEntityTags).toEqual(['PN'])
  expect(wordFactory.namedEntity(['GN']).build().namedEntityTags).toEqual([
    'GN',
  ])
})
