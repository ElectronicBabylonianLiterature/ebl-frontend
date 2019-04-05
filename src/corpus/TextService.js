import { List } from 'immutable'
import { Text, Chapter, Manuscript, periods, provenances, types } from './text'

function fromDto (textDto) {
  return Text({
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
            references: new List()
          })
        )
      })
    )
  })
}

function toName (record) {
  return record.name
}

function toDto (text) {
  return text
    .updateIn(['chapters'], chapters => chapters.map(chapter =>
      chapter.updateIn(['manuscripts'], manuscripts => manuscripts.map(manuscript =>
        manuscript
          .update('period', toName)
          .update('provenance', toName)
          .update('type', toName)
      ))
    ))
    .toJS()
}
export default class TextService {
  #apiClient

  constructor (apiClient) {
    this.#apiClient = apiClient
  }

  find (category, index) {
    return this.#apiClient
      .fetchJson(`/texts/${encodeURIComponent(category)}/${encodeURIComponent(index)}`, true)
      .then(fromDto)
  }

  update (category, index, text) {
    return this.#apiClient
      .postJson(`/texts/${encodeURIComponent(category)}/${encodeURIComponent(index)}`, toDto(text))
      .then(fromDto)
  }
}
