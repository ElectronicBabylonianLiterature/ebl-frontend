import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'
import serializeReference from 'bibliography/application/serializeReference'
import {
  createText,
  createChapter,
  createManuscript,
  createLine,
  Text,
  types,
  createManuscriptLine,
  Manuscript,
  Line,
} from 'corpus/domain/text'
import { periodModifiers, periods } from 'corpus/domain/period'
import { provenances } from 'corpus/domain/provenance'
import { Draft, produce } from 'immer'
import _ from 'lodash'
import { ChapterLemmatization } from 'corpus/domain/lemmatization'
import { ChapterAlignment } from 'corpus/domain/alignment'

export function fromDto(textDto): Text {
  return createText({
    ...textDto,
    chapters: textDto.chapters.map((chapterDto) =>
      createChapter({
        ...chapterDto,
        manuscripts: chapterDto.manuscripts.map(fromManuscriptDto),
        lines: chapterDto.lines.map(fromLineDto),
      })
    ),
  })
}

function fromManuscriptDto(manuscriptDto): Manuscript {
  return createManuscript({
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
}

function fromLineDto(lineDto): Line {
  return createLine({
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
}

function toName(record: { name: string }): string {
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

const toLineDto = produce((draft: Draft<Line>) => ({
  ..._.omit(draft, 'reconstructionTokens'),
  manuscripts: draft.manuscripts.map((manuscript) =>
    _.omit(manuscript, 'atfTokens')
  ),
}))

export function toAlignmentDto(
  alignment: ChapterAlignment
): Record<string, unknown> {
  return {
    alignment: alignment.lines.map((line) =>
      line.map((manuscript) => ({
        alignment: manuscript.alignment.map((token) =>
          token.isAlignable
            ? {
                value: token.value,
                alignment: token.alignment,
                variant: token.variant?.value ?? '',
                language: token.variant?.language ?? '',
                isNormalized: token.variant?.isNormalized ?? false,
              }
            : {
                value: token.value,
              }
        ),
        omittedWords: manuscript.omittedWords,
      }))
    ),
  }
}

export const toLemmatizationDto = produce(
  (lemmatization: ChapterLemmatization) => {
    return {
      lemmatization: lemmatization.map((line) =>
        [line[0], ...line[1]].map((line) => line.map((token) => token.toDto()))
      ),
    }
  }
)

export const toManuscriptsDto = (
  manuscripts: readonly Manuscript[]
): Record<string, unknown> => ({
  manuscripts: manuscripts.map(toManuscriptDto),
})

export const toLinesDto = (
  lines: readonly Line[]
): Record<string, unknown> => ({
  lines: lines.map(toLineDto),
})
