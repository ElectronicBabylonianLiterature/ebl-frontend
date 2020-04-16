import React, { FunctionComponent, PropsWithChildren } from 'react'
import classNames from 'classnames'
import {
  Line,
  Text,
  DollarAndAtLine,
  RulingDollarLine,
  TextLine,
  LineNumber,
  LineNumberRange
} from 'fragmentarium/domain/text'
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
function DisplayLineNumberRange({ start, end }: LineNumberRange): JSX.Element {
  const startPrime = start.hasPrime ? '′' : ''
  const endPrime = end.hasPrime ? '′' : ''
  const startPrefixMod = start.prefixModifier ? start.prefixModifier + '+' : ''
  const startSuffixMod = start.suffixModifier ? start.suffixModifier : ''
  const endPrefixMod = end.prefixModifier ? end.prefixModifier + '+' : ''
  const endSuffixMod = end.suffixModifier ? end.suffixModifier : ''
  const result = `(${startPrefixMod}${start.number}${startPrime}${startSuffixMod}-${endPrefixMod}${end.number}${endPrime}${endSuffixMod})`
  return (
    <span>
      <sup>{result}</sup>
    </span>
  )
}

function DisplayLineNumber({ hasPrime, number }: LineNumber): JSX.Element {
  const prime = hasPrime ? '′' : ''
  return (
    <span>
      <sup>{`(${number}${prime})`}</sup>
    </span>
  )
}
const lineNumberTypeToComponent = {
  LineNumber: DisplayLineNumber,
  LineNumberRange: DisplayLineNumberRange
}

function DisplayTextLine({
  line,
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  const textLine = line as TextLine
  const lineTypeComponent =
    lineNumberTypeToComponent[textLine.lineNumber.type as string]
  return React.createElement(
    container,
    { className: classNames([`Transliteration__${textLine.type}`]) },
    [
      React.createElement(lineTypeComponent, {
        key: 0,
        ...textLine.lineNumber
      }),
      ...textLine.content.reduce((acc: LineAccumulator, token: Token) => {
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
function DisplayDollarAndAtLineWithParenthesis({
  line,
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  const dollarAndAtLine = line as DollarAndAtLine
  return React.createElement(
    container,
    { className: 'Transliteration__DollarAndAtLineWithParenthesis' },
    dollarAndAtLine.displayValue
  )
}

function DisplayDollarAndAtLine({
  line,
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  const dollarAndAtLine = line as DollarAndAtLine
  return React.createElement(
    container,
    { className: 'Transliteration__DollarAndAtLine' },
    `(${dollarAndAtLine.displayValue})`
  )
}

const lineComponents: ReadonlyMap<
  string,
  FunctionComponent<{
    line: Line
    container?: string
  }>
> = new Map([
  ['TextLine', DisplayTextLine],
  ['RulingDollarLine', DisplayRulingDollarLine],
  ['LooseDollarLine', DisplayDollarAndAtLineWithParenthesis],
  ['ImageDollarLine', DisplayDollarAndAtLineWithParenthesis],
  ['SealDollarLine', DisplayDollarAndAtLine],
  ['StateDollarLine', DisplayDollarAndAtLine],
  ['SealAtLine', DisplayDollarAndAtLine],
  ['ColumnAtLine', DisplayDollarAndAtLine],
  ['HeadingAtLine', DisplayDollarAndAtLine],
  ['DiscourseAtLine', DisplayDollarAndAtLine],
  ['SurfaceAtLine', DisplayDollarAndAtLine],
  ['ObjectAtLine', DisplayDollarAndAtLine],
  ['DivisionAtLine', DisplayDollarAndAtLine],
  ['CompositeAtLine', DisplayDollarAndAtLine]
])

const rulingsToNumber: ReadonlyMap<string, number> = new Map([
  ['SINGLE', 1],
  ['DOUBLE', 2],
  ['TRIPLE', 3]
])

function DisplayRulingDollarLine({
  line,
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  function drawRulings(line: RulingDollarLine): Array<JSX.Element> {
    const rulingsNumber = rulingsToNumber.get(line.number) as number
    const items: Array<JSX.Element> = []
    for (let i = 1; i <= rulingsNumber; i++) {
      items.push(
        React.createElement('div', {
          className: `Transliteration__RulingDollarLine--${line.number.toLowerCase()}`,
          key: i
        })
      )
    }
    return items
  }
  const rulingDollarLine = line as RulingDollarLine
  const items: Array<JSX.Element> = drawRulings(rulingDollarLine)
  return React.createElement(
    container,
    { className: 'Transliteration__RulingDollarLine' },
    items
  )
}

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
