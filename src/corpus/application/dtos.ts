import serializeReference from 'bibliography/application/serializeReference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'
import { AlignmentToken, ChapterAlignment } from 'corpus/domain/alignment'
import { ChapterLemmatization } from 'corpus/domain/lemmatization'
import { periodModifiers, periods } from 'corpus/domain/period'
import { provenances } from 'corpus/domain/provenance'
import {
  createChapter,
  createLine,
  createManuscript,
  createManuscriptLine,
  createText,
  Line,
  Manuscript,
  Text,
  types,
  LineVariant,
  createVariant,
} from 'corpus/domain/text'
import { Draft, produce } from 'immer'

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

function fromLineVariantDto(variantDto): LineVariant {
  return createVariant({
    ...variantDto,
    manuscripts: variantDto.manuscripts.map((manuscriptLineDto) =>
      createManuscriptLine({
        manuscriptId: manuscriptLineDto['manuscriptId'],
        labels: manuscriptLineDto['labels'],
        number: manuscriptLineDto['number'],
        atf: manuscriptLineDto['atf'],
        atfTokens: manuscriptLineDto['atfTokens'],
        omittedWords: manuscriptLineDto['omittedWords'],
      })
    ),
  })
}

function fromLineDto(lineDto): Line {
  return createLine({
    ...lineDto,
    variants: lineDto.variants.map(fromLineVariantDto),
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
  ...draft,
  variants: draft.variants.map((variant) => ({
    reconstruction: variant.reconstruction,
    manuscripts: variant.manuscripts.map((manuscript) => ({
      manuscriptId: manuscript.manuscriptId,
      labels: manuscript.labels,
      number: manuscript.number,
      atf: manuscript.atf,
      omittedWords: manuscript.omittedWords,
    })),
  })),
}))

function toAlignmentTokenDto(token: AlignmentToken) {
  return token.isAlignable
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
}

export function toAlignmentDto(
  alignment: ChapterAlignment
): Record<string, unknown> {
  return {
    alignment: alignment.lines.map((line) =>
      line.map((variant) =>
        variant.map((manuscript) => ({
          alignment: manuscript.alignment.map(toAlignmentTokenDto),
          omittedWords: manuscript.omittedWords,
        }))
      )
    ),
  }
}

export const toLemmatizationDto = produce(
  (lemmatization: ChapterLemmatization) => {
    return {
      lemmatization: lemmatization.map((line) =>
        line.map((variant) => ({
          reconstruction: variant[0].map((token) => token.toDto()),
          manuscripts: variant[1].map((line) =>
            line.map((token) => token.toDto())
          ),
        }))
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
