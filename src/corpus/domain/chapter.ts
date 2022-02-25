import _ from 'lodash'
import { immerable } from 'immer'
import Cite from 'citation-js'
import { LineNumber } from 'transliteration/domain/line-number'
import { MarkupPart } from 'transliteration/domain/markup'
import { Token } from 'transliteration/domain/token'
import { ChapterAlignment } from './alignment'
import { Line, ManuscriptLine } from './line'
import { Manuscript } from './manuscript'
import { TextId } from './text'

export interface ChapterId {
  readonly textId: TextId
  readonly stage: string
  readonly name: string
}

export class Chapter {
  readonly [immerable] = true

  constructor(
    readonly textId: TextId,
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

export interface LineDisplay {
  readonly number: LineNumber
  readonly isSecondLineOfParallelism: boolean
  readonly isBeginningOfSection: boolean
  readonly intertext: ReadonlyArray<MarkupPart>
  readonly reconstruction: ReadonlyArray<Token>
  readonly translation: ReadonlyArray<MarkupPart>
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
    readonly textName: string,
    readonly isSingleStage: boolean,
    readonly title: ReadonlyArray<MarkupPart>,
    readonly lines: ReadonlyArray<LineDisplay>,
    readonly record: Record
  ) {}

  get isPublished(): boolean {
    return (
      !_.isEmpty(this.record.publicationDate) && !_.isEmpty(this.record.authors)
    )
  }

  get uniqueIdentifier(): string {
    return [
      this.id.textId.genre,
      this.id.textId.category,
      this.id.textId.index,
      this.id.stage,
      this.id.name,
    ].join(' ')
  }

  get fullName(): string {
    const showName = this.id.name !== '-' || this.isSingleStage
    return [
      this.textName,
      'Chapter',
      !this.isSingleStage ? this.id.stage : '',
      showName ? this.id.name : '',
    ]
      .filter(_.negate(_.isEmpty))
      .join(' ')
  }

  get url(): string {
    return `https://www.ebl.lmu.de/corpus/${[
      this.id.textId.genre,
      this.id.textId.category,
      this.id.textId.index,
      this.id.stage,
      this.id.name,
    ]
      .map(encodeURIComponent)
      .join('/')}`
  }

  get citation(): Cite {
    const issued = new Date(this.record.publicationDate)
    const now = new Date()
    return new Cite({
      id: this.uniqueIdentifier,
      type: 'article-journal',
      author: this.record.authors.map((author) => ({
        family: author.name,
        given: author.prefix,
      })),
      accessed: {
        'date-parts': [[now.getFullYear(), now.getMonth() + 1, now.getDate()]],
      },
      issued: {
        'date-parts': [
          [issued.getFullYear(), issued.getMonth() + 1, now.getDate()],
        ],
      },
      title: this.fullName,
      'container-title': 'electronic Babylonian Literature',
      URL: this.url,
    })
  }
}
