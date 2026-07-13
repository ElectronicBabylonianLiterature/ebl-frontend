import {
  getEntryEntityType,
  getMappedEntityType,
} from 'fragmentarium/ui/text-annotation/realiaTypeMapping'
import { realiaEntryFactory } from 'test-support/realia-fixtures'

describe('getMappedEntityType', () => {
  it.each([
    ['Personal names', 'PERSONAL_NAME'],
    ['Divine names', 'DIVINE_NAME'],
    ['Geographical names', 'GEOGRAPHICAL_NAME'],
    ['Objects', 'OBJECT_NAME'],
    ['Peoples', 'ETHNOS_NAME'],
  ])('maps %s to %s', (realiaType, entityType) => {
    expect(getMappedEntityType([realiaType])).toBe(entityType)
  })

  it.each([
    'Religion',
    'Literature',
    'Miscellaneous',
    'Realia',
    'Fauna',
    'Astronomy',
    'Excavated sites',
  ])('does not map the topical class %s', (realiaType) => {
    expect(getMappedEntityType([realiaType])).toBeNull()
  })

  it('maps nothing when the entry has no classification', () => {
    expect(getMappedEntityType([])).toBeNull()
  })

  it('uses the first mappable classification', () => {
    expect(getMappedEntityType(['Religion', 'Objects', 'Peoples'])).toBe(
      'OBJECT_NAME',
    )
  })
})

describe('getEntryEntityType', () => {
  it('maps the classification of an entry', () => {
    const entry = realiaEntryFactory.build({ type: ['Personal names'] })
    expect(getEntryEntityType(entry)).toBe('PERSONAL_NAME')
  })

  it('returns null for an unmapped entry', () => {
    const entry = realiaEntryFactory.build({ type: ['Literature'] })
    expect(getEntryEntityType(entry)).toBeNull()
  })
})
