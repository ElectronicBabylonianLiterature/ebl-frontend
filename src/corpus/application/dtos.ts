import createReference from 'bibliography/application/createReference'
import {
  Chapter,
  DictionaryLineDisplay,
  LineVariantDisplay,
} from 'corpus/domain/chapter'
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
import { PeriodModifiers, Periods } from 'common/utils/period'
import { getProvenanceByName } from 'corpus/domain/provenance'
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
import { isEmptyLine, isTextLine } from 'transliteration/domain/type-guards'
import { NoteLine } from 'transliteration/domain/note-line'
import { createResearchProject } from 'research-projects/researchProject'

export type {
  LineVariantDisplayDto,
  OldLineNumberDto,
  LineDisplayDto,
  ChapterDisplayDto,
} from 'corpus/application/chapterDisplayDtos'

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
  return new Manuscript({
    id: manuscriptDto.id,
    siglumDisambiguator: manuscriptDto.siglumDisambiguator,
    oldSigla: manuscriptDto.oldSigla.map(createOldSiglum),
    museumNumber: manuscriptDto.museumNumber,
    accession: manuscriptDto.accession,
    periodModifier: PeriodModifiers[manuscriptDto.periodModifier],
    period: Periods[manuscriptDto.period],
    provenance: getProvenanceByName(manuscriptDto.provenance),
    type: ManuscriptTypes[manuscriptDto.type],
    notes: manuscriptDto.notes,
    colophon: manuscriptDto.colophon,
    unplacedLines: manuscriptDto.unplacedLines,
    references: manuscriptDto.references.map(createReference),
    joins: createJoins(manuscriptDto.joins),
    isInFragmentarium: manuscriptDto.isInFragmentarium,
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
      }),
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

function fromManuscriptLineDto(lineDto): TextLine | EmptyLine {
  const line = fromTransliterationLineDto(lineDto)
  if (isTextLine(line) || isEmptyLine(line)) {
    return line
  }
  throw new Error(`Unexpected manuscript line type "${line.type}".`)
}

function fromManuscriptLineDisplay(manuscript): ManuscriptLineDisplay {
  return new ManuscriptLineDisplay({
    provenance: getProvenanceByName(manuscript.provenance),
    periodModifier: PeriodModifiers[manuscript.periodModifier],
    period: Periods[manuscript.period],
    type: ManuscriptTypes[manuscript.type],
    siglumDisambiguator: manuscript.siglumDisambiguator,
    oldSigla: manuscript.oldSigla.map(createOldSiglum),
    labels: manuscript.labels,
    line: fromManuscriptLineDto(manuscript.line),
    paratext: manuscript.paratext.map(fromTransliterationLineDto),
    references: manuscript.references.map(createReference),
    joins: createJoins(manuscript.joins),
    museumNumber: manuscript.museumNumber,
    isInFragmentarium: manuscript.isInFragmentarium,
    accession: manuscript.accession,
    omittedWords: manuscript.omittedWords,
  })
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

export {
  toAlignmentDto,
  toLemmatizationDto,
  toManuscriptsDto,
  toLinesDto,
} from 'corpus/application/chapterDtoSerialization'

export function fromDictionaryLineDto(dto): DictionaryLineDisplay {
  return { ...dto, lineDetails: fromLineDetailsDto(dto.lineDetails, 0) }
}
