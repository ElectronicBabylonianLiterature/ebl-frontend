import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'
import createReference from 'bibliography/application/createReference'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import {
  RealiaEntry,
  ReallexikonEntry,
  AfoRegisterEntry,
  RealiaCrossReference,
} from 'realia/domain/RealiaEntry'

interface ReallexikonEntryDto {
  readonly id: string
  readonly title: string
  readonly reference: ReferenceDto | null
}

interface RealiaCrossReferenceDto {
  readonly id: string
  readonly lemma: string
}

interface AfoRegisterEntryDto {
  readonly mainWord: string
  readonly note: string
  readonly afoVolume: string
  readonly page: string
  readonly AfO: string
  readonly reference: string
  readonly crossReference: string
  readonly crossReferences: Nullable<RealiaCrossReferenceDto>
}

type Nullable<T> = readonly T[] | T | null | undefined

interface RealiaEntryDto {
  readonly _id: string
  readonly realiaId: string
  readonly relatedTerms: Nullable<string>
  readonly type: Nullable<string>
  readonly wikidataId: Nullable<string>
  readonly afoRegister: Nullable<AfoRegisterEntryDto>
  readonly reallexikon: Nullable<ReallexikonEntryDto>
  readonly crossReferences: Nullable<RealiaCrossReferenceDto>
  readonly afoCrossReferences: Nullable<RealiaCrossReferenceDto>
  readonly references: Nullable<ReferenceDto>
}

function toArray<T>(value: Nullable<T>): readonly T[] {
  if (value === null || value === undefined) {
    return []
  }
  return Array.isArray(value) ? value : [value as T]
}

function mapReallexikonEntry(dto: ReallexikonEntryDto): ReallexikonEntry {
  return {
    id: dto.id,
    title: dto.title,
    reference: dto.reference ? createReference(dto.reference) : null,
  }
}

function mapCrossReference(dto: RealiaCrossReferenceDto): RealiaCrossReference {
  return { id: dto.id, lemma: dto.lemma }
}

function mapAfoRegisterEntry(dto: AfoRegisterEntryDto): AfoRegisterEntry {
  return {
    mainWord: dto.mainWord,
    note: dto.note,
    afoVolume: dto.afoVolume,
    page: dto.page,
    AfO: dto.AfO,
    reference: dto.reference,
    crossReference: dto.crossReference,
    crossReferences: toArray(dto.crossReferences).map(mapCrossReference),
  }
}

function mapRealiaEntry(dto: RealiaEntryDto): RealiaEntry {
  const reallexikonDtos = toArray(dto.reallexikon)
  const reallexikonReferenceIds = new Set(
    reallexikonDtos
      .map((entry) => entry.reference?.id)
      .filter((id): id is string => id != null),
  )
  return {
    id: dto._id,
    realiaId: dto.realiaId,
    relatedTerms: toArray(dto.relatedTerms),
    type: toArray(dto.type),
    wikidataId: toArray(dto.wikidataId),
    afoRegister: toArray(dto.afoRegister).map(mapAfoRegisterEntry),
    reallexikon: reallexikonDtos.map(mapReallexikonEntry),
    crossReferences: toArray(dto.crossReferences).map(mapCrossReference),
    afoCrossReferences: toArray(dto.afoCrossReferences).map(mapCrossReference),
    references: toArray(dto.references)
      .filter((reference) => !reallexikonReferenceIds.has(reference.id))
      .map(createReference),
  }
}

export default class RealiaRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  find(realiaId: string): Promise<RealiaEntry> {
    return this.apiClient
      .fetchJson<RealiaEntryDto>(
        `/realia/${encodeURIComponent(realiaId)}`,
        false,
      )
      .then(mapRealiaEntry)
  }

  search(query: string): Promise<readonly RealiaEntry[]> {
    return this.apiClient
      .fetchJson<RealiaEntryDto[]>(`/realia?query=${query}`, false)
      .then((result) => result.map(mapRealiaEntry))
  }
}
