import _ from 'lodash'
import { immerable } from 'immer'
import flow from 'lodash/fp/flow'
import flatMap from 'lodash/fp/flatMap'
import map from 'lodash/fp/map'
import Cite from 'citation-js'
import removeMd from 'remove-markdown'
import { LineNumber, OldLineNumber } from 'transliteration/domain/line-number'
import { MarkupPart } from 'transliteration/domain/markup'
import { ChapterAlignment } from './alignment'
import { Line, ManuscriptLine } from './line'
import { Manuscript } from './manuscript'
import { TextId, textIdToDoiString } from 'transliteration/domain/text-id'
import TranslationLine from 'transliteration/domain/translation-line'
import { ChapterId, defaultName } from 'transliteration/domain/chapter-id'
import { NoteLine } from 'transliteration/domain/note-line'
import { ParallelLine } from 'transliteration/domain/parallel-line'
import { Token } from 'transliteration/domain/token'
import { LineDetails, ManuscriptLineDisplay } from 'corpus/domain/line-details'
import { stageToAbbreviation } from 'common/period'

export class Chapter {
  readonly [immerable] = true

  constructor(
    readonly textId: TextId,
    readonly textHasDoi: boolean,
    readonly classification: string,
    readonly stage: string,
    readonly version: string,
    readonly name: string,
    readonly order: number,
    readonly manuscripts: ReadonlyArray<Manuscript>,
    readonly uncertainFragments: ReadonlyArray<string>,
    readonly lines: ReadonlyArray<Line>
  ) {}

  get id(): ChapterId {
    return {
      textId: this.textId,
      stage: this.stage,
      name: this.name,
    }
  }

  get alignment(): ChapterAlignment {
    return new ChapterAlignment(
      this.lines.map((line) =>
        line.variants.map((variant) => variant.alignment)
      )
    )
  }

  getSiglum(manuscriptLine: ManuscriptLine): string {
    const manuscript = this.manuscripts.find(
      (candidate) => candidate.id === manuscriptLine.manuscriptId
    )
    if (manuscript) {
      return manuscript.siglum
    } else {
      return `<unknown ID: ${manuscriptLine.manuscriptId}>`
    }
  }
}

export interface LineVariantDisplay {
  readonly index: number
  readonly reconstruction: ReadonlyArray<Token>
  readonly note: NoteLine | null
  readonly manuscripts: ReadonlyArray<ManuscriptLineDisplay>
  readonly parallelLines: ReadonlyArray<ParallelLine>
  readonly intertext: ReadonlyArray<MarkupPart>
}

export interface LineDisplay {
  readonly number: LineNumber
  readonly oldLineNumbers: ReadonlyArray<OldLineNumber>
  readonly isSecondLineOfParallelism: boolean
  readonly isBeginningOfSection: boolean
  readonly translation: ReadonlyArray<TranslationLine>
  readonly variants: ReadonlyArray<LineVariantDisplay>
}

export interface DictionaryLineDisplay {
  textId: TextId
  textName: string
  chapterName: string
  stage: string
  line: LineDisplay
  lineDetails: LineDetails
}

export interface Author {
  readonly name: string
  readonly prefix: string
  readonly role: 'EDITOR' | 'REVISION'
  readonly orcidNumber: string
}

export interface Translator {
  readonly name: string
  readonly prefix: string
  readonly orcidNumber: string
  readonly language: string
}

export interface Record {
  readonly authors: ReadonlyArray<Author>
  readonly translators: ReadonlyArray<Translator>
  readonly publicationDate: string
}

export class ChapterDisplay {
  readonly [immerable] = true

  constructor(
    readonly id: ChapterId,
    readonly textHasDoi: boolean,
    readonly textName: string,
    readonly isSingleStage: boolean,
    readonly title: ReadonlyArray<MarkupPart>,
    readonly lines: ReadonlyArray<LineDisplay>,
    readonly record: Record,
    readonly atf: string
  ) {}

  get languages(): Set<string> {
    return flow(
      flatMap<LineDisplay, TranslationLine>((line) => line.translation),
      map((translation) => translation.language),
      (languages) => new Set(languages)
    )(this.lines)
  }

  get isPublished(): boolean {
    return (
      !_.isEmpty(this.record.publicationDate) && !_.isEmpty(this.record.authors)
    )
  }

  get uniqueIdentifier(): string {
    return this.idParts.join(' ')
  }

  get fullName(): string {
    const showName = this.id.name !== defaultName || this.isSingleStage
    return [
      removeMd(this.textName),
      'Chapter',
      !this.isSingleStage ? this.id.stage : '',
      showName ? this.id.name : '',
    ]
      .filter(_.negate(_.isEmpty))
      .join(' ')
  }

  get url(): string {
    const idPartsAbbreviation = [
      ...this.idParts.slice(0, 3),
      stageToAbbreviation(this.idParts[3]),
      this.idParts[4],
    ]
    return `https://www.ebl.lmu.de/corpus/${idPartsAbbreviation
      .map(encodeURIComponent)
      .join('/')}`
  }

  get doi(): string {
    return this.textHasDoi ? textIdToDoiString(this.id.textId) : ''
  }

  getNames(
    names: readonly Author[] | readonly Translator[]
  ): { family: string[]; given: string[] }[] {
    return names.map((name) => {
      return {
        family: name.name,
        given: name.prefix,
      }
    })
  }

  getAuthorsByRole(role: string): { family: string[]; given: string[] }[] {
    return this.getNames(
      this.record.authors.filter((author) => author.role === role)
    )
  }

  get citation(): Cite {
    const issued = new Date(this.record.publicationDate)
    const now = new Date()
    return new Cite({
      id: this.uniqueIdentifier,
      type: 'article-journal',
      author: this.getNames(this.record.authors),
      authorPrimary: this.getAuthorsByRole('EDITOR'),
      authorRevision: this.getAuthorsByRole('REVISION'),
      translator: this.getNames(this.record.translators),
      accessed: {
        'date-parts': [[now.getFullYear(), now.getMonth() + 1, now.getDate()]],
      },
      issued: {
        'date-parts': [
          [issued.getFullYear(), issued.getMonth() + 1, issued.getDate()],
        ],
      },
      title: this.fullName,
      'container-title': 'electronic Babylonian Library',
      URL: this.url,
      ...(this.doi && { DOI: this.doi }),
    })
  }

  private get idParts(): readonly [string, number, number, string, string] {
    return [
      this.id.textId.genre,
      this.id.textId.category,
      this.id.textId.index,
      this.id.stage,
      this.id.name,
    ]
  }

  getTranslatorsOf(language: string): Translator[] {
    return this.record.translators.filter(
      (translator) => translator.language === language
    )
  }
}
