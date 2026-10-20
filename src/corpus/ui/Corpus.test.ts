import {
  genreFromAbbr,
  groupTextsByCategory,
  groupTextsByGenre,
} from 'corpus/ui/Corpus'
import { TextInfo } from 'corpus/domain/text'

function textInfo(
  genre: string,
  category: number,
  index: number,
  name: string,
): TextInfo {
  return {
    genre,
    category,
    index,
    name,
    numberOfVerses: 1,
    approximateVerses: false,
  }
}

describe('groupTextsByCategory', () => {
  it('sorts each category by text index', () => {
    const texts: readonly TextInfo[] = [
      textInfo('L', 1, 3, 'third'),
      textInfo('L', 1, 1, 'first'),
      textInfo('L', 2, 2, 'second-category'),
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
      textInfo('L', 1, 1, 'lit'),
      textInfo('D', 1, 1, 'div'),
      textInfo('L', 2, 2, 'lit-2'),
    ]

    const grouped = groupTextsByGenre(texts)

    expect(grouped.L).toHaveLength(2)
    expect(grouped.D).toHaveLength(1)
  })
})

describe('genreFromAbbr', () => {
  it('names the genre of an abbreviation', () => {
    expect(genreFromAbbr('D')).toEqual('Divination')
  })

  it('rejects an unknown abbreviation', () => {
    expect(() => genreFromAbbr('X')).toThrow(
      "Genre Abbreviation 'X' has to be one of L, D, Med.",
    )
  })
})
