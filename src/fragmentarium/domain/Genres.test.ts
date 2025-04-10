import { Genre, Genres } from 'fragmentarium/domain/Genres'

const genresOptions = [
  ['ARCHIVAL123'],
  ['ARCHIVAL', 'Administrative'],
  ['ARCHIVAL', 'Memos'],
]

const genreConfig1 = {
  category: ['ARCHIVAL'],
  uncertain: false,
}

const genreConfig2 = {
  category: ['ARCHIVAL', 'Memos'],
  uncertain: false,
}

const genresConfig = [genreConfig1, genreConfig2]

const genre = new Genre(genreConfig1.category, genreConfig1.uncertain)
const genres = Genres.fromJson(genresConfig)

let genreNew
let genresNew

describe('Genre', () => {
  beforeEach(() => {
    genreNew = genre.setUncertain(true)
  })
  test('empty init', () => {
    const emptyGenre = new Genres([])
    expect(emptyGenre.genres).toEqual([])
  })
  test('toString', () => {
    expect(genre.toString).toEqual('ARCHIVAL')
  })
  test('setter', () => {
    expect(genreNew.uncertain).toEqual(true)
  })
})

describe('Genres', () => {
  test('Genres init', () => {
    expect(genres.has(genre)).toEqual(true)
  })
  test('find category', () => {
    expect(genres.find(genre)).toEqual(genre)
  })
  test('insert', () => {
    genreNew = new Genre(['ARCHIVAL', 'Administrative'], false)
    genresNew = genres.insertWithOrder(genreNew, genresOptions)
    expect(genresNew.genres[1]).toEqual(genreNew)
  })
  test('delete genre', () => {
    genresNew = genres.delete(genre)
    expect(genresNew.genres.length).toEqual(1)
    expect(genresNew.find(genre)).toEqual(undefined)
  })
  test('replace genre', () => {
    genreNew = genre.setUncertain(true)
    genresNew = genres.replace(genreNew)
    expect(genresNew.find(genreNew).uncertain).toEqual(true)
  })
})
