import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'
import createReference from 'bibliography/application/createReference'
import Reference from 'bibliography/domain/Reference'
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
  readonly content: string
  readonly reference: string | null
}

interface AfoRegisterEntryDto {
  readonly mainWord: string
  readonly note: string
  readonly AfO: string
  readonly reference: string
  readonly crossReference: string
}

interface RealiaCrossReferenceDto {
  readonly id: string
  readonly lemma: string
}

type Nullable<T> = readonly T[] | T | null | undefined

interface RealiaEntryDto {
  readonly _id: string
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

const REALLEXIKON_REFERENCE_ID_PREFIX = 'rla_'

function isReallexikonReference(
  reference: ReferenceDto,
  linkedReferenceIds: ReadonlySet<string>,
): boolean {
  return (
    linkedReferenceIds.has(reference.id) ||
    reference.id.startsWith(REALLEXIKON_REFERENCE_ID_PREFIX)
  )
}

function mapReallexikonEntry(
  dto: ReallexikonEntryDto,
  references: readonly ReferenceDto[],
): ReallexikonEntry {
  const referenceDto = dto.reference
    ? references.find((reference) => reference.id === dto.reference)
    : undefined
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content,
    references: referenceDto ? [createReference(referenceDto)] : [],
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

function mapCrossReference(dto: RealiaCrossReferenceDto): RealiaCrossReference {
  return { id: dto.id, lemma: dto.lemma }
}

function attachUnlinkedReallexikonReferences(
  reallexikon: readonly ReallexikonEntry[],
  unlinkedReferences: readonly Reference[],
  fallbackId: string,
): readonly ReallexikonEntry[] {
  if (unlinkedReferences.length === 0) {
    return reallexikon
  }
  if (reallexikon.length === 0) {
    return [
      {
        id: fallbackId,
        title: fallbackId,
        content: '',
        references: unlinkedReferences,
      },
    ]
  }
  return reallexikon.map((entry, index) =>
    index === 0
      ? { ...entry, references: [...entry.references, ...unlinkedReferences] }
      : entry,
  )
}

function mapRealiaEntry(dto: RealiaEntryDto): RealiaEntry {
  const reallexikon = toArray(dto.reallexikon)
  const references = toArray(dto.references)
  const linkedReferenceIds = new Set(
    reallexikon
      .map((entry) => entry.reference)
      .filter((reference): reference is string => reference != null),
  )
  const isReallexikon = (reference: ReferenceDto): boolean =>
    isReallexikonReference(reference, linkedReferenceIds)
  const unlinkedReallexikonReferences = references
    .filter(
      (reference) =>
        isReallexikon(reference) && !linkedReferenceIds.has(reference.id),
    )
    .map(createReference)
  return {
    id: dto._id,
    relatedTerms: toArray(dto.relatedTerms),
    type: toArray(dto.type),
    wikidataId: toArray(dto.wikidataId),
    afoRegister: toArray(dto.afoRegister).map(mapAfoRegisterEntry),
    reallexikon: attachUnlinkedReallexikonReferences(
      reallexikon.map((entry) => mapReallexikonEntry(entry, references)),
      unlinkedReallexikonReferences,
      dto._id,
    ),
    crossReferences: toArray(dto.crossReferences).map(mapCrossReference),
    afoCrossReferences: toArray(dto.afoCrossReferences).map(mapCrossReference),
    references: references
      .filter((reference) => !isReallexikon(reference))
      .map(createReference),
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
