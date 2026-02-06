import Promise from 'bluebird'
import _ from 'lodash'
import { stringify } from 'query-string'
import { produce } from 'immer'
import {
  Fragment,
  FragmentInfo,
  FragmentInfoDto,
  Script,
  ScriptDto,
} from 'fragmentarium/domain/fragment'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import Folio from 'fragmentarium/domain/Folio'
import { Acquisition } from 'fragmentarium/domain/Acquisition'
import { Museums, MuseumKey } from 'fragmentarium/domain/museum'
import {
  AnnotationRepository,
  EditionFields,
  FragmentRepository,
} from 'fragmentarium/application/FragmentService'
import Annotation, {
  AnnotationData,
  Geometry,
} from 'fragmentarium/domain/annotation'
import {
  FragmentInfoRepository,
  FragmentInfosDtoPromise,
  FragmentInfosPromise,
} from 'fragmentarium/application/FragmentSearchService'
import Reference from 'bibliography/domain/Reference'
import { LemmatizationDto } from 'transliteration/domain/Lemmatization'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { fromManuscriptDto } from 'corpus/application/dtos'
import { FolioPagerData, FragmentPagerData } from 'fragmentarium/domain/pager'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { Genres } from 'fragmentarium/domain/Genres'
import Word from 'dictionary/domain/Word'
import {
  LineToVecRanking,
  LineToVecRankingDto,
  LineToVecScore,
  LineToVecScoreDto,
} from 'fragmentarium/domain/lineToVecRanking'
import createReference from 'bibliography/application/createReference'
import { createTransliteration } from 'transliteration/application/dtos'
import { Joins } from 'fragmentarium/domain/join'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import FragmentDto, {
  MesopotamianDateDto,
} from 'fragmentarium/domain/FragmentDtos'
import { PeriodModifiers, Periods } from 'common/period'
import { FragmentQuery } from 'query/FragmentQuery'
import {
  QueryItem,
  QueryResult,
  FragmentAfoRegisterQueryResult,
} from 'query/QueryResult'
import { createResearchProject } from 'research-projects/researchProject'
import { MesopotamianDate } from 'chronology/domain/Date'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { createArchaeology } from 'fragmentarium/domain/archaeologyDtos'
import { JsonApiClient } from 'index'
import { Colophon } from 'fragmentarium/domain/Colophon'
import { fromDto as fromTextDto } from 'corpus/application/dtos'
import {
  LemmaSuggestions,
  LineLemmaAnnotations,
} from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import { UncertainFragmentAttestation } from 'corpus/domain/uncertainFragmentAttestation'
import { ApiEntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'

export function createScript(dto: ScriptDto): Script {
  return {
    ...dto,
    period: Periods[dto.period],
    periodModifier: PeriodModifiers[dto.periodModifier],
  }
}

function createLineToVecScore(dto: LineToVecScoreDto): LineToVecScore {
  return { ...dto, script: createScript(dto.script) }
}

function createLineToVecRanking(dto: LineToVecRankingDto): LineToVecRanking {
  return {
    score: dto.score.map(createLineToVecScore),
    scoreWeighted: dto.scoreWeighted.map(createLineToVecScore),
  }
}

export function createJoins(joins): Joins {
  const safeJoins = joins ?? []
  return safeJoins.map((group) =>
    (group ?? []).map((join) => ({
      ...join,
      museumNumber: museumNumberToString(join.museumNumber),
    })),
  )
}

function createFragment(dto: FragmentDto): Fragment {
  const museumKey: MuseumKey = dto.museum
  return Fragment.create({
    ...dto,
    number: museumNumberToString(dto.museumNumber),
    accession: dto.accession ? museumNumberToString(dto.accession) : '',
    acquisition: dto.acquisition
      ? new Acquisition(
          dto.acquisition.supplier,
          dto.acquisition.date,
          dto.acquisition.description,
        )
      : null,
    museum: Museums[museumKey],
    joins: createJoins(dto.joins ?? []),
    measures: {
      length: dto.length.value || null,
      width: dto.width.value || null,
      thickness: dto.thickness.value || null,
      lengthNote: dto.length.note || null,
      widthNote: dto.width.note || null,
      thicknessNote: dto.thickness.note || null,
    },
    folios: (dto.folios ?? []).map((folioDto) => new Folio(folioDto)),
    record: (dto.record ?? []).map((recordDto) => new RecordEntry(recordDto)),
    text: createTransliteration(dto.text),
    references: (dto.references ?? []).map(createReference),
    uncuratedReferences: dto.uncuratedReferences ?? null,
    cdliImages: dto.cdliImages,
    traditionalReferences: dto.traditionalReferences,
    genres: Genres.fromJson(dto.genres),
    script: createScript(dto.script),
    projects: (dto.projects ?? []).map(createResearchProject),
    dossiers: dto.dossiers ?? [],
    date: dto.date ? MesopotamianDate.fromJson(dto.date) : undefined,
    datesInText: dto.datesInText
      ? dto.datesInText.map((date) => MesopotamianDate.fromJson(date))
      : [],
    archaeology: dto.archaeology
      ? createArchaeology(dto.archaeology)
      : undefined,
    colophon: dto.colophon ? Colophon.fromJson(dto.colophon) : undefined,
  })
}

export function createFragmentInfo(dto: FragmentInfoDto): FragmentInfo {
  return {
    ...dto,
    script: createScript(dto.script),
    accession: dto.accession ? museumNumberToString(dto.accession) : '',
  }
}

function createFragmentPath(number: string, ...subResources: string[]): string {
  return ['/fragments', encodeURIComponent(number), ...subResources].join('/')
}

function createQueryItem(dto): QueryItem {
  return {
    ...dto,
    museumNumber: museumNumberToString(dto.museumNumber),
  }
}

function createQueryResult(dto): QueryResult {
  return {
    matchCountTotal: dto.matchCountTotal,
    items: dto.items.map(createQueryItem),
  }
}

class ApiFragmentRepository
  implements FragmentInfoRepository, FragmentRepository, AnnotationRepository
{
  constructor(private readonly apiClient: JsonApiClient) {}

  statistics(): Promise<{
    transliteratedFragments: number
    lines: number
    totalFragments: number
  }> {
    return this.apiClient.fetchJson<{
      transliteratedFragments: number
      lines: number
      totalFragments: number
    }>(`/statistics`, false)
  }

  lineToVecRanking(number: string): Promise<LineToVecRanking> {
    return this.apiClient
      .fetchJson<LineToVecRankingDto>(
        createFragmentPath(number, 'match'),
        false,
      )
      .then(createLineToVecRanking)
  }

  find(
    number: string,
    lines?: readonly number[],
    excludeLines?: boolean,
  ): Promise<Fragment> {
    const params = _.omitBy(
      { lines: lines, excludeLines: excludeLines },
      (value) => _.isNil(value),
    )
    return this.apiClient
      .fetchJson<FragmentDto>(
        `/fragments/${encodeURIComponent(number)}${
          _.isEmpty(params) ? '' : `?${stringify(params)}`
        }`,
        false,
      )
      .then(createFragment)
  }

  random(): FragmentInfosPromise {
    return this._fetch({ random: true }).then((fragmentInfos) =>
      fragmentInfos.map(createFragmentInfo),
    )
  }

  interesting(): FragmentInfosPromise {
    return this._fetch({ interesting: true }).then((fragmentInfos) =>
      fragmentInfos.map(createFragmentInfo),
    )
  }

  fetchNeedsRevision(): FragmentInfosPromise {
    return this._fetch({ needsRevision: true }).then((fragmentInfos) =>
      fragmentInfos.map(createFragmentInfo),
    )
  }

  _fetch(params: Record<string, unknown>): FragmentInfosDtoPromise {
    return this.apiClient.fetchJson<ReadonlyArray<FragmentInfoDto>>(
      `/fragments?${stringify(params)}`,
      false,
    )
  }

  fetchGenres(): Promise<string[][]> {
    return this.apiClient.fetchJson<string[][]>('/genres', false)
  }

  fetchProvenances(): Promise<string[][]> {
    return this.apiClient.fetchJson<string[][]>('/provenances', false)
  }

  fetchColophonNames(query: string): Promise<string[]> {
    return this.apiClient.fetchJson<string[]>(
      `/fragments/colophon-names?${stringify({ query })}`,
      false,
    )
  }

  fetchPeriods(): Promise<string[]> {
    return this.apiClient.fetchJson<string[]>('/periods', false)
  }

  updateGenres(number: string, genres: Genres): Promise<Fragment> {
    const path = createFragmentPath(number, 'genres')
    return this.apiClient
      .postJson<FragmentDto>(path, {
        genres: genres.genres,
      })
      .then(createFragment)
  }
  updateScopes(number: string, scopes: string[]): Promise<Fragment> {
    const path = createFragmentPath(number, 'scopes')
    return (
      this.apiClient
        // eslint-disable-next-line camelcase
        .postJson<FragmentDto>(path, { authorized_scopes: scopes })
        .then(createFragment)
    )
  }
  updateScript(number: string, script: Script): Promise<Fragment> {
    const path = createFragmentPath(number, 'script')
    return this.apiClient
      .postJson<FragmentDto>(path, {
        script: {
          period: script.period.name,
          periodModifier: script.periodModifier.name,
          uncertain: script.uncertain,
        },
      })
      .then(createFragment)
  }

  updateDate(number: string, date: MesopotamianDateDto): Promise<Fragment> {
    const path = createFragmentPath(number, 'date')
    return this.apiClient
      .postJson<FragmentDto>(path, { date })
      .then(createFragment)
  }

  updateDatesInText(
    number: string,
    datesInText: readonly MesopotamianDateDto[],
  ): Promise<Fragment> {
    const path = createFragmentPath(number, 'dates-in-text')
    return this.apiClient
      .postJson<FragmentDto>(path, { datesInText })
      .then(createFragment)
  }

  updateEdition(number: string, updates: EditionFields): Promise<Fragment> {
    const path = createFragmentPath(number, 'edition')
    return this.apiClient
      .postJson<FragmentDto>(path, _.omitBy(updates, _.isNull))
      .then(createFragment)
  }

  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto,
  ): Promise<Fragment> {
    const path = createFragmentPath(number, 'lemmatization')
    return this.apiClient
      .postJson<FragmentDto>(path, { lemmatization: lemmatization })
      .then(createFragment)
  }

  updateLemmaAnnotation(
    number: string,
    annotations: LineLemmaAnnotations,
  ): Promise<Fragment> {
    const path = createFragmentPath(number, 'lemma-annotation')
    return this.apiClient
      .postJson<FragmentDto>(path, annotations)
      .then(createFragment)
  }

  updateReferences(number: string, references: Reference[]): Promise<Fragment> {
    const path = createFragmentPath(number, 'references')
    return this.apiClient
      .postJson<FragmentDto>(path, { references: references })
      .then(createFragment)
  }

  updateArchaeology(
    number: string,
    archaeology: ArchaeologyDto,
  ): Promise<Fragment> {
    const path = createFragmentPath(number, 'archaeology')
    return this.apiClient
      .postJson<FragmentDto>(path, { archaeology: archaeology })
      .then(createFragment)
  }

  updateColophon(number: string, colophon: Colophon): Promise<Fragment> {
    const path = createFragmentPath(number, 'colophon')
    return this.apiClient
      .postJson<FragmentDto>(path, { colophon: colophon })
      .then(createFragment)
  }

  folioPager(folio: Folio, number: string): Promise<FolioPagerData> {
    return this.apiClient.fetchJson<FolioPagerData>(
      `/fragments/${encodeURIComponent(number)}/pager/${encodeURIComponent(
        folio.name,
      )}/${encodeURIComponent(folio.number)}`,
      false,
    )
  }

  fragmentPager(fragmentNumber: string): Promise<FragmentPagerData> {
    return this.apiClient.fetchJson<FragmentPagerData>(
      `/fragments/${encodeURIComponent(fragmentNumber)}/pager`,
      false,
    )
  }

  findLemmas(word: string, isNormalized: boolean): Promise<Word[][]> {
    return this.apiClient.fetchJson<Word[][]>(
      `/lemmas?word=${encodeURIComponent(
        word,
      )}&isNormalized=${encodeURIComponent(isNormalized)}`,
      false,
    )
  }

  findAnnotations(
    number: string,
    generateAnnotations = false,
  ): Promise<readonly Annotation[]> {
    return this.apiClient
      .fetchJson<{
        annotations: { geometry: Geometry; data: AnnotationData }[]
      }>(
        `${createFragmentPath(
          number,
        )}/annotations?generateAnnotations=${generateAnnotations}`,
        false,
      )
      .then(({ annotations }) =>
        annotations.map(
          ({ geometry, data }) =>
            new Annotation({ ...geometry, type: 'RECTANGLE' }, data),
        ),
      )
  }

  updateAnnotations(
    number: string,
    annotations: readonly Annotation[],
  ): Promise<readonly Annotation[]> {
    return this.apiClient.postJson<readonly Annotation[]>(
      `${createFragmentPath(number)}/annotations`,
      {
        fragmentNumber: number,
        annotations: annotations.map(
          produce((annotation) => ({
            geometry: _.omit(annotation.geometry, 'type'),
            data: annotation.data,
          })),
        ),
      },
    )
  }

  findInCorpus(number: string): Promise<{
    manuscriptAttestations: ReadonlyArray<ManuscriptAttestation>
    uncertainFragmentAttestations: ReadonlyArray<UncertainFragmentAttestation>
  }> {
    return this.apiClient
      .fetchJson<{
        manuscriptAttestations: Array<{
          text: Record<string, unknown>
          chapterId: ChapterId
          manuscript: Record<string, unknown>
          manuscriptSiglum: string
        }>
        uncertainFragmentAttestations: Array<{
          text: Record<string, unknown>
          chapterId: ChapterId
        }>
      }>(`${createFragmentPath(number)}/corpus`, false)
      .then((response) => ({
        manuscriptAttestations: (response.manuscriptAttestations ?? []).map(
          (manuscriptAttestation) =>
            new ManuscriptAttestation(
              fromTextDto(manuscriptAttestation.text),
              manuscriptAttestation.chapterId,
              fromManuscriptDto(manuscriptAttestation.manuscript),
              manuscriptAttestation.manuscriptSiglum,
            ),
        ),
        uncertainFragmentAttestations: (
          response.uncertainFragmentAttestations ?? []
        ).map(
          (uncertain) =>
            new UncertainFragmentAttestation(
              fromTextDto(uncertain.text),
              uncertain.chapterId,
            ),
        ),
      }))
  }

  query(fragmentQuery: FragmentQuery): Promise<QueryResult> {
    return this.apiClient
      .fetchJson<QueryResult>(
        `/fragments/query?${stringify(fragmentQuery)}`,
        false,
      )
      .then(createQueryResult)
  }

  queryLatest(): Promise<QueryResult> {
    return this.apiClient
      .fetchJson<QueryResult>('/fragments/latest', false)
      .then(createQueryResult)
  }

  queryByTraditionalReferences(
    traditionalReferences: string[],
  ): Promise<FragmentAfoRegisterQueryResult> {
    return this.apiClient.postJson<FragmentAfoRegisterQueryResult>(
      `/fragments/query-by-traditional-references`,
      {
        traditionalReferences,
      },
      false,
    )
  }

  listAllFragments(): Promise<string[]> {
    return this.apiClient.fetchJson<string[]>(`/fragments/all`, false)
  }

  collectLemmaSuggestions(number: string): Promise<LemmaSuggestions> {
    return this.apiClient
      .fetchJson<
        Record<string, Word[]>
      >(`${createFragmentPath(number)}/collect-lemmas`, false)
      .then((suggestions) => {
        return new Map(
          Object.entries(
            _.mapValues(suggestions, (wordDtos) =>
              wordDtos.map((word) => new LemmaOption(word, true)),
            ),
          ),
        )
      })
  }

  fetchNamedEntityAnnotations(
    number: string,
  ): Promise<readonly ApiEntityAnnotationSpan[]> {
    return this.apiClient.fetchJson<readonly ApiEntityAnnotationSpan[]>(
      createFragmentPath(number, 'named-entities'),
      false,
    )
  }

  updateNamedEntityAnnotations(
    number: string,
    annotations: readonly ApiEntityAnnotationSpan[],
  ): Promise<Fragment> {
    return this.apiClient
      .postJson<FragmentDto>(createFragmentPath(number, 'named-entities'), {
        annotations: annotations,
      })
      .then(createFragment)
  }
}

export default ApiFragmentRepository
