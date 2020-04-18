import React, {
  FunctionComponent,
  PropsWithChildren,
  ReactElement,
  ReactNode
} from 'react'
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

function DisplayLineNumber({
  lineNumber
}: {
  lineNumber: LineNumber
}): JSX.Element {
  return <sup>{`(${lineNumberToString(lineNumber)})`}</sup>
}

function DisplayLineNumberRange({
  lineNumber: { start, end }
}: {
  lineNumber: LineNumberRange
}): JSX.Element {
  return (
    <sup>{`(${lineNumberToString(start)}-${lineNumberToString(end)})`}</sup>
  )
}
function lineNumberToString({
  hasPrime,
  number,
  prefixModifier,
  suffixModifier
}: LineNumber): string {
  const prefixMod = prefixModifier ? prefixModifier + '+' : ''
  const prime = hasPrime ? '′' : ''
  const suffixMod = suffixModifier ? suffixModifier : ''
  return `${prefixMod}${number}${prime}${suffixMod}`
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
  const LineNumberComponent =
    lineNumberTypeToComponent[textLine.lineNumber.type as string]
  return React.createElement(
    container,
    { className: classNames([`Transliteration__${textLine.type}`]) },
    <LineNumberComponent key={0} lineNumber={textLine.lineNumber} />,
    <DisplayLineTokens content={textLine.content} />
  )
}

function DisplayLine({
  line,
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  return React.createElement(
    container,
    { className: classNames([`Transliteration__${line.type}`]) },
    <span key="prefix">{line.prefix}</span>,
    <DisplayLineTokens content={line.content} />
  )
}

function DisplayLineTokens({
  content
}: {
  content: ReadonlyArray<Token>
}): any {
  const tokens = content.reduce((acc: LineAccumulator, token: Token) => {
    if (isShift(token)) {
      acc.applyLanguage(token)
    } else if (isDocumentOrientedGloss(token)) {
      token.side === 'LEFT' ? acc.openGloss() : acc.closeGloss()
    } else {
      acc.pushToken(token)
    }
    return acc
  }, new LineAccumulator()).result
  return tokens.map((token: ReactNode) => {
    return token as JSX.Element
  })
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
  ['ControlLine', DisplayLine],
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
  const rulingLine = line as RulingDollarLine
  const rulingType = `Transliteration__ruling`
  const rulingsNumber = rulingsToNumber.get(rulingLine.number) as number
  return React.createElement(
    container,
    { className: 'Transliteration__RulingDollarLine' },
    [...Array(rulingsNumber).keys()].map((value: number) => {
      return <DisplayEachRuling key={value} rulingType={rulingType} />
    })
  )
}
function DisplayEachRuling({
  rulingType
}: {
  rulingType: string
}): JSX.Element {
  return <div className={rulingType} />
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
