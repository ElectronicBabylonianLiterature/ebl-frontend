import React, { FunctionComponent, PropsWithChildren } from 'react'
import classNames from 'classnames'
import {
  Line,
  Text,
  ControlLines,
  RulingDollarLine
} from 'fragmentarium/domain/text'
import { DisplayToken } from './DisplayToken'

import './Display.sass'
import { Enclosure, Shift, Token } from '../../domain/token'

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

function DisplayDocumentOrientedGLoss({
  children
}: PropsWithChildren<{}>): JSX.Element {
  return (
    <sup className="Transliteration__DocumentOrientedGloss">{children}</sup>
  )
}

function isShift(token: Token): token is Shift {
  return token.type === 'LanguageShift'
}

function isDocumentOrientedGloss(token: Token): token is Enclosure {
  return token.type === 'DocumentOrientedGloss'
}

function isEnclosure(token: Token): token is Enclosure {
  return [
    'BrokenAway',
    'PerhapsBrokenAway',
    'AccidentalOmmission',
    'IntentionalOmission',
    'Removal',
    'Erasure'
  ].includes(token.type)
}

function isCloseEnclosure(token: Token): boolean {
  return isEnclosure(token) && ['CENTER', 'RIGHT'].includes(token.side)
}

function isOpenEnclosure(token: Token): boolean {
  return isEnclosure(token) && ['CENTER', 'LEFT'].includes(token.side)
}

class LineAccumulator {
  result: React.ReactNode[] = []
  private gloss: React.ReactNode[] | null = null
  private language = 'AKKADIAN'
  private enclosureOpened = false

  applyLanguage(token: Shift): void {
    this.language = token.language
  }

  pushToken(token: Token): void {
    const target = this.gloss || this.result
    if (this.requireSeparator(token)) {
      this.pushSeparator(target)
    }
    target.push(
      <DisplayToken
        key={target.length}
        token={token}
        bemModifiers={[this.language]}
      />
    )
    this.enclosureOpened = isOpenEnclosure(token)
  }

  openGloss(): void {
    if (!this.enclosureOpened) {
      this.pushSeparator(this.result)
    }
    this.gloss = []
  }

  closeGloss(): void {
    this.result.push(
      <DisplayDocumentOrientedGLoss key={this.result.length}>
        {this.gloss}
      </DisplayDocumentOrientedGLoss>
    )
    this.gloss = null
    this.enclosureOpened = false
  }

  private requireSeparator(token: Token): boolean {
    const noEnclosure = !isCloseEnclosure(token) && !this.enclosureOpened
    return this.gloss
      ? this.gloss.length > 0 && noEnclosure
      : this.result.length === 0 || noEnclosure
  }

  private pushSeparator(target: React.ReactNode[]): void {
    target.push(
      <WordSeparator
        key={`${target.length}-separator`}
        modifiers={[this.language]}
      />
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

function DisplayGenericControlLines({
  line,
  container = 'div'
}: {
  line: Line
  container?: string
}): JSX.Element {
  const controlLine = line as ControlLines
  const element = `Transliteration__GenericControlLine`
  let component = ''
  if (
    controlLine.type === 'ImageDollarLine' ||
    controlLine.type === 'LooseDollarLine'
  ) {
    component = controlLine.displayValue
  } else {
    component = `(${controlLine.displayValue})`
  }
  return React.createElement(
    container,
    null,
    <div className={`${element} ${controlLine.type}`}>{`${component}`}</div>
  )
}

const lineComponents: ReadonlyMap<
  string,
  FunctionComponent<{
    line: Line
    container?: string
  }>
> = new Map([
  ['TextLine', DisplayLine],
  ['RulingDollarLine', DisplayRulingDollarLine],
  ['LooseDollarLine', DisplayGenericControlLines],
  ['ImageDollarLine', DisplayGenericControlLines],
  ['SealDollarLine', DisplayGenericControlLines],
  ['StateDollarLine', DisplayGenericControlLines],
  ['SealAtLine', DisplayGenericControlLines],
  ['ColumnAtLine', DisplayGenericControlLines],
  ['HeadingAtLine', DisplayGenericControlLines],
  ['DiscourseAtLine', DisplayGenericControlLines],
  ['SurfaceAtLine', DisplayGenericControlLines],
  ['ObjectAtLine', DisplayGenericControlLines],
  ['DivisionAtLine', DisplayGenericControlLines],
  ['CompositeAtLine', DisplayGenericControlLines]
])

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
