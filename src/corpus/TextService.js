import { List, Seq } from 'immutable'
import BibliographyEntry from 'bibliography/BibliographyEntry'
import Reference, { serializeReference } from 'bibliography/Reference'
import {
  createText,
  createChapter,
  createManuscript,
  createLine,
  provenances,
  types,
  createManuscriptLine
} from './text'
import { periodModifiers, periods } from './period'

function fromDto (textDto) {
  return createText({
    ...textDto,
    chapters: List(textDto.chapters).map(chapterDto =>
      createChapter({
        ...chapterDto,
        manuscripts: List(chapterDto.manuscripts).map(manuscriptDto =>
          createManuscript({
            ...manuscriptDto,
            periodModifier: periodModifiers.get(manuscriptDto.periodModifier),
            period: periods.get(manuscriptDto.period),
            provenance: provenances.get(manuscriptDto.provenance),
            type: types.get(manuscriptDto.type),
            references: Seq.Indexed(manuscriptDto.references)
              .map(
                referenceDto =>
                  new Reference(
                    referenceDto.type,
                    referenceDto.pages,
                    referenceDto.notes,
                    referenceDto.linesCited,
                    new BibliographyEntry(referenceDto.document)
                  )
              )
              .toList()
          })
        ),
        lines: List(chapterDto.lines).map(lineDto =>
          createLine({
            ...lineDto,
            manuscripts: List(lineDto.manuscripts).map(manuscriptLineDto =>
              createManuscriptLine({
                manuscriptId: manuscriptLineDto['manuscriptId'],
                labels: List(manuscriptLineDto['labels']),
                number: manuscriptLineDto['number'],
                atf: manuscriptLineDto['atf']
              })
            )
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
    .updateIn(['chapters'], chapters =>
      chapters.map(chapter =>
        chapter.updateIn(['manuscripts'], manuscripts =>
          manuscripts.map(manuscript =>
            manuscript
              .update('periodModifier', toName)
              .update('period', toName)
              .update('provenance', toName)
              .update('type', toName)
              .update('references', references =>
                references.map(serializeReference)
              )
          )
        )
      )
    )
    .toJS()
}

export default class TextService {
  #apiClient

  constructor (apiClient) {
    this.#apiClient = apiClient
  }

  find (category, index) {
    return this.#apiClient
      .fetchJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(index)}`,
        true
      )
      .then(fromDto)
  }

  list () {
    return this.#apiClient.fetchJson('/texts', false).then(texts =>
      Seq(texts)
        .map(fromDto)
        .toList()
    )
  }

  update (category, index, text) {
    return this.#apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(index)}`,
        toDto(text)
      )
      .then(fromDto)
  }
}
