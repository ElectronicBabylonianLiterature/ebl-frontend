import _ from 'lodash'

import createReference from 'bibliography/application/createReference'
import serializeReference from 'bibliography/application/serializeReference'
import { AlignmentToken, ChapterAlignment } from 'corpus/domain/alignment'
import {
  Chapter,
  ChapterDisplay,
  DictionaryLineDisplay,
  LineDisplay,
  LineVariantDisplay,
} from 'corpus/domain/chapter'
import { ChapterLemmatization } from 'corpus/domain/lemmatization'
import {
  createLine,
  createManuscriptLine,
  createVariant,
  EditStatus,
  Line,
  LineVariant,
} from 'corpus/domain/line'
import { LineDetails, ManuscriptLineDisplay } from 'corpus/domain/line-details'
import {
  Manuscript,
  ManuscriptTypes,
  OldSiglum,
} from 'corpus/domain/manuscript'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import { PeriodModifiers, Periods } from 'common/period'
import { Provenances } from 'corpus/domain/provenance'
import SiglumAndTransliteration from 'corpus/domain/SiglumAndTransliteration'
import {
  ChapterListing,
  createChapter,
  createText,
  Text,
} from 'corpus/domain/text'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { createJoins } from 'fragmentarium/infrastructure/FragmentRepository'
import {
  createTransliteration,
  fromTransliterationLineDto,
} from 'transliteration/application/dtos'
import { EmptyLine } from 'transliteration/domain/line'
import { TextLine } from 'transliteration/domain/text-line'
import TranslationLine, {
  Extent,
} from 'transliteration/domain/translation-line'
import { MarkupPart } from 'transliteration/domain/markup'
import { Token } from 'transliteration/domain/token'
import { NoteLine, NoteLineDto } from 'transliteration/domain/note-line'
import { ParallelLineDto } from 'transliteration/domain/parallel-line'
import Reference from 'bibliography/domain/Reference'
import { ChapterInfoLine } from 'corpus/domain/ChapterInfo'
import { createResearchProject } from 'research-projects/researchProject'

export type LineVariantDisplayDto = Pick<
  LineVariantDisplay,
  'originalIndex' | 'reconstruction' | 'manuscripts' | 'intertext'
> & {
  note: Omit<NoteLineDto, 'type'> | null
  parallelLines: ParallelLineDto[]
}

export type OldLineNumberDto = {
  number: string
  reference: ReferenceDto
}

export type LineDisplayDto = Pick<
  LineDisplay,
  | 'number'
  | 'isSecondLineOfParallelism'
  | 'isBeginningOfSection'
  | 'originalIndex'
> & {
  translation: {
    language: string
    extent: Extent | null
    parts: MarkupPart[]
    content: Token[]
  }[]
  variants: LineVariantDisplayDto[]
  oldLineNumbers: OldLineNumberDto[]
}

export type ChapterDisplayDto = Pick<
  ChapterDisplay,
  | 'id'
  | 'textHasDoi'
  | 'textName'
  | 'isSingleStage'
  | 'title'
  | 'record'
  | 'atf'
> & { lines: LineDisplayDto[] }

export function fromSiglumAndTransliterationDto(
  dto,
): SiglumAndTransliteration[] {
  return dto.map(({ siglum, text }) => ({
    siglum,
    text: createTransliteration(text),
  }))
}

export function fromChapterListingDto(chapterListingDto): ChapterListing {
  return {
    ...chapterListingDto,
    uncertainFragments: chapterListingDto.uncertainFragments.map(
      ({ museumNumber }) => ({
        museumNumber: museumNumberToString(museumNumber),
      }),
    ),
  }
}

export function fromDto(textDto): Text {
  return createText({
    ...textDto,
    references: textDto.references.map(createReference),
    chapters: textDto.chapters.map(fromChapterListingDto),
    projects: textDto.projects?.map(createResearchProject) || [],
  })
}

export function fromChapterDto(chapterDto): Chapter {
  return createChapter({
    ...chapterDto,
    manuscripts: chapterDto.manuscripts.map(fromManuscriptDto),
    lines: chapterDto.lines.map(fromLineDto),
  })
}

export interface OldSiglumDto {
  readonly siglum: string
  readonly reference: ReferenceDto
}

export function createOldSiglum(oldSiglumDto: OldSiglumDto): OldSiglum {
  return new OldSiglum(
    oldSiglumDto.siglum,
    createReference(oldSiglumDto.reference),
  )
}

export function fromManuscriptDto(manuscriptDto): Manuscript {
  return new Manuscript(
    manuscriptDto.id,
    manuscriptDto.siglumDisambiguator,
    manuscriptDto.oldSigla.map(createOldSiglum),
    manuscriptDto.museumNumber,
    manuscriptDto.accession,
    PeriodModifiers[manuscriptDto.periodModifier],
    Periods[manuscriptDto.period],
    Provenances[manuscriptDto.provenance],
    ManuscriptTypes[manuscriptDto.type],
    manuscriptDto.notes,
    manuscriptDto.colophon,
    manuscriptDto.unplacedLines,
    manuscriptDto.references.map(createReference),
    createJoins(manuscriptDto.joins),
    manuscriptDto.isInFragmentarium,
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
      }),
    ),
  })
}

export function fromMatchingColophonLinesDto(
  matchingColophonLinesDto: Record<string, unknown>,
): Record<string, readonly TextLine[]> {
  return Object.entries(matchingColophonLinesDto).reduce(
    (previousValue, colophon: [string, unknown[]]) => ({
      ...previousValue,
      [colophon[0]]: colophon[1].map((textLine) => new TextLine(textLine)),
    }),
    {},
  )
}

export function fromLineDto(lineDto): Line {
  return createLine({
    ...lineDto,
    variants: lineDto.variants?.map(fromLineVariantDto) ?? [],
    status: EditStatus.CLEAN,
  })
}
export function fromMatchingLineDto(lineDto): ChapterInfoLine {
  return {
    ...createLine({
      ...lineDto,
      variants: lineDto.variants?.map(fromLineVariantDto) ?? [],
      status: EditStatus.CLEAN,
    }),
    translation: lineDto.translation.map(
      (translation) => new TranslationLine(translation),
    ),
  }
}

function fromManuscriptLineDisplay(manuscript): ManuscriptLineDisplay {
  return new ManuscriptLineDisplay(
    Provenances[manuscript.provenance],
    PeriodModifiers[manuscript.periodModifier],
    Periods[manuscript.period],
    ManuscriptTypes[manuscript.type],
    manuscript.siglumDisambiguator,
    manuscript.oldSigla.map(createOldSiglum),
    manuscript.labels,
    fromTransliterationLineDto(manuscript.line) as unknown as
      | TextLine
      | EmptyLine,
    manuscript.paratext.map(fromTransliterationLineDto),
    manuscript.references.map(createReference),
    createJoins(manuscript.joins),
    manuscript.museumNumber,
    manuscript.isInFragmentarium,
    manuscript.accession,
    manuscript.omittedWords,
  )
}

function fromLineVariantDisplay(variant): LineVariantDisplay {
  return {
    ...variant,
    note: variant.note && new NoteLine(variant.note),
    manuscripts: variant.manuscripts.map((manuscript) =>
      fromManuscriptLineDisplay(manuscript),
    ),
  }
}

export function fromLineDetailsDto(line, activeVariant: number): LineDetails {
  return new LineDetails(
    line.variants.map((variant) => fromLineVariantDisplay(variant)),
    activeVariant,
  )
}

function toName(record: { name: string }): string {
  return record.name
}

function serializeOldSiglum(oldSiglum: OldSiglum): {
  siglum: string
  reference: Pick<Reference, 'type' | 'pages' | 'notes' | 'linesCited'> & {
    id: string
  }
} {
  return {
    siglum: oldSiglum.siglum,
    reference: serializeReference(oldSiglum.reference),
  }
}

function toManuscriptDto(manuscript: Manuscript) {
  return {
    id: manuscript.id,
    siglumDisambiguator: manuscript.siglumDisambiguator,
    oldSigla: manuscript.oldSigla.map(serializeOldSiglum),
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
      intertext: variant.intertext,
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
  alignment: ChapterAlignment,
): Record<string, unknown> {
  return {
    alignment: alignment.lines.map((line) =>
      line.map((variant) =>
        variant.map((manuscript) => ({
          alignment: manuscript.alignment.map(toAlignmentTokenDto),
          omittedWords: manuscript.omittedWords,
        })),
      ),
    ),
  } as const
}

export function toLemmatizationDto(lemmatization: ChapterLemmatization) {
  return {
    lemmatization: lemmatization.map((line) =>
      line.map((variant) => ({
        reconstruction: variant[0].map((token) => token.toDto()),
        manuscripts: variant[1].map((line) =>
          line.map((token) => token.toDto()),
        ),
      })),
    ),
  } as const
}

export function toManuscriptsDto(
  manuscripts: readonly Manuscript[],
  uncertainChapters: readonly string[],
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
          : null,
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
  }) as const

export function fromDictionaryLineDto(dto): DictionaryLineDisplay[] {
  return { ...dto, lineDetails: fromLineDetailsDto(dto.lineDetails, 0) }
}
