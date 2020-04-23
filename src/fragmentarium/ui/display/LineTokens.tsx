import React, { PropsWithChildren, ReactNode } from 'react'
import classNames from 'classnames'
import DisplayToken, { TokenWrapper } from './DisplayToken'
import { isEnclosure, isShift, isDocumentOrientedGloss } from './type-guards'

import './Display.sass'
import { Shift, Token } from 'fragmentarium/domain/token'

function WordSeparator({
  modifiers: bemModifiers = []
}: {
  modifiers?: readonly string[]
}): JSX.Element {
  const element = 'Transliteration__wordSeparator'
  return (
    <span
      className={classNames([
        element,
        bemModifiers.map(flag => `${element}--${flag}`)
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

class LineAccumulator {
  result: React.ReactNode[] = []
  private inGloss = false
  private language = 'AKKADIAN'
  private enclosureOpened = false

  applyLanguage(token: Shift): void {
    this.language = token.language
  }

  pushToken(token: Token): void {
    if (this.requireSeparator(token)) {
      this.pushSeparator(this.result)
    }

    const glossWrapper: TokenWrapper = ({
      children
    }: PropsWithChildren<{}>): JSX.Element => (
      <sup className="Transliteration__DocumentOrientedGloss">{children}</sup>
    )

    this.result.push(
      this.inGloss && !isEnclosure(token) ? (
        <DisplayToken
          key={this.result.length}
          token={token}
          bemModifiers={[this.language]}
          Wrapper={glossWrapper}
        />
      ) : (
        <DisplayToken
          key={this.result.length}
          token={token}
          bemModifiers={[this.language]}
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
        <sup
          key={`${target.length}-separator`}
          className="Transliteration__DocumentOrientedGloss"
        >
          <WordSeparator modifiers={[this.language]} />
        </sup>
      ) : (
        <WordSeparator
          key={`${target.length}-separator`}
          modifiers={[this.language]}
        />
      )
    )
  }
}

export default function LineTokens({
  content
}: {
  content: ReadonlyArray<Token>
}): JSX.Element {
  return (
    <>
      {
        content.reduce((acc: LineAccumulator, token: Token) => {
          if (isShift(token)) {
            acc.applyLanguage(token)
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
