import React, { PropsWithChildren } from 'react'
import classNames from 'classnames'
import DisplayToken from './DisplayToken'
import {
  isEnclosure,
  isShift,
  isDocumentOrientedGloss,
  isCommentaryProtocol,
} from './type-guards'

import './Display.sass'
import {
  Shift,
  Token,
  CommentaryProtocol,
  Protocol,
} from 'fragmentarium/domain/token'

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

function GlossWrapper({ children }: PropsWithChildren<{}>): JSX.Element {
  return (
    <sup className="Transliteration__DocumentOrientedGloss">{children}</sup>
  )
}

class LineAccumulator {
  result: React.ReactNode[] = []
  private inGloss = false
  private language = 'AKKADIAN'
  private enclosureOpened = false
  private protocol: Protocol | null = null

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

  pushToken(token: Token): void {
    if (this.requireSeparator(token)) {
      this.pushSeparator(this.result)
    }

    this.result.push(
      this.inGloss && !isEnclosure(token) ? (
        <DisplayToken
          key={this.result.length}
          token={token}
          bemModifiers={this.bemModifiers}
          Wrapper={GlossWrapper}
        />
      ) : (
        <DisplayToken
          key={this.result.length}
          token={token}
          bemModifiers={this.bemModifiers}
        />
      )
    )
    this.enclosureOpened = isOpenEnclosure(token)
  }

  openGloss(): void {
    this.inGloss = true
  }

  closeGloss(): void {
    this.inGloss = false
  }

  private requireSeparator(token: Token): boolean {
    const noEnclosure = !isCloseEnclosure(token) && !this.enclosureOpened
    return this.result.length === 0 || noEnclosure
  }

  private pushSeparator(target: React.ReactNode[]): void {
    target.push(
      this.inGloss ? (
        <GlossWrapper key={`${target.length}-separator`}>
          <WordSeparator modifiers={this.bemModifiers} />
        </GlossWrapper>
      ) : (
        <WordSeparator
          key={`${target.length}-separator`}
          modifiers={this.bemModifiers}
        />
      )
    )
  }
}

export default function LineTokens({
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
        }, new LineAccumulator()).result
      }
    </>
  )
}
