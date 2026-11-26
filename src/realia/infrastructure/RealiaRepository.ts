import ApiClient from 'http/ApiClient'
import createReference from 'bibliography/application/createReference'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import Reference from 'bibliography/domain/Reference'
import {
  RealiaEntry,
  ReallexikonEntry,
  AfoRegisterEntry,
  RealiaCrossReference,
  EblRealiaEntry,
  RealiaReferenceType,
  realiaReferenceTypes,
} from 'realia/domain/RealiaEntry'

type EmbeddedReferenceDto = Pick<ReferenceDto, 'id'> & Partial<ReferenceDto>

interface ReallexikonEntryDto {
  readonly id: string
  readonly title: string
  readonly reference: EmbeddedReferenceDto | null
}

interface EblRealiaEntryDto {
  readonly id: string
  readonly transliteration?: string
  readonly normalisation?: string
  readonly translation?: string
  readonly identification?: string
  readonly pos?: string
  readonly wikidataId?: Nullable<string>
  readonly reference?: EmbeddedReferenceDto | null
  readonly remarks?: string
}

interface RealiaCrossReferenceDto {
  readonly id: string
  readonly lemma: string
}

interface AfoRegisterEntryDto {
  readonly mainWord: string
  readonly note: string
  readonly afoVolume?: string
  readonly page?: string
  readonly AfO: string
  readonly reference: string
  readonly crossReference: string
  readonly crossReferences: Nullable<RealiaCrossReferenceDto>
}

type Nullable<T> = readonly T[] | T | null | undefined

interface RealiaEntryDto {
  readonly _id: string
  readonly realiaId?: string
  readonly relatedTerms: Nullable<string>
  readonly type: Nullable<string>
  readonly wikidataId: Nullable<string>
  readonly afoRegister: Nullable<AfoRegisterEntryDto>
  readonly reallexikon: Nullable<ReallexikonEntryDto>
  readonly crossReferences: Nullable<RealiaCrossReferenceDto>
  readonly afoCrossReferences: Nullable<RealiaCrossReferenceDto>
  readonly references: Nullable<ReferenceDto>
  readonly referenceType?: Nullable<string>
  readonly eblRealia?: Nullable<EblRealiaEntryDto>
}

function toArray<T>(value: Nullable<T>): readonly T[] {
  if (value === null || value === undefined) {
    return []
  }
  return Array.isArray(value) ? value : [value as T]
}

function mapEmbeddedReference(
  dto: EmbeddedReferenceDto | null | undefined,
  documentReferences: readonly ReferenceDto[],
): Reference | null {
  if (!dto) {
    return null
  }
  const documentReference = documentReferences.find(
    (reference) => reference.id === dto.id,
  )
  return createReference({
    type: 'DISCUSSION',
    pages: '',
    notes: '',
    linesCited: [],
    ...dto,
    document: dto.document ?? documentReference?.document,
  })
}

function mapReallexikonEntry(
  dto: ReallexikonEntryDto,
  documentReferences: readonly ReferenceDto[],
): ReallexikonEntry {
  return {
    id: dto.id,
    title: dto.title,
    reference: mapEmbeddedReference(dto.reference, documentReferences),
  }
}

function mapEblRealiaEntry(
  dto: EblRealiaEntryDto,
  documentReferences: readonly ReferenceDto[],
): EblRealiaEntry {
  return {
    id: dto.id,
    transliteration: dto.transliteration ?? '',
    normalisation: dto.normalisation ?? '',
    translation: dto.translation ?? '',
    identification: dto.identification ?? '',
    pos: dto.pos ?? '',
    wikidataId: toArray(dto.wikidataId),
    reference: mapEmbeddedReference(dto.reference, documentReferences),
    remarks: dto.remarks ?? '',
  }
}

function isRealiaReferenceType(value: string): value is RealiaReferenceType {
  return (realiaReferenceTypes as readonly string[]).includes(value)
}

function mapCrossReference(dto: RealiaCrossReferenceDto): RealiaCrossReference {
  return { id: dto.id, lemma: dto.lemma }
}

function parseAfoCitation(afo: string): {
  afoVolume: string
  year: string
  page: string
} {
  const trimmed = afo.trim()
  const withYear = trimmed.match(/^(.*?)\s*\(([^)]*)\)\s*,?\s*(.*)$/)
  if (withYear) {
    return {
      afoVolume: withYear[1].trim(),
      year: withYear[2].trim(),
      page: withYear[3].trim(),
    }
  }
  const lastComma = trimmed.lastIndexOf(',')
  if (lastComma !== -1) {
    return {
      afoVolume: trimmed.slice(0, lastComma).trim(),
      year: '',
      page: trimmed.slice(lastComma + 1).trim(),
    }
  }
  return { afoVolume: trimmed, year: '', page: '' }
}

function mapAfoRegisterEntry(dto: AfoRegisterEntryDto): AfoRegisterEntry {
  const parsed = parseAfoCitation(dto.AfO)
  return {
    mainWord: dto.mainWord,
    note: dto.note,
    afoVolume: dto.afoVolume ?? parsed.afoVolume,
    year: parsed.year,
    page: dto.page ?? parsed.page,
    AfO: dto.AfO,
    reference: dto.reference,
    crossReference: dto.crossReference,
    crossReferences: toArray(dto.crossReferences).map(mapCrossReference),
  }
}

function mapRealiaEntry(dto: RealiaEntryDto): RealiaEntry {
  const documentReferences = toArray(dto.references)
  const reallexikon = toArray(dto.reallexikon).map((entry) =>
    mapReallexikonEntry(entry, documentReferences),
  )
  const eblRealia = toArray(dto.eblRealia).map((entry) =>
    mapEblRealiaEntry(entry, documentReferences),
  )
  const sectionReferenceIds = new Set(
    [...reallexikon, ...eblRealia]
      .map((entry) => entry.reference?.id)
      .filter((id): id is string => id != null),
  )
  return {
    id: dto._id,
    realiaId: dto.realiaId ?? dto._id,
    relatedTerms: toArray(dto.relatedTerms),
    type: toArray(dto.type),
    wikidataId: toArray(dto.wikidataId),
    afoRegister: toArray(dto.afoRegister).map(mapAfoRegisterEntry),
    reallexikon,
    crossReferences: toArray(dto.crossReferences).map(mapCrossReference),
    afoCrossReferences: toArray(dto.afoCrossReferences).map(mapCrossReference),
    references: documentReferences
      .filter((reference) => !sectionReferenceIds.has(reference.id))
      .map(createReference),
    referenceType: toArray(dto.referenceType).filter(isRealiaReferenceType),
    eblRealia,
  }
}

export default class RealiaRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  private fetchEntry(path: string, signal?: AbortSignal): Promise<RealiaEntry> {
    return this.apiClient
      .fetchJson<RealiaEntryDto>(path, false, signal)
      .then(mapRealiaEntry)
  }

  find(lemma: string, signal?: AbortSignal): Promise<RealiaEntry> {
    return this.fetchEntry(`/realia/${encodeURIComponent(lemma)}`, signal)
  }

  findByRealiaId(realiaId: string, signal?: AbortSignal): Promise<RealiaEntry> {
    return this.fetchEntry(
      `/realia/by-id/${encodeURIComponent(realiaId)}`,
      signal,
    )
  }

  search(query: string, signal?: AbortSignal): Promise<readonly RealiaEntry[]> {
    const path = `/realia?query=${encodeURIComponent(query)}`
    return this.apiClient
      .fetchJson<RealiaEntryDto[]>(path, false, signal)
      .then((result) => result.map(mapRealiaEntry))
  }

  listAllRealia(): Promise<string[]> {
    return this.apiClient.fetchJson<string[]>(`/realia/all`, false)
  }
}
