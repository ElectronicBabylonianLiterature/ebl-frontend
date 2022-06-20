import React, { PropsWithChildren, useState } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import DisplayToken, { DisplayLineGroupToken } from './DisplayToken'
import DictionaryWord from 'dictionary/domain/Word'
import {
  isEnclosure,
  isShift,
  isDocumentOrientedGloss,
  isCommentaryProtocol,
  isColumn,
} from 'transliteration/domain/type-guards'
import {
  Shift,
  Token,
  CommentaryProtocol,
  Protocol,
  LemmatizableToken,
  Enclosure,
  isLeftSide,
} from 'transliteration/domain/token'
import { LemmaMap, LineLemmasContext } from './LineLemmasContext'

function WordSeparator({
  modifiers: bemModifiers = [],
}: {
  modifiers?: readonly string[]
}): JSX.Element {
  const element = 'Transliteration__wordSeparator'
  return (
    <span
      className={classNames([
        element,
        bemModifiers.map((flag) => `${element}--${flag}`),
      ])}
    >
      &nbsp;
    </span>
  )
}

function isCloseEnclosure(token: Token): boolean {
  return isEnclosure(token) && ['CENTER', 'RIGHT'].includes(token.side)
}

function isOpenEnclosure(token: Token): boolean {
  return isEnclosure(token) && ['CENTER', 'LEFT'].includes(token.side)
}

function GlossWrapper({ children }: PropsWithChildren<unknown>): JSX.Element {
  return (
    <sup className="Transliteration__DocumentOrientedGloss">{children}</sup>
  )
}

interface ColumnData {
  span: number | null
  content: React.ReactNode[]
}

type ColumnTokenTypes =
  | 'Shift'
  | 'CommentaryProtocol'
  | 'DocumentOrientedGloss'
  | 'Column'
  | ''

class LineAccumulator {
  private columns: ColumnData[] = []
  private inGloss = false
  private language = 'AKKADIAN'
  private enclosureOpened = false
  private protocol: Protocol | null = null
  lemmas: string[] = []

  getColumns(maxColumns: number): React.ReactNode[] {
    return this.columns.map((column: ColumnData, index: number) => (
      <td key={index} colSpan={column.span ?? maxColumns}>
        {column.content}
      </td>
    ))
  }

  get flatResult(): React.ReactNode[] {
    return this.columns.flatMap((column) => column.content)
  }

  get bemModifiers(): readonly string[] {
    return this.protocol === null
      ? [this.language]
      : [this.language, this.protocol.replace('!', 'commentary-protocol-')]
  }

  applyLanguage(token: Shift): void {
    this.language = token.language
  }

  applyCommentaryProtocol(token: CommentaryProtocol): void {
    this.protocol = token.value
  }

  pushToken(token: Token, isInLineGroup = false): void {
    if (_.isEmpty(this.columns)) {
      this.addColumn(1)
    }
    if (this.requireSeparator(token)) {
      this.pushSeparator()
    }

    const DisplayTokenComponent = isInLineGroup
      ? DisplayLineGroupToken
      : DisplayToken

    _.last(this.columns)?.content.push(
      this.inGloss && !isEnclosure(token) ? (
        <DisplayToken
          key={this.index}
          token={token}
          bemModifiers={this.bemModifiers}
          Wrapper={GlossWrapper}
        />
      ) : (
        <DisplayTokenComponent
          key={this.index}
          token={token}
          bemModifiers={this.bemModifiers}
        />
      )
    )
    this.enclosureOpened = isOpenEnclosure(token)
  }

  private pushLemma(lemma: readonly string[]): void {
    this.lemmas.push(...lemma)
  }

  addColumn(span: number | null): void {
    this.columns.push({ span: span, content: [] })
  }

  openGloss(): void {
    this.inGloss = true
  }

  closeGloss(): void {
    this.inGloss = false
  }

  private getTokenType(token: Token): ColumnTokenTypes {
    let tokenType: ColumnTokenTypes = ''
    if (isShift(token)) {
      tokenType = 'Shift'
    }
    if (isCommentaryProtocol(token)) {
      tokenType = 'CommentaryProtocol'
    }
    if (isDocumentOrientedGloss(token)) {
      tokenType = 'DocumentOrientedGloss'
    }
    if (isColumn(token)) {
      tokenType = 'Column'
    }

    return tokenType
  }

  addColumnToken(token: Token, isInLineGroup: boolean): void {
    switch (this.getTokenType(token)) {
      case 'Shift':
        this.applyLanguage(token as Shift)
        break
      case 'CommentaryProtocol':
        this.applyCommentaryProtocol(token as CommentaryProtocol)
        break
      case 'DocumentOrientedGloss':
        isLeftSide(token as Enclosure) ? this.openGloss() : this.closeGloss()
        break
      case 'Column':
        throw new Error('Unexpected column token.')

      default:
        this.pushToken(token, isInLineGroup)
        this.pushLemma(token.uniqueLemma || [])
        break
    }
  }

  private requireSeparator(token: Token): boolean {
    return !isCloseEnclosure(token) && !this.enclosureOpened
  }

  private pushSeparator(): void {
    _.last(this.columns)?.content.push(
      this.inGloss ? (
        <GlossWrapper key={`${this.index}-separator`}>
          <WordSeparator modifiers={this.bemModifiers} />
        </GlossWrapper>
      ) : (
        <WordSeparator
          key={`${this.index}-separator`}
          modifiers={this.bemModifiers}
        />
      )
    )
  }

  private get index(): number {
    return _(this.columns)
      .map((column) => column.content.length)
      .sum()
  }
}

export function LineTokens({
  content,
}: {
  content: ReadonlyArray<Token>
}): JSX.Element {
  return (
    <>
      {
        content.reduce((acc: LineAccumulator, token: Token) => {
          if (isShift(token)) {
            acc.applyLanguage(token)
          } else if (isCommentaryProtocol(token)) {
            acc.applyCommentaryProtocol(token)
          } else if (isDocumentOrientedGloss(token)) {
            isLeftSide(token) ? acc.openGloss() : acc.closeGloss()
          } else {
            acc.pushToken(token)
          }
          return acc
        }, new LineAccumulator()).flatResult
      }
    </>
  )
}

export function LineColumns({
  columns,
  maxColumns,
  isInLineGroup = false,
}: {
  columns: readonly { span: number | null; content: readonly Token[] }[]
  maxColumns: number
  isInLineGroup?: boolean
}): JSX.Element {
  const [lemmaMap, lemmaSetter] = useState<LemmaMap>(new Map())
  const lineAccumulator = columns.reduce((acc: LineAccumulator, column) => {
    acc.addColumn(column.span)
    column.content.reduce((acc: LineAccumulator, token: Token) => {
      acc.addColumnToken(token, isInLineGroup)
      return acc
    }, acc)
    return acc
  }, new LineAccumulator())
  return (
    <LineLemmasContext.Provider
      value={{
        lemmaKeys: lineAccumulator.lemmas,
        lemmaMap: lemmaMap,
        lemmaSetter: lemmaSetter,
      }}
    >
      {lineAccumulator.getColumns(maxColumns)}
    </LineLemmasContext.Provider>
  )
}

export class LineToken {
  token: LemmatizableToken
  lemma: DictionaryWord[] | null = null
  siglum: string | null = null

  constructor(token: LemmatizableToken, siglum: string | null = null) {
    this.token = token
    this.siglum = siglum
  }

  public setLemma(lemma: DictionaryWord[]): void {
    this.lemma = lemma
  }

  get alignment(): number | null {
    return this.token.alignment
  }

  get isVariant(): boolean {
    return !_.isNil(this.token.variant)
  }

  get isManuscriptToken(): boolean {
    return !_.isNull(this.siglum)
  }

  get cleanValue(): string {
    return this.token.cleanValue
  }
}
