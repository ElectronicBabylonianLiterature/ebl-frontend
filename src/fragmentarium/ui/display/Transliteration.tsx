import React, { FunctionComponent } from 'react'
import classNames from 'classnames'
import {
  Line,
  Token,
  Text,
  Enclosure,
  Shift,
  RulingDollarLine
} from 'fragmentarium/domain/text'
import { DisplayToken } from './DisplayToken'
import isEnclosure from './isEnclosure'

import './Display.sass'

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

function isShift(token: Token): token is Shift {
  return token.type === 'LanguageShift'
}

function isDocumentOrientedGloss(token: Token): token is Enclosure {
  return token.type === 'DocumentOrientedGloss'
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
    const tokenComponent = (
      <DisplayToken
        key={this.result.length}
        token={token}
        bemModifiers={[this.language]}
      />
    )

    this.result.push(
      this.inGloss && !isEnclosure(token) ? (
        <sup className="Transliteration__DocumentOrientedGloss">
          {tokenComponent}
        </sup>
      ) : (
        tokenComponent
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
    const separator = (
      <WordSeparator
        key={`${target.length}-separator`}
        modifiers={[this.language]}
      />
    )
    target.push(
      this.inGloss ? (
        <sup className="Transliteration__DocumentOrientedGloss">
          {separator}
        </sup>
      ) : (
        separator
      )
    )
  }
}

function DisplayLine({
  line: { type, prefix, content },
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  return React.createElement(
    container,
    { className: classNames([`Transliteration__${type}`]) },
    [
      <span key="prefix">{prefix}</span>,
      ...content.reduce((acc: LineAccumulator, token: Token) => {
        if (isShift(token)) {
          acc.applyLanguage(token)
        } else if (isDocumentOrientedGloss(token)) {
          token.side === 'LEFT' ? acc.openGloss() : acc.closeGloss()
        } else {
          acc.pushToken(token)
        }
        return acc
      }, new LineAccumulator()).result
    ]
  )
}

function DisplayRulingDollarLine({
  line,
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  const rulingDollarLine = line as RulingDollarLine
  const element = 'Transliteration__ruling'
  return React.createElement(
    container,
    { className: `Transliteration__${rulingDollarLine.type}` },
    <hr
      className={classNames([
        element,
        `${element}--${rulingDollarLine.number.toLowerCase()}`
      ])}
    />
  )
}

const lineComponents: ReadonlyMap<
  string,
  FunctionComponent<{
    line: Line
    container?: string
  }>
> = new Map([['RulingDollarLine', DisplayRulingDollarLine]])

export function Transliteration({
  text: { lines }
}: {
  text: Text
}): JSX.Element {
  return (
    <ol className="Transliteration">
      {lines.map((line: Line, index: number) => {
        const LineComponent = lineComponents.get(line.type) || DisplayLine
        return <LineComponent key={index} container="li" line={line} />
      })}
    </ol>
  )
}
