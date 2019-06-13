import BibliographyEntry from 'bibliography/BibliographyEntry'
import Reference, { serializeReference } from 'bibliography/Reference'
import {
  createText,
  createChapter,
  createManuscript,
  createLine,
  types,
  createManuscriptLine
} from './text'
import { periodModifiers, periods } from './period'
import { provenances } from './provenance'
import { produce } from 'immer'

function fromDto(textDto) {
  return createText({
    ...textDto,
    chapters: textDto.chapters.map(chapterDto =>
      createChapter({
        ...chapterDto,
        manuscripts: chapterDto.manuscripts.map(manuscriptDto =>
          createManuscript({
            ...manuscriptDto,
            periodModifier: periodModifiers.get(manuscriptDto.periodModifier),
            period: periods.get(manuscriptDto.period),
            provenance: provenances.get(manuscriptDto.provenance),
            type: types.get(manuscriptDto.type),
            references: manuscriptDto.references.map(
              referenceDto =>
                new Reference(
                  referenceDto.type,
                  referenceDto.pages,
                  referenceDto.notes,
                  referenceDto.linesCited,
                  new BibliographyEntry(referenceDto.document)
                )
            )
          })
        ),
        lines: chapterDto.lines.map(lineDto =>
          createLine({
            ...lineDto,
            manuscripts: lineDto.manuscripts.map(manuscriptLineDto =>
              createManuscriptLine({
                manuscriptId: manuscriptLineDto['manuscriptId'],
                labels: manuscriptLineDto['labels'],
                number: manuscriptLineDto['number'],
                atf: manuscriptLineDto['atf'],
                atfTokens: manuscriptLineDto['atfTokens']
              })
            )
          })
        )
      })
    )
  })
}

function toName(record) {
  return record.name
}

const toDto = produce(draft => {
  draft.chapters.forEach(chapter => {
    chapter.manuscripts.forEach(manuscript => {
      manuscript.periodModifier = toName(manuscript.periodModifier)
      manuscript.period = toName(manuscript.period)
      manuscript.provenance = toName(manuscript.provenance)
      manuscript.type = toName(manuscript.type)
      manuscript.references = manuscript.references.map(serializeReference)
    })
    chapter.lines.forEach(line => {
      delete line.reconstructionTokens
      line.manuscripts.forEach(manuscript => {
        delete manuscript.atfTokens
      })
    })
  })
})

export default class TextService {
  #apiClient

  constructor(apiClient) {
    this.#apiClient = apiClient
  }

  find(category, index) {
    return this.#apiClient
      .fetchJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(index)}`,
        true
      )
      .then(fromDto)
  }

  list() {
    return this.#apiClient
      .fetchJson('/texts', false)
      .then(texts => texts.map(fromDto))
  }

  update(category, index, text) {
    return this.#apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(index)}`,
        toDto(text)
      )
      .then(fromDto)
  }
}
