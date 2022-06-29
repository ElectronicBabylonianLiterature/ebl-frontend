import React, { PropsWithChildren } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import DisplayToken from './DisplayToken'
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
} from 'transliteration/domain/token'
import './line-tokens.css'

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
      {' '}
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

class LineAccumulator {
  private columns: ColumnData[] = []
  private inGloss = false
  private language = 'AKKADIAN'
  private enclosureOpened = false
  private protocol: Protocol | null = null

  getColumns(maxColumns: number): React.ReactNode[] {
    return this.columns.map((column: ColumnData, index: number) => (
      <td key={index} colSpan={column.span ?? maxColumns} className="prewrap">
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

  pushToken(token: Token, showMeter = false): void {
    if (_.isEmpty(this.columns)) {
      this.addColumn(1)
    }
    if (this.requireSeparator(token)) {
      this.pushSeparator()
    }
    const component =
      this.inGloss && !isEnclosure(token) ? (
        <DisplayToken
          key={this.index}
          token={token}
          bemModifiers={this.bemModifiers}
          Wrapper={GlossWrapper}
          showMeter={showMeter}
        />
      ) : (
        <DisplayToken
          key={this.index}
          token={token}
          bemModifiers={this.bemModifiers}
          showMeter={showMeter}
        />
      )

    _.last(this.columns)?.content.push(component)
    this.enclosureOpened = isOpenEnclosure(token)
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
            token.side === 'LEFT' ? acc.openGloss() : acc.closeGloss()
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
  showMeter,
}: {
  columns: readonly { span: number | null; content: readonly Token[] }[]
  maxColumns: number
  showMeter?: boolean
}): JSX.Element {
  return (
    <>
      {columns
        .reduce((acc: LineAccumulator, column) => {
          acc.addColumn(column.span)
          column.content.reduce((acc: LineAccumulator, token: Token) => {
            if (isShift(token)) {
              acc.applyLanguage(token)
            } else if (isCommentaryProtocol(token)) {
              acc.applyCommentaryProtocol(token)
            } else if (isDocumentOrientedGloss(token)) {
              token.side === 'LEFT' ? acc.openGloss() : acc.closeGloss()
            } else if (isColumn(token)) {
              throw new Error('Unexpected column token.')
            } else {
              acc.pushToken(token, showMeter)
            }
            return acc
          }, acc)
          return acc
        }, new LineAccumulator())
        .getColumns(maxColumns)}
    </>
  )
}
