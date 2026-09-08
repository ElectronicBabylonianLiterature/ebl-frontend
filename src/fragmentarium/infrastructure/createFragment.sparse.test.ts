import _ from 'lodash'
import {
  createFragment,
  createFragmentInfo,
  createJoins,
  createScript,
} from 'fragmentarium/infrastructure/createFragment'
import { fragmentDto } from 'test-support/test-fragment'
import FragmentDto from 'fragmentarium/domain/FragmentDtos'
import { ScriptDto } from 'fragmentarium/domain/fragment'

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

test('A script without an uncertainty flag is treated as certain', () => {
  const script = createScript({
    period: 'Neo-Assyrian',
    periodModifier: 'None',
  } as unknown as ScriptDto)

  expect(script.uncertain).toBe(false)
})

test('Archaeology and colophon are constructed when the backend sends them', () => {
  const dto = {
    ...sparseFragmentDto(),
    archaeology: { excavationNumber: { prefix: 'X', number: '1', suffix: '' } },
    colophon: { individuals: [] },
  } as unknown as FragmentDto

  const fragment = createFragment(dto)

  expect(fragment.archaeology?.excavationNumber).toEqual('X.1')
  expect(fragment.colophon?.individuals).toEqual([])
})
