import Promise from 'bluebird'
import _ from 'lodash'
import { stringify } from 'query-string'
import produce from 'immer'
import {
  Fragment,
  FragmentInfo,
  FragmentInfoDto,
  Script,
  ScriptDto,
} from 'fragmentarium/domain/fragment'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
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
  FragmentInfosDtoPromise,
  FragmentInfosPromise,
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
import {
  QueryItem,
  QueryResult,
  FragmentAfoRegisterQueryResult,
} from 'query/QueryResult'
import { createResearchProject } from 'research-projects/researchProject'
import { MesopotamianDate } from 'chronology/domain/Date'
import {
  ArchaeologyDto,
  createArchaeology,
} from 'fragmentarium/domain/archaeology'
import { JsonApiClient } from 'index'

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
    accession: dto.accession ? museumNumberToString(dto.accession) : '',
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
    traditionalReferences: dto.traditionalReferences,
    genres: Genres.fromJson(dto.genres),
    script: createScript(dto.script),
    projects: dto.projects.map(createResearchProject),
    date: dto.date ? MesopotamianDate.fromJson(dto.date) : undefined,
    datesInText: dto.datesInText
      ? dto.datesInText.map((date) => MesopotamianDate.fromJson(date))
      : [],
    archaeology: dto.archaeology
      ? createArchaeology(dto.archaeology)
      : undefined,
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
  implements FragmentInfoRepository, FragmentRepository, AnnotationRepository {
  constructor(private readonly apiClient: JsonApiClient) {}

  statistics(): Promise<{ transliteratedFragments: number; lines: number }> {
    return this.apiClient.fetchJson(`/statistics`, false)
  }

  lineToVecRanking(number: string): Promise<LineToVecRanking> {
    return this.apiClient
      .fetchJson(createFragmentPath(number, 'match'), false)
      .then(createLineToVecRanking)
  }

  find(
    number: string,
    lines?: readonly number[],
    excludeLines?: boolean
  ): Promise<Fragment> {
    const params = _.omitBy(
      { lines: lines, excludeLines: excludeLines },
      (value) => _.isNil(value)
    )
    return this.apiClient
      .fetchJson(
        `/fragments/${encodeURIComponent(number)}${
          _.isEmpty(params) ? '' : `?${stringify(params)}`
        }`,
        false
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

  fetchNeedsRevision(): FragmentInfosPromise {
    return this._fetch({ needsRevision: true }).then((fragmentInfos) =>
      fragmentInfos.map(createFragmentInfo)
    )
  }

  _fetch(params: Record<string, unknown>): FragmentInfosDtoPromise {
    return this.apiClient.fetchJson(`/fragments?${stringify(params)}`, false)
  }

  fetchGenres(): Promise<string[][]> {
    return this.apiClient.fetchJson('/genres', false)
  }

  fetchPeriods(): Promise<string[]> {
    return this.apiClient.fetchJson('/periods', false)
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

  updateDate(number: string, date: MesopotamianDate): Promise<Fragment> {
    const path = createFragmentPath(number, 'date')
    return this.apiClient.postJson(path, { date }).then(createFragment)
  }

  updateDatesInText(
    number: string,
    datesInText: readonly MesopotamianDate[]
  ): Promise<Fragment> {
    const path = createFragmentPath(number, 'dates_in_text')
    return this.apiClient.postJson(path, { datesInText }).then(createFragment)
  }

  updateTransliteration(
    number: string,
    transliteration: string
  ): Promise<Fragment> {
    const path = createFragmentPath(number, 'transliteration')
    return this.apiClient
      .postJson(path, {
        transliteration: transliteration,
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

  updateNotes(number: string, notes: string): Promise<Fragment> {
    const path = createFragmentPath(number, 'notes')
    return this.apiClient
      .postJson(path, {
        notes: notes,
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

  updateArchaeology(
    number: string,
    archaeology: ArchaeologyDto
  ): Promise<Fragment> {
    const path = createFragmentPath(number, 'archaeology')
    return this.apiClient
      .postJson(path, { archaeology: archaeology })
      .then(createFragment)
  }

  folioPager(folio: Folio, number: string): Promise<FolioPagerData> {
    return this.apiClient.fetchJson(
      `/fragments/${encodeURIComponent(number)}/pager/${encodeURIComponent(
        folio.name
      )}/${encodeURIComponent(folio.number)}`,
      false
    )
  }

  fragmentPager(fragmentNumber: string): Promise<FragmentPagerData> {
    return this.apiClient.fetchJson(
      `/fragments/${encodeURIComponent(fragmentNumber)}/pager`,
      false
    )
  }

  findLemmas(word: string, isNormalized: boolean): Promise<Word[][]> {
    return this.apiClient.fetchJson(
      `/lemmas?word=${encodeURIComponent(
        word
      )}&isNormalized=${encodeURIComponent(isNormalized)}`,
      false
    )
  }

  fetchCdliInfo(cdliNumber: string): Promise<CdliInfo> {
    return this.apiClient
      .fetchJson(`/cdli/${encodeURIComponent(cdliNumber)}`, false)
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
        false
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
      .fetchJson(`${createFragmentPath(number)}/corpus`, false)
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
    return this.apiClient
      .fetchJson(`/fragments/query?${stringify(fragmentQuery)}`, false)
      .then(createQueryResult)
  }

  queryLatest(): Promise<QueryResult> {
    return this.apiClient
      .fetchJson('/fragments/latest', false)
      .then(createQueryResult)
  }

  queryByTraditionalReferences(
    traditionalReferences: string[]
  ): Promise<FragmentAfoRegisterQueryResult> {
    return this.apiClient.postJson(
      `/fragments/query-by-traditional-references`,
      {
        traditionalReferences,
      },
      false
    )
  }

  listAllFragments(): Promise<string[]> {
    return this.apiClient.fetchJson(`/fragments/all`, false)
  }
}

export default ApiFragmentRepository
