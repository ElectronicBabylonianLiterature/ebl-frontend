import { Fragment } from 'fragmentarium/domain/fragment'
import { Genres } from 'fragmentarium/domain/Genres'
import { MesopotamianDate } from 'chronology/domain/Date'
import FragmentDto, {
  MesopotamianDateDto,
} from 'fragmentarium/domain/FragmentDtos'
import { ScriptDto } from 'fragmentarium/domain/fragment'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { Museums } from 'fragmentarium/domain/museum'
import createReference from 'bibliography/application/createReference'
import Reference from 'bibliography/domain/Reference'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import { CslData } from 'bibliography/domain/BibliographyEntry'
import { createResearchProject } from 'research-projects/researchProject'
import { createScript } from 'fragmentarium/infrastructure/FragmentRepository'
import { createTransliteration } from 'transliteration/application/dtos'
import { TextLineDto } from 'transliteration/domain/text-line'
import { LineNumber, LineNumberRange } from 'transliteration/domain/line-number'
import { BaseToken, Token } from 'transliteration/domain/token'

export type QueryMuseumNumberDto = {
  prefix: string
  number: string
  suffix: string
}

export type FragmentQueryPreviewLineDto = TextLineDto

export type FragmentQueryPreviewDto = {
  lines: readonly FragmentQueryPreviewLineDto[]
}

export type BibliographyDocumentsDto = { readonly [id: string]: CslData }

export type QuerySummaryArchaeologyDto = {
  excavationNumber: QueryMuseumNumberDto | null
  site: { name: string } | null
} | null

export type QuerySummaryItemDto = {
  museumNumber: QueryMuseumNumberDto
  accession?: QueryMuseumNumberDto | null
  description: string
  script: ScriptDto
  date?: MesopotamianDateDto | null
  genres?: FragmentDto['genres']
  archaeology?: QuerySummaryArchaeologyDto
  references?: FragmentDto['references']
  projects?: FragmentDto['projects']
  dossiers?: FragmentDto['dossiers']
  matchingLines: readonly number[]
  matchingLinePreview?: FragmentQueryPreviewDto | null
  matchCount: number
  hasPhoto: boolean
  thumbnailPath?: string | null
}

function isRenderablePreviewToken(token: unknown): token is Token {
  const candidate = token as Partial<BaseToken> | null
  return (
    typeof candidate?.type === 'string' &&
    typeof candidate.value === 'string' &&
    Array.isArray(candidate.enclosureType) &&
    (candidate.parts === undefined ||
      (Array.isArray(candidate.parts) &&
        candidate.parts.every(isRenderablePreviewToken)))
  )
}

function isRenderableLineNumberPart(lineNumber: unknown): boolean {
  const candidate = lineNumber as Partial<LineNumber> | null
  return (
    typeof candidate?.number === 'number' &&
    typeof candidate.hasPrime === 'boolean'
  )
}

function isRenderableLineNumber(
  lineNumber: unknown,
): lineNumber is LineNumber | LineNumberRange {
  const candidate = lineNumber as Partial<LineNumberRange> | null
  return candidate?.type === 'LineNumberRange'
    ? isRenderableLineNumberPart(candidate.start) &&
        isRenderableLineNumberPart(candidate.end)
    : isRenderableLineNumberPart(lineNumber)
}

function isRenderablePreviewLine(line: unknown): line is TextLineDto {
  const candidate = line as Partial<TextLineDto> | null
  return (
    candidate?.type === 'TextLine' &&
    typeof candidate.prefix === 'string' &&
    isRenderableLineNumber(candidate.lineNumber) &&
    Array.isArray(candidate.content) &&
    candidate.content.every(isRenderablePreviewToken)
  )
}

function hasRenderablePreview(dto: Partial<QuerySummaryItemDto>): boolean {
  const preview = dto.matchingLinePreview
  if (preview === undefined || preview === null) {
    return true
  }
  return (
    Array.isArray(preview.lines) && preview.lines.every(isRenderablePreviewLine)
  )
}

function hasSummaryMetadata(dto: Partial<QuerySummaryItemDto>): boolean {
  return (
    typeof dto.description === 'string' && typeof dto.hasPhoto === 'boolean'
  )
}

function hasSummaryScript(dto: Partial<QuerySummaryItemDto>): boolean {
  return typeof dto.script === 'object' && dto.script !== null
}

export function isQuerySummaryItemDto(
  dto: unknown,
): dto is QuerySummaryItemDto {
  const candidate = dto as Partial<QuerySummaryItemDto>
  return (
    hasSummaryMetadata(candidate) &&
    hasSummaryScript(candidate) &&
    hasRenderablePreview(candidate)
  )
}

function createSummaryReferences(
  references: readonly ReferenceDto[],
  bibliographyDocuments: BibliographyDocumentsDto,
): readonly Reference[] {
  return references.map((reference) => {
    const document = reference.document ?? bibliographyDocuments[reference.id]
    return createReference({ ...reference, document }).withIdentity(
      reference.id,
      !document,
    )
  })
}

function createSummaryArchaeology(
  archaeology: QuerySummaryArchaeologyDto | undefined,
) {
  return archaeology
    ? {
        excavationNumber: archaeology.excavationNumber
          ? museumNumberToString(archaeology.excavationNumber)
          : undefined,
        site: archaeology.site
          ? { name: archaeology.site.name, abbreviation: '', parent: null }
          : undefined,
      }
    : undefined
}

export function createQuerySummaryFragment(
  dto: QuerySummaryItemDto,
  bibliographyDocuments: BibliographyDocumentsDto,
): Fragment {
  return Fragment.create({
    number: museumNumberToString(dto.museumNumber),
    accession: dto.accession ? museumNumberToString(dto.accession) : '',
    publication: '',
    acquisition: null,
    description: dto.description,
    joins: [],
    measures: {
      length: null,
      width: null,
      thickness: null,
      lengthNote: null,
      widthNote: null,
      thicknessNote: null,
    },
    collection: '',
    legacyScript: '',
    cdliImages: [],
    folios: [],
    record: [],
    text: createTransliteration({
      lines: dto.matchingLinePreview?.lines ?? [],
    }),
    notes: { text: '', parts: [] },
    museum: Museums.HYPERURANION,
    references: createSummaryReferences(
      dto.references ?? [],
      bibliographyDocuments,
    ),
    uncuratedReferences: null,
    traditionalReferences: [],
    atf: '',
    hasPhoto: dto.hasPhoto,
    genres: Genres.fromJson(dto.genres ?? []),
    introduction: { text: '', parts: [] },
    script: createScript(dto.script),
    externalNumbers: {},
    projects: (dto.projects ?? []).map(createResearchProject),
    dossiers: dto.dossiers ?? [],
    date: dto.date ? MesopotamianDate.fromJson(dto.date) : undefined,
    datesInText: [],
    archaeology: createSummaryArchaeology(dto.archaeology),
  })
}
