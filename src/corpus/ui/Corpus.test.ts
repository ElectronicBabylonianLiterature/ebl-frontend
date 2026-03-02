import { groupTextsByCategory, groupTextsByGenre } from './Corpus'
import { TextInfo } from 'corpus/domain/text'

describe('groupTextsByCategory', () => {
  it('sorts each category by text index', () => {
    const texts: readonly TextInfo[] = [
      {
        genre: 'L',
        category: 1,
        index: 3,
        name: 'third',
        numberOfVerses: 1,
        approximateVerses: false,
      },
      {
        genre: 'L',
        category: 1,
        index: 1,
        name: 'first',
        numberOfVerses: 1,
        approximateVerses: false,
      },
      {
        genre: 'L',
        category: 2,
        index: 2,
        name: 'second-category',
        numberOfVerses: 1,
        approximateVerses: false,
      },
    ]

    const grouped = groupTextsByCategory(texts)

    expect(grouped[1].map((text) => text.index)).toEqual([1, 3])
    expect(grouped[2].map((text) => text.index)).toEqual([2])
  })

  it('returns an empty object for empty input', () => {
    expect(groupTextsByCategory([])).toEqual({})
  })
})

describe('groupTextsByGenre', () => {
  it('groups texts by genre key', () => {
    const texts: readonly TextInfo[] = [
      {
        genre: 'L',
        category: 1,
        index: 1,
        name: 'lit',
        numberOfVerses: 1,
        approximateVerses: false,
      },
      {
        genre: 'D',
        category: 1,
        index: 1,
        name: 'div',
        numberOfVerses: 1,
        approximateVerses: false,
      },
      {
        genre: 'L',
        category: 2,
        index: 2,
        name: 'lit-2',
        numberOfVerses: 1,
        approximateVerses: false,
      },
    ]

    const grouped = groupTextsByGenre(texts)

    expect(grouped.L).toHaveLength(2)
    expect(grouped.D).toHaveLength(1)
  })
})
