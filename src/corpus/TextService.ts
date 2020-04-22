import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'
import serializeReference from 'bibliography/application/serializeReference'
import {
  createText,
  createChapter,
  createManuscript,
  createLine,
  types,
  createManuscriptLine,
} from './text'
import { periodModifiers, periods } from './period'
import { provenances } from './provenance'
import { produce } from 'immer'
import _ from 'lodash'

function fromDto(textDto) {
  return createText({
    ...textDto,
    chapters: textDto.chapters.map((chapterDto) =>
      createChapter({
        ...chapterDto,
        manuscripts: chapterDto.manuscripts.map((manuscriptDto) =>
          createManuscript({
            ...manuscriptDto,
            periodModifier: periodModifiers.get(manuscriptDto.periodModifier),
            period: periods.get(manuscriptDto.period),
            provenance: provenances.get(manuscriptDto.provenance),
            type: types.get(manuscriptDto.type),
            references: manuscriptDto.references.map(
              (referenceDto) =>
                new Reference(
                  referenceDto.type,
                  referenceDto.pages,
                  referenceDto.notes,
                  referenceDto.linesCited,
                  new BibliographyEntry(referenceDto.document)
                )
            ),
          })
        ),
        lines: chapterDto.lines.map((lineDto) =>
          createLine({
            ...lineDto,
            manuscripts: lineDto.manuscripts.map((manuscriptLineDto) =>
              createManuscriptLine({
                manuscriptId: manuscriptLineDto['manuscriptId'],
                labels: manuscriptLineDto['labels'],
                number: manuscriptLineDto['number'],
                atf: manuscriptLineDto['atf'],
                atfTokens: manuscriptLineDto['atfTokens'],
              })
            ),
          })
        ),
      })
    ),
  })
}

function toName(record) {
  return record.name
}

const toManuscriptDto = produce((draft) => ({
  id: draft.id,
  siglumDisambiguator: draft.siglumDisambiguator,
  museumNumber: draft.museumNumber,
  accession: draft.accession,
  provenance: toName(draft.provenance),
  periodModifier: toName(draft.periodModifier),
  period: toName(draft.period),
  type: toName(draft.type),
  notes: draft.notes,
  references: draft.references.map(serializeReference),
}))

const toLineDto = produce((draft) => ({
  ..._.omit(draft, 'reconstructionTokens'),
  manuscripts: draft.manuscripts.map((manuscript) =>
    _.omit(manuscript, 'atfTokens')
  ),
}))

const toAlignmentDto = produce((lines) => {
  return {
    alignment: lines.map((line) =>
      line.manuscripts.map((manuscript) =>
        manuscript.atfTokens.map((token) => ({
          value: token.value,
          alignment: token.alignment,
        }))
      )
    ),
  }
})

const toManuscriptsDto = (manuscripts) => ({
  manuscripts: manuscripts.map(toManuscriptDto),
})

const toLinesDto = (lines) => ({
  lines: lines.map(toLineDto),
})

export default class TextService {
  private readonly apiClient

  constructor(apiClient) {
    this.apiClient = apiClient
  }

  find(category, index) {
    return this.apiClient
      .fetchJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(index)}`,
        true
      )
      .then(fromDto)
  }

  list() {
    return this.apiClient
      .fetchJson('/texts', false)
      .then((texts) => texts.map(fromDto))
  }

  updateAlignment(category, index, chapterIndex, lines) {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(chapterIndex)}/alignment`,
        toAlignmentDto(lines)
      )
      .then(fromDto)
  }

  updateManuscripts(category, index, chapterIndex, manuscripts) {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(chapterIndex)}/manuscripts`,
        toManuscriptsDto(manuscripts)
      )
      .then(fromDto)
  }

  updateLines(category, index, chapterIndex, lines) {
    return this.apiClient
      .postJson(
        `/texts/${encodeURIComponent(category)}/${encodeURIComponent(
          index
        )}/chapters/${encodeURIComponent(chapterIndex)}/lines`,
        toLinesDto(lines)
      )
      .then(fromDto)
  }
}
