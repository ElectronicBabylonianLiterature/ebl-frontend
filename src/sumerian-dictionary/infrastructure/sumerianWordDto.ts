import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import {
  Alias,
  AkkadianEquivalent,
  Citation,
  CrossReference,
  Match,
  Rendering,
  RenderingKind,
  SignEntry,
  SumerianSource,
  WordLink,
} from 'sumerian-dictionary/domain/SumerianWordParts'
import { SumerianWordSummary } from 'sumerian-dictionary/domain/SumerianWordSummary'

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type WordLinkDto = WithOptional<WordLink, 'homonym' | 'guideWord'>

type SignEntryDto = WithOptional<
  SignEntry,
  | 'signList'
  | 'characterList'
  | 'knownWrongCharacter'
  | 'determinative'
  | 'unresolved'
  | 'formOf'
>

type RenderingDto = WithOptional<
  Omit<Rendering, 'source' | 'kind' | 'printed'>,
  'unrendered' | 'signLists' | 'knownWrongCharacters'
>

type AttingerVariantRenderingDto = RenderingDto & {
  readonly printed?: string
}

type CrossReferenceDto = Omit<
  WithOptional<CrossReference, 'ambiguous'>,
  'targets' | 'nameTargets'
> & {
  readonly targets: readonly WordLinkDto[]
  readonly nameTargets: readonly WordLinkDto[]
}

type MatchDto = WithOptional<
  Match,
  'curatedOid' | 'curatedStatus' | 'oidStatus' | 'review'
>

export type SumerianWordDto = Omit<
  WithOptional<SumerianWord, 'atf' | 'truncated'>,
  | 'id'
  | 'signs'
  | 'renderings'
  | 'head'
  | 'compounds'
  | 'nameCompounds'
  | 'crossReferences'
  | 'aliases'
  | 'akkadianEquivalents'
  | 'citations'
  | 'attestation'
  | 'sources'
  | 'match'
> & {
  readonly _id: string
  readonly signs: readonly SignEntryDto[]
  readonly attingerKeyRenderings: readonly RenderingDto[]
  readonly attingerVariantRenderings: readonly AttingerVariantRenderingDto[]
  readonly epsd2FormRenderings: readonly RenderingDto[]
  readonly head: WordLinkDto | null
  readonly compounds: readonly WordLinkDto[]
  readonly nameCompounds: readonly WordLinkDto[]
  readonly crossReferences: readonly CrossReferenceDto[]
  readonly aliases: readonly WithOptional<Alias, 'meanings' | 'uncertain'>[]
  readonly akkadianEquivalents: readonly WithOptional<
    AkkadianEquivalent,
    'indexNumbers'
  >[]
  readonly citations: readonly WithOptional<
    Citation,
    'passage' | 'etcsl' | 'compositionId'
  >[]
  readonly attestation: Partial<SumerianWord['attestation']>
  readonly sources: Partial<SumerianWord['sources']>
  readonly match: MatchDto
}

export type SumerianWordSummaryDto = Omit<
  WithOptional<SumerianWordSummary, 'matchedAlias'>,
  'id'
> & { readonly _id: string }

export function toWordLink(dto: WordLinkDto): WordLink {
  return {
    id: dto.id,
    citationForm: dto.citationForm,
    homonym: dto.homonym ?? '',
    guideWord: dto.guideWord ?? '',
  }
}

function toSignEntry(dto: SignEntryDto): SignEntry {
  return {
    ...dto,
    signList: dto.signList ?? '',
    characterList: dto.characterList ?? '',
    knownWrongCharacter: dto.knownWrongCharacter ?? false,
    determinative: dto.determinative ?? false,
    unresolved: dto.unresolved ?? false,
    formOf: dto.formOf ?? [],
  }
}

function toRenderings(
  dtos: readonly AttingerVariantRenderingDto[],
  source: SumerianSource,
  kind: RenderingKind,
): readonly Rendering[] {
  return dtos.map((dto) => ({
    ...dto,
    source,
    kind,
    unrendered: dto.unrendered ?? [],
    printed: dto.printed ?? '',
    signLists: dto.signLists ?? [],
    knownWrongCharacters: dto.knownWrongCharacters ?? [],
  }))
}

function toCrossReference(dto: CrossReferenceDto): CrossReference {
  return {
    ...dto,
    targets: dto.targets.map(toWordLink),
    nameTargets: dto.nameTargets.map(toWordLink),
    ambiguous: dto.ambiguous ?? false,
  }
}

function toMatch(dto: MatchDto): Match {
  return {
    ...dto,
    curatedOid: dto.curatedOid ?? '',
    curatedStatus: dto.curatedStatus ?? '',
    oidStatus: dto.oidStatus ?? '',
    review: dto.review ?? [],
  }
}

export function toSumerianWord({
  _id,
  attingerKeyRenderings,
  attingerVariantRenderings,
  epsd2FormRenderings,
  ...dto
}: SumerianWordDto): SumerianWord {
  return {
    ...dto,
    id: _id,
    atf: dto.atf ?? '',
    truncated: dto.truncated ?? false,
    signs: dto.signs.map(toSignEntry),
    renderings: [
      ...toRenderings(attingerKeyRenderings, 'attinger', 'key'),
      ...toRenderings(attingerVariantRenderings, 'attinger', 'variant'),
      ...toRenderings(epsd2FormRenderings, 'epsd2', 'form'),
    ],
    head: dto.head ? toWordLink(dto.head) : null,
    compounds: dto.compounds.map(toWordLink),
    nameCompounds: dto.nameCompounds.map(toWordLink),
    crossReferences: dto.crossReferences.map(toCrossReference),
    aliases: dto.aliases.map((alias) => ({
      ...alias,
      meanings: alias.meanings ?? [],
      uncertain: alias.uncertain ?? false,
    })),
    akkadianEquivalents: dto.akkadianEquivalents.map((equivalent) => ({
      ...equivalent,
      indexNumbers: equivalent.indexNumbers ?? '',
    })),
    citations: dto.citations.map((citation) => ({
      ...citation,
      passage: citation.passage ?? '',
      etcsl: citation.etcsl ?? '',
      compositionId: citation.compositionId ?? '',
    })),
    attestation: {
      count: dto.attestation.count ?? 0,
      periods: dto.attestation.periods ?? [],
    },
    sources: {
      attinger: dto.sources.attinger ?? null,
      epsd2: dto.sources.epsd2 ?? null,
    },
    match: toMatch(dto.match),
  }
}

export function toSumerianWordSummary({
  _id,
  ...dto
}: SumerianWordSummaryDto): SumerianWordSummary {
  return { ...dto, id: _id, matchedAlias: dto.matchedAlias ?? '' }
}
