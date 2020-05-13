import classNames from 'classnames'
import _ from 'lodash'
import React, { FunctionComponent } from 'react'
import {
  DollarAndAtLine,
  Line,
  RulingDollarLine,
} from 'transliteration/domain/line'
import { Text, noteNumber } from 'transliteration/domain/text'
import { LinePrefix } from './LinePrefix'
import LineTokens from './LineTokens'
import './Transliteration.sass'
import { TransliterationNotes } from './TransliterationNotes'

function DisplayLine({
  line,
  line: { type, content },
  container = 'div',
}: {
  line: Line
  container?: string
}): JSX.Element {
  return React.createElement(
    container,
    { className: classNames([`Transliteration__${type}`]) },
    <LinePrefix line={line} />,
    <LineTokens content={content} />
  )
}

function DisplayDollarAndAtLineWithParenthesis({
  line,
  container = 'div',
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
  container = 'div',
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
  ['TextLine', DisplayLine],
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
  ['CompositeAtLine', DisplayDollarAndAtLine],
])

function Ruling(): JSX.Element {
  return <div className="Transliteration__ruling" />
}

const rulingsToNumber: ReadonlyMap<string, number> = new Map([
  ['SINGLE', 1],
  ['DOUBLE', 2],
  ['TRIPLE', 3],
])

function DisplayRulingDollarLine({
  line,
  container = 'div',
}: {
  line: Line
  container?: string
}): JSX.Element {
  const rulingLine = line as RulingDollarLine
  const rulingsNumber = rulingsToNumber.get(rulingLine.number) as number
  return React.createElement(
    container,
    { className: 'Transliteration__RulingDollarLine' },
    _.range(0, rulingsNumber).map((number: number) => {
      return <Ruling key={number} />
    })
  )
}

export function Transliteration({ text }: { text: Text }): JSX.Element {
  const firstLineNotes = text.notes.get(0)
  return (
    <section className="Transliteration">
      <ol>
        {firstLineNotes && firstLineNotes.length > 0 && (
          <li id="line-0">
            {firstLineNotes.map((note, index) => {
              return (
                <>
                  <a key={index} href={`#note-${index + 1}`}>
                    {index + 1}
                  </a>{' '}
                </>
              )
            })}
          </li>
        )}
        {text.lines.map((line: Line, index: number) => {
          const LineComponent = lineComponents.get(line.type) || DisplayLine
          return (
            <li key={index} id={`line-${index + 1}`}>
              <LineComponent container="span" line={line} />{' '}
              {text.notes.get(index + 1)?.map((line, noteIndex) => {
                const number = noteNumber(text.notes, index + 1, noteIndex)
                return (
                  <>
                    <a key={noteIndex} href={`#note-${number}`}>
                      {number}
                    </a>{' '}
                  </>
                )
              })}
            </li>
          )
        })}
      </ol>
      <TransliterationNotes notes={text.notes} />
    </section>
  )
}
