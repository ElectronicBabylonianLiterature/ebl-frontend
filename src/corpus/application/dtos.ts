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
import { TextLine, TextLineDto } from 'transliteration/domain/text-line'
import TranslationLine from 'transliteration/domain/translation-line'
import { NoteLine } from 'transliteration/domain/note-line'
import { ChapterInfoLine } from 'corpus/domain/ChapterInfo'
import { createResearchProject } from 'research-projects/researchProject'

export type {
  ChapterDisplayDto,
  LineDisplayDto,
  LineVariantDisplayDto,
  OldLineNumberDto,
} from 'corpus/application/chapterDisplayDtos'
export {
  toAlignmentDto,
  toLemmatizationDto,
  toLinesDto,
  toManuscriptsDto,
} from 'corpus/application/toDtos'

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
    getProvenanceByName(manuscriptDto.provenance),
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
  return Object.entries(matchingColophonLinesDto).reduce<
    Record<string, readonly TextLine[]>
  >((previousValue, [key, value]) => {
    const lines = (value as unknown[]).map(
      (textLine) => new TextLine(textLine as TextLineDto),
    )
    return { ...previousValue, [key]: lines }
  }, {})
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
    ...fromLineDto(lineDto),
    translation: lineDto.translation.map(
      (translation) => new TranslationLine(translation),
    ),
  }
}

function fromManuscriptLineDisplay(manuscript): ManuscriptLineDisplay {
  return new ManuscriptLineDisplay(
    getProvenanceByName(manuscript.provenance),
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

export function fromDictionaryLineDto(dto): DictionaryLineDisplay {
  return { ...dto, lineDetails: fromLineDetailsDto(dto.lineDetails, 0) }
}
