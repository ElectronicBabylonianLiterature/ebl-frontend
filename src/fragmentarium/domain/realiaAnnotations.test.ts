import {
  createRealiaIdLookup,
  emptyRealiaIdLookup,
  getTokenRealiaIds,
} from 'fragmentarium/domain/realiaAnnotations'
import { atfTokenKur } from 'test-support/test-tokens'
import { Token } from 'transliteration/domain/token'

const realiaEntities = [
  { id: 'Realia-1', realiaId: 'realia_000846' },
  { id: 'Realia-2', realiaId: 'realia_000999' },
]

describe('createRealiaIdLookup', () => {
  it('maps each realia annotation id to its realiaId', () => {
    expect([...createRealiaIdLookup(realiaEntities)]).toEqual([
      ['Realia-1', 'realia_000846'],
      ['Realia-2', 'realia_000999'],
    ])
  })

  it('defaults to an empty lookup', () => {
    expect(createRealiaIdLookup().size).toBe(0)
  })
})

describe('getTokenRealiaIds', () => {
  const lookup = createRealiaIdLookup(realiaEntities)

  it('resolves the realiaIds of the annotated token', () => {
    const token = { ...atfTokenKur, realia: ['Realia-2'] }
    expect(getTokenRealiaIds(lookup, token)).toEqual(['realia_000999'])
  })

  it('never resolves a tag id against the realia layer', () => {
    const token = {
      ...atfTokenKur,
      namedEntities: ['Entity-1'],
      realia: [],
    }
    expect(getTokenRealiaIds(lookup, token)).toEqual([])
  })

  it('ignores ids that are not in the lookup', () => {
    const token = { ...atfTokenKur, realia: ['Realia-404'] }
    expect(getTokenRealiaIds(lookup, token)).toEqual([])
  })

  it('handles tokens with no realia', () => {
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
    const token = { ...atfTokenKur, realia: ['Realia-1'] }
    expect(getTokenRealiaIds(emptyRealiaIdLookup, token)).toEqual([])
  })
})
