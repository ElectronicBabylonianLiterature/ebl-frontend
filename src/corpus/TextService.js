import { List } from 'immutable'
import { Text, Chapter, Manuscript, periods, provenances, types } from './text'

export default class TextService {
  #apiClient

  constructor (apiClient) {
    this.#apiClient = apiClient
  }

  find (category, index) {
    return this.#apiClient
      .fetchJson(`/texts/${encodeURIComponent(category)}.${encodeURIComponent(index)}`, true)
      .then(textDto => Text({
        ...textDto,
        chapters: new List(textDto.chapters).map(chapterDto =>
          new Chapter({
            ...chapterDto,
            manuscripts: new List(chapterDto.manuscripts).map(manuscriptDto =>
              new Manuscript({
                ...manuscriptDto,
                period: periods.get(manuscriptDto.period),
                provenance: provenances.get(manuscriptDto.provenance),
                type: types.get(manuscriptDto.type),
                bibliography: new List()
              })
            )
          })
        )
      }))
  }
}
