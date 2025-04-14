import produce, { castDraft, Draft, immerable } from 'immer'
import _ from 'lodash'
import { GenreDto } from './FragmentDtos'

export class Genre {
  [immerable] = true
  readonly category: ReadonlyArray<string>
  readonly uncertain: boolean

  constructor(category: readonly string[], uncertain: boolean) {
    this.category = category
    this.uncertain = uncertain
  }

  setUncertain(uncertain: boolean): Genre {
    return produce(this, (draft: Draft<Genre>) => {
      draft.uncertain = uncertain
    })
  }

  toString(): string {
    return `${this.category.join(' ➝ ')}${this.uncertain ? ' (?)' : ''}`
  }
}

export class Genres {
  [immerable] = true
  readonly genres: ReadonlyArray<Genre>

  constructor(genres: Genre[]) {
    this.genres = genres
  }

  static fromJson(genreJSON: readonly GenreDto[]): Genres {
    return new Genres(
      genreJSON.map(({ category, uncertain }) => new Genre(category, uncertain))
    )
  }

  has(genre: Genre): boolean {
    return this.genres.some(
      (element) => element.toString() === genre.toString()
    )
  }

  find(genre: Genre): Genre | undefined {
    return _.find(
      this.genres,
      (elem) => JSON.stringify(elem.category) === JSON.stringify(genre.category)
    )
  }

  insertWithOrder(genre: Genre, indexLookup: readonly string[][]): Genres {
    return produce(this, (draft: Draft<Genres>) => {
      draft.genres = castDraft(
        _.sortBy([...this.genres, genre], (genre) =>
          JSON.stringify(indexLookup).indexOf(JSON.stringify(genre.category))
        )
      )
    })
  }

  delete(genre: Genre): Genres {
    return produce(this, (draft: Draft<Genres>) => {
      draft.genres = castDraft(
        this.genres.filter(
          (elem) => JSON.stringify(elem) !== JSON.stringify(genre)
        )
      )
    })
  }

  replace(genre: Genre): Genres {
    return produce(this, (draft: Draft<Genres>) => {
      const genres = _.cloneDeep(this.genres as Genre[])
      const index = _.findIndex(
        this.genres,
        (content) =>
          JSON.stringify(content.category) === JSON.stringify(genre.category)
      )
      genres.splice(index, 1, genre)
      draft.genres = castDraft(genres)
    })
  }
}
