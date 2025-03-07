import classNames from 'classnames'
import _ from 'lodash'
import React, { FunctionComponent, PropsWithChildren } from 'react'
import {
  Protocol,
  Shift,
  CommentaryProtocol,
  isLeftSide,
  Token,
} from 'transliteration/domain/token'
import { isEnclosure } from 'transliteration/domain/type-guards'
import DisplayToken, { DisplayLineGroupToken } from './DisplayToken'
import { PhoneticProps } from 'akkadian/application/phonetics/segments'

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

export type TokenActionWrapperProps = PropsWithChildren<{ token: Token }>

function DefaultTokenActionWrapper({
  children,
}: TokenActionWrapperProps): JSX.Element {
  return <>{children}</>
}

export class LineAccumulator {
  private columns: ColumnData[] = []
  private inGloss = false
  private language = 'AKKADIAN'
  private enclosureOpened = false
  private protocol: Protocol | null = null
  private isFirstWord = true
  private isInLineGroup = false
  private showMeter = false
  private showIpa = false
  private TokenActionWrapper: FunctionComponent<TokenActionWrapperProps>
  lemmas: string[] = []

  constructor(
    isInLineGroup?: boolean,
    showMeter?: boolean,
    showIpa?: boolean,
    TokenActionWrapper?: FunctionComponent<TokenActionWrapperProps>
  ) {
    this.isInLineGroup = isInLineGroup || false
    this.showMeter = showMeter || false
    this.showIpa = showIpa || false
    this.TokenActionWrapper = TokenActionWrapper || DefaultTokenActionWrapper
  }

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

  pushToken(
    token: Token,
    index: number,
    phoneticProps?: PhoneticProps,
    bemModifiers: string[] = []
  ): void {
    if (_.isEmpty(this.columns)) {
      this.addColumn(1)
    }
    if (this.requireSeparator(token, index)) {
      this.pushSeparator()
    }

    const DisplayTokenComponent = this.isInLineGroup
      ? DisplayLineGroupToken
      : DisplayToken

    _.last(this.columns)?.content.push(
      <this.TokenActionWrapper key={index} token={token}>
        <DisplayTokenComponent
          token={token}
          bemModifiers={[...this.bemModifiers, ...bemModifiers]}
          Wrapper={
            this.inGloss && !isEnclosure(token) ? GlossWrapper : undefined
          }
          showMeter={this.showMeter}
          showIpa={this.showIpa}
          phoneticProps={phoneticProps}
        />
      </this.TokenActionWrapper>
    )
    this.enclosureOpened = isOpenEnclosure(token)
  }

  private pushLemma(lemma: readonly string[] | null | undefined): void {
    if (lemma) {
      this.lemmas.push(...lemma)
    }
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

  addColumnToken(
    token: Token,
    index: number,
    phoneticProps?: PhoneticProps,
    bemModifiers: string[] = []
  ): void {
    switch (token.type) {
      case 'LanguageShift':
        this.applyLanguage(token)
        break
      case 'CommentaryProtocol':
        this.applyCommentaryProtocol(token)
        break
      case 'DocumentOrientedGloss':
        isLeftSide(token) ? this.openGloss() : this.closeGloss()
        break
      case 'Column':
        throw new Error('Unexpected column token.')
      default:
        this.pushToken(token, index, phoneticProps, bemModifiers)
        this.pushLemma(token.uniqueLemma)
        this.isFirstWord = false
    }
  }

  private requireSeparator(token: Token, index: number): boolean {
    return (
      !this.isFirstWord && !isCloseEnclosure(token) && !this.enclosureOpened
    )
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
