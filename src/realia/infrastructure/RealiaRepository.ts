import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'
import createReference from 'bibliography/application/createReference'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import {
  RealiaEntry,
  ReallexikonEntry,
  AfoRegisterEntry,
  RealiaType,
} from 'realia/domain/RealiaEntry'

interface ReallexikonEntryDto {
  readonly id: string
  readonly title: string
  readonly content: string
  readonly reference: ReferenceDto | null
}

interface AfoRegisterEntryDto {
  readonly mainWord: string
  readonly note: string
  readonly AfO: string
  readonly reference: string
  readonly crossReference: string
}

interface RealiaEntryDto {
  readonly _id: string
  readonly relatedTerms: readonly string[]
  readonly type: readonly RealiaType[]
  readonly wikidataId: readonly string[]
  readonly afoRegister: readonly AfoRegisterEntryDto[]
  readonly reallexikon: readonly ReallexikonEntryDto[]
  readonly references: readonly ReferenceDto[]
}

function mapReallexikonEntry(dto: ReallexikonEntryDto): ReallexikonEntry {
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content,
    reference: dto.reference ? createReference(dto.reference) : null,
  }
}

function mapAfoRegisterEntry(dto: AfoRegisterEntryDto): AfoRegisterEntry {
  return {
    mainWord: dto.mainWord,
    note: dto.note,
    AfO: dto.AfO,
    reference: dto.reference,
    crossReference: dto.crossReference,
  }
}

function mapRealiaEntry(dto: RealiaEntryDto): RealiaEntry {
  return {
    id: dto._id,
    relatedTerms: dto.relatedTerms,
    type: dto.type,
    wikidataId: dto.wikidataId,
    afoRegister: dto.afoRegister.map(mapAfoRegisterEntry),
    reallexikon: dto.reallexikon.map(mapReallexikonEntry),
    references: dto.references.map(createReference),
  }
}

export default class RealiaRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  find(id: string): Promise<RealiaEntry> {
    return this.apiClient
      .fetchJson<RealiaEntryDto>(`/realia/${encodeURIComponent(id)}`, false)
      .then(mapRealiaEntry)
  }

  search(query: string): Promise<readonly RealiaEntry[]> {
    return this.apiClient
      .fetchJson<RealiaEntryDto[]>(`/realia?query=${query}`, false)
      .then((result) => result.map(mapRealiaEntry))
  }
}
