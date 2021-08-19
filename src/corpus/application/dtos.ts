import _ from 'lodash'
import serializeReference from 'bibliography/application/serializeReference'
import { AlignmentToken, ChapterAlignment } from 'corpus/domain/alignment'
import { ChapterLemmatization } from 'corpus/domain/lemmatization'
import {
  createLine,
  createManuscriptLine,
  createVariant,
  EditStatus,
  Line,
  LineVariant,
} from 'corpus/domain/line'
import { PeriodModifiers, Periods } from 'corpus/domain/period'
import { Provenances } from 'corpus/domain/provenance'
import { Chapter, createChapter, createText, Text } from 'corpus/domain/text'
import { Manuscript, ManuscriptTypes } from 'corpus/domain/manuscript'
import createReference from 'bibliography/application/createReference'
import { createTransliteration } from 'transliteration/application/dtos'
import SiglumAndTransliteration from 'corpus/domain/SiglumAndTransliteration'

export function fromSiglumAndTransliterationDto(
  dto
): SiglumAndTransliteration[] {
  return dto.map(({ siglum, text }) => ({
    siglum,
    text: createTransliteration(text),
  }))
}

export function fromDto(textDto): Text {
  return createText({
    ...textDto,
    references: textDto.references.map(createReference),
  })
}

export function fromChapterDto(chapterDto): Chapter {
  return createChapter({
    ...chapterDto,
    manuscripts: chapterDto.manuscripts.map(fromManuscriptDto),
    lines: chapterDto.lines.map(fromLineDto),
  })
}

export function fromManuscriptDto(manuscriptDto): Manuscript {
  return new Manuscript(
    manuscriptDto.id,
    manuscriptDto.siglumDisambiguator,
    manuscriptDto.museumNumber,
    manuscriptDto.accession,
    PeriodModifiers[manuscriptDto.periodModifier],
    Periods[manuscriptDto.period],
    Provenances[manuscriptDto.provenance],
    ManuscriptTypes[manuscriptDto.type],
    manuscriptDto.notes,
    manuscriptDto.colophon,
    manuscriptDto.unplacedLines,
    manuscriptDto.references.map(createReference)
  )
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

export function fromLineDto(lineDto): Line {
  return createLine({
    ...lineDto,
    variants: lineDto.variants?.map(fromLineVariantDto) ?? [],
    status: EditStatus.CLEAN,
  })
}

function toName(record: { name: string }): string {
  return record.name
}

function toManuscriptDto(manuscript: Manuscript) {
  return {
    id: manuscript.id,
    siglumDisambiguator: manuscript.siglumDisambiguator,
    museumNumber: manuscript.museumNumber,
    accession: manuscript.accession,
    provenance: toName(manuscript.provenance),
    periodModifier: toName(manuscript.periodModifier),
    period: toName(manuscript.period),
    type: toName(manuscript.type),
    notes: manuscript.notes,
    colophon: manuscript.colophon,
    unplacedLines: manuscript.unplacedLines,
    references: manuscript.references.map(serializeReference),
  } as const
}

function toLineDto(line: Line) {
  return {
    ..._.omit(line, 'status'),
    variants: line.variants.map((variant) => ({
      reconstruction: variant.reconstruction,
      manuscripts: variant.manuscripts.map((manuscript) => ({
        manuscriptId: manuscript.manuscriptId,
        labels: manuscript.labels,
        number: manuscript.number,
        atf: manuscript.atf,
        omittedWords: manuscript.omittedWords,
      })),
    })),
  } as const
}

function toAlignmentTokenDto(token: AlignmentToken) {
  return token.isAlignable
    ? ({
        value: token.value,
        alignment: token.alignment,
        variant: token.variant?.value ?? '',
        type: token.variant?.type ?? '',
        language: token.variant?.language ?? '',
      } as const)
    : ({
        value: token.value,
      } as const)
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
  } as const
}

export function toLemmatizationDto(lemmatization: ChapterLemmatization) {
  return {
    lemmatization: lemmatization.map((line) =>
      line.map((variant) => ({
        reconstruction: variant[0].map((token) => token.toDto()),
        manuscripts: variant[1].map((line) =>
          line.map((token) => token.toDto())
        ),
      }))
    ),
  } as const
}

export function toManuscriptsDto(
  manuscripts: readonly Manuscript[],
  uncertainChapters: readonly string[]
): Record<string, unknown> {
  return {
    manuscripts: manuscripts.map(toManuscriptDto),
    uncertainFragments: uncertainChapters,
  } as const
}

export const toLinesDto = (lines: readonly Line[]) =>
  ({
    edited: _(lines)
      .map((line, index) =>
        line.status === EditStatus.EDITED
          ? { line: toLineDto(line), index: index }
          : null
      )
      .reject(_.isNil)
      .value(),
    deleted: _(lines)
      .map((line, index) => (line.status === EditStatus.DELETED ? index : null))
      .reject(_.isNil)
      .value(),
    new: _(lines)
      .filter((line) => line.status === EditStatus.NEW)
      .map(toLineDto)
      .value(),
  } as const)
