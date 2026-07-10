import {
  createRealiaIdLookup,
  emptyRealiaIdLookup,
  getTokenRealiaIds,
} from 'fragmentarium/domain/realiaAnnotations'
import { atfTokenKur } from 'test-support/test-tokens'
import { Token } from 'transliteration/domain/token'

const namedEntities = [
  { id: 'Entity-1', type: 'PERSONAL_NAME' as const },
  { id: 'Realia-1', realiaId: 'realia_000846' },
  { id: 'Realia-2', realiaId: 'realia_000999' },
]

describe('createRealiaIdLookup', () => {
  it('keeps only realia entries', () => {
    expect([...createRealiaIdLookup(namedEntities)]).toEqual([
      ['Realia-1', 'realia_000846'],
      ['Realia-2', 'realia_000999'],
    ])
  })

  it('defaults to an empty lookup', () => {
    expect(createRealiaIdLookup().size).toBe(0)
  })
})

describe('getTokenRealiaIds', () => {
  const lookup = createRealiaIdLookup(namedEntities)

  it('resolves the realiaIds of the annotated token', () => {
    const token = { ...atfTokenKur, namedEntities: ['Entity-1', 'Realia-2'] }
    expect(getTokenRealiaIds(lookup, token)).toEqual(['realia_000999'])
  })

  it('ignores ids that are not realia annotations', () => {
    const token = { ...atfTokenKur, namedEntities: ['Entity-1'] }
    expect(getTokenRealiaIds(lookup, token)).toEqual([])
  })

  it('ignores ids that are not in the lookup', () => {
    const token = { ...atfTokenKur, namedEntities: ['Realia-404'] }
    expect(getTokenRealiaIds(lookup, token)).toEqual([])
  })

  it('handles tokens without named entities', () => {
    expect(getTokenRealiaIds(lookup, atfTokenKur)).toEqual([])
  })

  it('returns nothing for tokens that are not words', () => {
    const token: Token = {
      type: 'ValueToken',
      value: 'x',
      cleanValue: 'x',
      parts: [],
      enclosureType: [],
    }
    expect(getTokenRealiaIds(lookup, token)).toEqual([])
  })

  it('returns nothing with the empty lookup', () => {
    const token = { ...atfTokenKur, namedEntities: ['Realia-1'] }
    expect(getTokenRealiaIds(emptyRealiaIdLookup, token)).toEqual([])
  })
})
