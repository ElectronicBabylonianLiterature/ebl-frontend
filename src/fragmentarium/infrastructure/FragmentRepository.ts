import Promise from 'bluebird'
import _ from 'lodash'
import { stringify } from 'query-string'
import produce, { castDraft } from 'immer'
import {
  Fragment,
  FragmentInfo,
  RecordEntry,
} from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import { Text } from 'transliteration/domain/text'
import Museum from 'fragmentarium/domain/museum'
import {
  FragmentRepository,
  CdliInfo,
  AnnotationRepository,
} from 'fragmentarium/application/FragmentService'
import Annotation from 'fragmentarium/domain/annotation'
import {
  FragmentInfosPromise,
  FragmentInfoRepository,
} from 'fragmentarium/application/FragmentSearchService'
import Reference from 'bibliography/domain/Reference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { Draft } from 'immer/dist/types/types-external'
import { EmptyLine } from 'transliteration/domain/line'
import { TextLine } from 'transliteration/domain/text-line'
import {
  LooseDollarLine,
  ImageDollarLine,
  RulingDollarLine,
  SealDollarLine,
  StateDollarLine,
} from 'transliteration/domain/dollar-lines'
import {
  SealAtLine,
  HeadingAtLine,
  ColumnAtLine,
  DiscourseAtLine,
  SurfaceAtLine,
  ObjectAtLine,
  DivisionAtLine,
  CompositeAtLine,
} from 'transliteration/domain/at-lines'
import { NoteLine } from 'transliteration/domain/note-line'
import { ControlLine } from 'transliteration/domain/line'
import { LemmatizationDto } from 'transliteration/domain/Lemmatization'
import { FolioPagerData, FragmentPagerData } from 'fragmentarium/domain/pager'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { Genres } from 'fragmentarium/domain/Genres'
import Word from 'dictionary/domain/Word'
import { LineToVecRanking } from 'fragmentarium/domain/lineToVecRanking'
import TranslationLine from 'transliteration/domain/translation-line'

const lineClases = {
  TextLine: TextLine,
  ControlLine: ControlLine,
  EmptyLine: EmptyLine,
  NoteLine: NoteLine,
  LooseDollarLine: LooseDollarLine,
  ImageDollarLine: ImageDollarLine,
  RulingDollarLine: RulingDollarLine,
  SealDollarLine: SealDollarLine,
  StateDollarLine: StateDollarLine,
  SealAtLine: SealAtLine,
  HeadingAtLine: HeadingAtLine,
  ColumnAtLine: ColumnAtLine,
  DiscourseAtLine: DiscourseAtLine,
  SurfaceAtLine: SurfaceAtLine,
  ObjectAtLine: ObjectAtLine,
  DivisionAtLine: DivisionAtLine,
  CompositeAtLine: CompositeAtLine,
  ParallelFragment: ControlLine,
  ParallelText: ControlLine,
  ParallelComposition: ControlLine,
  TranslationLine: TranslationLine,
}

function createText(text): Text {
  return new Text({
    lines: text.lines.map((lineDto) => {
      const LineClass = lineClases[lineDto.type]
      if (LineClass) {
        return new LineClass(lineDto)
      } else {
        console.error(`Unknown line type "${lineDto.type}.`)
        return new ControlLine(lineDto)
      }
    }),
  })
}

function createFragment(dto): Fragment {
  return Fragment.create({
    ...dto,
    number: museumNumberToString(dto.museumNumber),
    museum: Museum.of(dto.museum),
    joins: dto.joins,
    measures: {
      length: dto.length.value || null,
      width: dto.width.value || null,
      thickness: dto.thickness.value || null,
    },
    folios: dto.folios.map((folioDto) => new Folio(folioDto)),
    record: dto.record.map((recordDto) => new RecordEntry(recordDto)),
    text: createText(dto.text),
    references: dto.references,
    uncuratedReferences: dto.uncuratedReferences,
    genres: Genres.fromJson(dto.genres),
  })
}

function createFragmentPath(number: string, ...subResources: string[]): string {
  return ['/fragments', encodeURIComponent(number), ...subResources].join('/')
}

class ApiFragmentRepository
  implements FragmentInfoRepository, FragmentRepository, AnnotationRepository {
  readonly apiClient

  constructor(apiClient: {
    fetchJson: (url: string, authorize: boolean) => Promise<any>
    postJson: (url: string, body: Record<string, unknown>) => Promise<any>
  }) {
    this.apiClient = apiClient
  }

  statistics(): Promise<{ transliteratedFragments: number; lines: number }> {
    return this.apiClient.fetchJson(`/statistics`, false)
  }

  lineToVecRanking(number: string): Promise<LineToVecRanking> {
    return this.apiClient.fetchJson(createFragmentPath(number, 'match'), true)
  }

  find(number: string): Promise<Fragment> {
    return this.apiClient
      .fetchJson(createFragmentPath(number), true)
      .then(createFragment)
  }

  random(): FragmentInfosPromise {
    return this._fetch({ random: true })
  }

  interesting(): FragmentInfosPromise {
    return this._fetch({ interesting: true })
  }

  fetchLatestTransliterations(): FragmentInfosPromise {
    return this._fetch({ latest: true })
  }

  fetchNeedsRevision(): FragmentInfosPromise {
    return this._fetch({ needsRevision: true })
  }

  searchNumber(number: string): FragmentInfosPromise {
    return this._fetch({ number })
  }

  searchReference(id: string, pages: string): FragmentInfosPromise {
    return this._fetch({ id, pages }).then(
      produce((draft: Draft<FragmentInfo[]>) => {
        for (const fragInfo of draft) {
          fragInfo.references = castDraft(
            fragInfo.references.map(
              (ref) =>
                new Reference(
                  ref.type || Reference.DEFAULT_TYPE,
                  ref.pages || '',
                  ref.notes || '',
                  ref.linesCited || [],
                  new BibliographyEntry(ref.document)
                )
            )
          )
        }
      })
    )
  }

  searchTransliteration(transliteration: string): FragmentInfosPromise {
    return this._fetch({ transliteration })
  }

  _fetch(params: Record<string, unknown>): FragmentInfosPromise {
    return this.apiClient.fetchJson(`/fragments?${stringify(params)}`, true)
  }
  fetchGenres(): Promise<string[][]> {
    return this.apiClient.fetchJson('/genres', true)
  }

  updateGenres(number: string, genres: Genres): Promise<Fragment> {
    const path = createFragmentPath(number, 'genres')
    return this.apiClient
      .postJson(path, {
        genres: genres.genres,
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

  findAnnotations(number: string): Promise<readonly Annotation[]> {
    return this.apiClient
      .fetchJson(`${createFragmentPath(number)}/annotations`, true)
      .then((dto) =>
        produce(dto.annotations, (annotations) =>
          annotations.map(
            ({ geometry, data }) =>
              new Annotation({ ...geometry, type: 'RECTANGLE' }, data)
          )
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
}

export default ApiFragmentRepository
