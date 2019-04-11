import { List, Seq } from 'immutable'
import BibliographyEntry from 'bibliography/BibliographyEntry'
import Reference, { serializeReference } from 'bibliography/Reference'
import { Text, Chapter, Manuscript, periodModifiers, periods, provenances, types } from './text'

function fromDto (textDto) {
  return Text({
    ...textDto,
    chapters: new List(textDto.chapters).map(chapterDto =>
      new Chapter({
        ...chapterDto,
        manuscripts: new List(chapterDto.manuscripts).map(manuscriptDto =>
          new Manuscript({
            ...manuscriptDto,
            periodModifier: periodModifiers.get(manuscriptDto.periodModifier),
            period: periods.get(manuscriptDto.period),
            provenance: provenances.get(manuscriptDto.provenance),
            type: types.get(manuscriptDto.type),
            references: Seq.Indexed(manuscriptDto.references).map(referenceDto => new Reference(
              referenceDto.type,
              referenceDto.pages,
              referenceDto.notes,
              referenceDto.linesCited,
              new BibliographyEntry(referenceDto.document)
            )).toList()
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
          .update('periodModifier', toName)
          .update('period', toName)
          .update('provenance', toName)
          .update('type', toName)
          .update('references', references => references.map(serializeReference))
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
