import _ from 'lodash'
import {
  createFragment,
  createFragmentInfo,
  createJoins,
} from 'fragmentarium/infrastructure/createFragment'
import { fragmentDto } from 'test-support/test-fragment'
import FragmentDto from 'fragmentarium/domain/FragmentDtos'

const optionalKeys = [
  'accession',
  'acquisition',
  'joins',
  'folios',
  'record',
  'references',
  'uncuratedReferences',
  'genres',
  'projects',
  'dossiers',
  'date',
  'datesInText',
  'archaeology',
  'colophon',
]

function sparseFragmentDto(): FragmentDto {
  const dto = _.omit(_.cloneDeep(fragmentDto), optionalKeys)
  return {
    ...dto,
    length: {},
    width: {},
    thickness: {},
  } as unknown as FragmentDto
}

test('Every optional field the backend omits falls back to an empty value', () => {
  const fragment = createFragment(sparseFragmentDto())

  expect(fragment.accession).toEqual('')
  expect(fragment.acquisition).toBeNull()
  expect(fragment.joins).toEqual([])
  expect(fragment.folios).toEqual([])
  expect(fragment.record).toEqual([])
  expect(fragment.references).toEqual([])
  expect(fragment.uncuratedReferences).toBeNull()
  expect(fragment.genres.genres).toEqual([])
  expect(fragment.projects).toEqual([])
  expect(fragment.dossiers).toEqual([])
  expect(fragment.date).toBeUndefined()
  expect(fragment.datesInText).toEqual([])
  expect(fragment.archaeology).toBeUndefined()
  expect(fragment.colophon).toBeUndefined()
})

test('Measures without values become null', () => {
  const measures = createFragment(sparseFragmentDto()).measures

  expect(measures).toEqual({
    length: null,
    width: null,
    thickness: null,
    lengthNote: null,
    widthNote: null,
    thicknessNote: null,
  })
})

test('An absent join group is treated as empty', () => {
  expect(createJoins([undefined])).toEqual([[]])
})

test('An absent join list is treated as empty', () => {
  expect(createJoins(undefined)).toEqual([])
})

test('A fragment info without an accession gets an empty one', () => {
  const info = createFragmentInfo({
    ..._.omit(_.cloneDeep(fragmentDto), ['accession']),
  } as never)

  expect(info.accession).toEqual('')
})
