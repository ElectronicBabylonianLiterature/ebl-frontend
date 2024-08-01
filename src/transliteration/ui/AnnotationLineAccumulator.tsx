import React from 'react'
import _ from 'lodash'
import {
  Protocol,
  Shift,
  CommentaryProtocol,
  isLeftSide,
  Token,
} from 'transliteration/domain/token'
import { isEnclosure } from 'transliteration/domain/type-guards'
import DisplayToken from './DisplayToken'
import {
  GlossWrapper,
  isCloseEnclosure,
  isOpenEnclosure,
} from './LineAccumulator'

export class MarkableToken {
  readonly token: Token
  readonly isInGloss: boolean
  readonly protocol: Protocol | null = null
  readonly language: string
  readonly hasLeadingWhitespace: boolean

  constructor(
    token: Token,
    isInGloss: boolean,
    protocol: Protocol | null,
    language: string,
    hasLeadingWhitespace?: boolean
  ) {
    this.token = token
    this.isInGloss = isInGloss
    this.protocol = protocol
    this.language = language
    this.hasLeadingWhitespace = hasLeadingWhitespace || false
  }

  display(): JSX.Element {
    return (
      <>
        {this.hasLeadingWhitespace && ' '}
        <DisplayToken
          token={this.token}
          bemModifiers={
            this.protocol === null
              ? [this.language]
              : [
                  this.language,
                  this.protocol.replace('!', 'commentary-protocol-'),
                ]
          }
          Wrapper={
            this.isInGloss && !isEnclosure(this.token)
              ? GlossWrapper
              : undefined
          }
          isInPopover={true}
        />
      </>
    )
  }
}

export interface MarkableColumnData {
  span: number | null
  content: MarkableToken[]
}

export class AnnotationLineAccumulator {
  readonly columns: MarkableColumnData[] = []
  private inGloss = false
  private language = 'AKKADIAN'
  private enclosureOpened = false
  private protocol: Protocol | null = null
  private isFirstWord = true
  lemmas: string[] = []

  get flatResult(): MarkableToken[] {
    return this.columns.flatMap((column) => column.content)
  }

  applyLanguage(token: Shift): void {
    this.language = token.language
  }

  applyCommentaryProtocol(token: CommentaryProtocol): void {
    this.protocol = token.value
  }

  pushToken(token: Token, index: number): void {
    if (_.isEmpty(this.columns)) {
      this.addColumn(1)
    }

    _.last(this.columns)?.content.push(
      new MarkableToken(
        token,
        this.inGloss,
        this.protocol,
        this.language,
        this.requireSeparator(token, index)
      )
    )
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

  addColumnToken(token: Token, index: number): void {
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
        this.pushToken(token, index)
        this.isFirstWord = false
    }
  }

  private requireSeparator(token: Token, index: number): boolean {
    return (
      !this.isFirstWord && !isCloseEnclosure(token) && !this.enclosureOpened
    )
  }
}
