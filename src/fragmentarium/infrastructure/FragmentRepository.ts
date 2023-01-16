import Promise from 'bluebird'
import _ from 'lodash'
import { stringify } from 'query-string'
import produce from 'immer'
import {
  Fragment,
  FragmentInfo,
  RecordEntry,
  Script,
  ScriptDto,
} from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import Museum from 'fragmentarium/domain/museum'
import {
  AnnotationRepository,
  CdliInfo,
  FragmentRepository,
} from 'fragmentarium/application/FragmentService'
import Annotation from 'fragmentarium/domain/annotation'
import {
  FragmentInfoRepository,
  FragmentInfosPromise,
  FragmentInfosPaginationPromise,
} from 'fragmentarium/application/FragmentSearchService'
import Reference from 'bibliography/domain/Reference'
import { LemmatizationDto } from 'transliteration/domain/Lemmatization'
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
import FragmentDto from 'fragmentarium/domain/FragmentDtos'
import { PeriodModifiers, Periods } from 'common/period'
import { FragmentQuery } from 'query/FragmentQuery'
import { QueryResult } from 'query/QueryResult'

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
  return joins.map((group) =>
    group.map((join) => ({
      ...join,
      museumNumber: museumNumberToString(join.museumNumber),
    }))
  )
}

function createFragment(dto: FragmentDto): Fragment {
  return Fragment.create({
    ...dto,
    number: museumNumberToString(dto.museumNumber),
    museum: Museum.of(dto.museum),
    joins: createJoins(dto.joins),
    measures: {
      length: dto.length.value || null,
      width: dto.width.value || null,
      thickness: dto.thickness.value || null,
    },
    folios: dto.folios.map((folioDto) => new Folio(folioDto)),
    record: dto.record.map((recordDto) => new RecordEntry(recordDto)),
    text: createTransliteration(dto.text),
    references: dto.references.map(createReference),
    uncuratedReferences: dto.uncuratedReferences,
    genres: Genres.fromJson(dto.genres),
    script: createScript(dto.script),
  })
}

export function createFragmentInfo(dto): FragmentInfo {
  return { ...dto, script: createScript(dto.script) }
}

function createFragmentPath(number: string, ...subResources: string[]): string {
  return ['/fragments', encodeURIComponent(number), ...subResources].join('/')
}

class ApiFragmentRepository
  implements FragmentInfoRepository, FragmentRepository, AnnotationRepository {
  constructor(
    private readonly apiClient: {
      fetchJson: (url: string, authorize: boolean) => Promise<any>
      postJson: (url: string, body: Record<string, unknown>) => Promise<any>
    }
  ) {}

  statistics(): Promise<{ transliteratedFragments: number; lines: number }> {
    return this.apiClient.fetchJson(`/statistics`, false)
  }

  lineToVecRanking(number: string): Promise<LineToVecRanking> {
    return this.apiClient
      .fetchJson(createFragmentPath(number, 'match'), true)
      .then(createLineToVecRanking)
  }

  find(number: string, lines?: readonly number[]): Promise<Fragment> {
    return this.apiClient
      .fetchJson(
        `/fragments/${encodeURIComponent(number)}${
          _.isNil(lines)
            ? ''
            : `?${stringify({
                lines: lines,
              })}`
        }`,
        true
      )
      .then(createFragment)
  }

  random(): FragmentInfosPromise {
    return this._fetch({ random: true }).then((fragmentInfos) =>
      fragmentInfos.map(createFragmentInfo)
    )
  }

  interesting(): FragmentInfosPromise {
    return this._fetch({ interesting: true }).then((fragmentInfos) =>
      fragmentInfos.map(createFragmentInfo)
    )
  }

  fetchLatestTransliterations(): FragmentInfosPromise {
    return this._fetch({ latest: true }).then((fragmentInfos) =>
      fragmentInfos.map(createFragmentInfo)
    )
  }

  fetchNeedsRevision(): FragmentInfosPromise {
    return this._fetch({ needsRevision: true }).then((fragmentInfos) =>
      fragmentInfos.map(createFragmentInfo)
    )
  }

  searchFragmentarium(
    number: string,
    transliteration: string,
    bibliographyId: string,
    pages: string,
    paginationIndex: number
  ): FragmentInfosPaginationPromise {
    return this._fetch({
      number,
      transliteration,
      bibliographyId,
      pages,
      paginationIndex,
    }).then((dto: any) => {
      const fragmentInfos = dto.fragmentInfos.map((fragmentInfo) => ({
        ...fragmentInfo,
        matchingLines: fragmentInfo.matchingLines
          ? createTransliteration(fragmentInfo.matchingLines)
          : null,
        genres: Genres.fromJson(fragmentInfo.genres),
        script: createScript(fragmentInfo.script),
        references: fragmentInfo.references.map(createReference),
      }))

      return { fragmentInfos: fragmentInfos, totalCount: dto.totalCount }
    })
  }

  _fetch(params: Record<string, unknown>): FragmentInfosPromise {
    return this.apiClient.fetchJson(`/fragments?${stringify(params)}`, true)
  }

  fetchGenres(): Promise<string[][]> {
    return this.apiClient.fetchJson('/genres', true)
  }

  fetchPeriods(): Promise<string[]> {
    return this.apiClient.fetchJson('/periods', true)
  }

  updateGenres(number: string, genres: Genres): Promise<Fragment> {
    const path = createFragmentPath(number, 'genres')
    return this.apiClient
      .postJson(path, {
        genres: genres.genres,
      })
      .then(createFragment)
  }

  updateScript(number: string, script: Script): Promise<Fragment> {
    const path = createFragmentPath(number, 'script')
    return this.apiClient
      .postJson(path, {
        script: {
          period: script.period.name,
          periodModifier: script.periodModifier.name,
          uncertain: script.uncertain,
        },
      })
      .then(createFragment)
  }

  updateTransliteration(
    number: string,
    transliteration: string,
    notes: string
  ): Promise<Fragment> {
    const path = createFragmentPath(number, 'transliteration')
    return this.apiClient
      .postJson(path, {
        transliteration: transliteration,
        notes: notes,
      })
      .then(createFragment)
  }

  updateIntroduction(number: string, introduction: string): Promise<Fragment> {
    const path = createFragmentPath(number, 'introduction')
    return this.apiClient
      .postJson(path, {
        introduction: introduction,
      })
      .then(createFragment)
  }

  updateLemmatization(
    number: string,
    lemmatization: LemmatizationDto
  ): Promise<Fragment> {
    const path = createFragmentPath(number, 'lemmatization')
    return this.apiClient
      .postJson(path, { lemmatization: lemmatization })
      .then(createFragment)
  }

  updateReferences(number: string, references: Reference[]): Promise<Fragment> {
    const path = createFragmentPath(number, 'references')
    return this.apiClient
      .postJson(path, { references: references })
      .then(createFragment)
  }

  folioPager(folio: Folio, number: string): Promise<FolioPagerData> {
    return this.apiClient.fetchJson(
      `/fragments/${encodeURIComponent(number)}/pager/${encodeURIComponent(
        folio.name
      )}/${encodeURIComponent(folio.number)}`,
      true
    )
  }

  fragmentPager(fragmentNumber: string): Promise<FragmentPagerData> {
    return this.apiClient.fetchJson(
      `/fragments/${encodeURIComponent(fragmentNumber)}/pager`,
      true
    )
  }

  findLemmas(word: string, isNormalized: boolean): Promise<Word[][]> {
    return this.apiClient.fetchJson(
      `/lemmas?word=${encodeURIComponent(
        word
      )}&isNormalized=${encodeURIComponent(isNormalized)}`,
      true
    )
  }

  fetchCdliInfo(cdliNumber: string): Promise<CdliInfo> {
    return this.apiClient
      .fetchJson(`/cdli/${encodeURIComponent(cdliNumber)}`, true)
      .catch((error: Error) => {
        if (error.name === 'ApiError') {
          return { photoUrl: null, lineArtUrl: null, detailLineArtUrl: null }
        } else {
          throw error
        }
      })
  }

  findAnnotations(
    number: string,
    generateAnnotations = false
  ): Promise<readonly Annotation[]> {
    return this.apiClient
      .fetchJson(
        `${createFragmentPath(
          number
        )}/annotations?generateAnnotations=${generateAnnotations}`,
        true
      )
      .then(({ annotations }) =>
        annotations.map(
          ({ geometry, data }) =>
            new Annotation({ ...geometry, type: 'RECTANGLE' }, data)
        )
      )
  }

  updateAnnotations(
    number: string,
    annotations: readonly Annotation[]
  ): Promise<readonly Annotation[]> {
    return this.apiClient.postJson(
      `${createFragmentPath(number)}/annotations`,
      {
        fragmentNumber: number,
        annotations: annotations.map(
          produce((annotation) => ({
            geometry: _.omit(annotation.geometry, 'type'),
            data: annotation.data,
          }))
        ),
      }
    )
  }

  findInCorpus(number: string): Promise<ReadonlyArray<ManuscriptAttestation>> {
    return this.apiClient
      .fetchJson(`${createFragmentPath(number)}/corpus`, true)
      .then((manuscriptAttestations) =>
        manuscriptAttestations.map(
          (manuscriptAttestation) =>
            new ManuscriptAttestation(
              manuscriptAttestation.text,
              manuscriptAttestation.chapterId,
              manuscriptAttestation.manuscript,
              manuscriptAttestation.manuscriptSiglum
            )
        )
      )
  }

  query(fragmentQuery: FragmentQuery): Promise<QueryResult> {
    return this.apiClient.fetchJson(
      `/fragments/query?${stringify(fragmentQuery)}`,
      true
    )
  }
}

export default ApiFragmentRepository
