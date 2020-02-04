import React, { PropsWithChildren } from 'react'
import classNames from 'classnames'
import { Line, Token, Text, Enclosure } from 'fragmentarium/domain/text'
import { DisplayToken } from './DisplayToken'

import './Display.sass'

function WordSeparator({
  modifiers = []
}: {
  modifiers?: readonly string[]
}): JSX.Element {
  const element = 'Transliteration__wordSeparator'
  return (
    <span
      className={classNames([
        element,
        modifiers.map(flag => `${element}--${flag}`)
      ])}
    >
      {' '}
    </span>
  )
}

function DocumentOrientedGLoss({
  children
}: PropsWithChildren<{}>): JSX.Element {
  return (
    <sup className="Transliteration__DocumentOrientedGloss">{children}</sup>
  )
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

  private get index(): number {
    return this.result.length
  }

  private requireSeparator(token: Token): boolean {
    return (
      this.index === 0 || (!isCloseEnclosure(token) && !this.enclosureOpened)
    )
  }

  pushToken(token: Token): void {
    if (this.requireSeparator(token)) {
      this.result.push(
        <WordSeparator
          key={`${this.index}-separator`}
          modifiers={[this.language]}
        />
      )
    }
    this.result.push(
      <DisplayToken
        key={this.index}
        token={token}
        modifiers={[this.language]}
      />
    )
    this.enclosureOpened = isOpenEnclosure(token)
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
      ...content.reduce(
        (
          acc: {
            result: React.ReactNode[]
            gloss: React.ReactNode[] | null
            language: string
            enclosureOpened: boolean
          },
          token: Token,
          index: number
        ) => {
          if (token.type === 'LanguageShift') {
            acc.language = token.language
          } else if (
            token.type === 'DocumentOrientedGloss' &&
            token.value === '{('
          ) {
            if (!acc.enclosureOpened) {
              acc.result.push(
                <WordSeparator
                  key={`${index}-separator`}
                  modifiers={[acc.language]}
                />
              )
            }
            acc.gloss = []
          } else if (
            token.type === 'DocumentOrientedGloss' &&
            token.value === ')}'
          ) {
            acc.result.push(
              <DocumentOrientedGLoss key={index}>
                {acc.gloss}
              </DocumentOrientedGLoss>
            )
            acc.gloss = null
            acc.enclosureOpened = false
          } else if (acc.gloss !== null) {
            if (
              acc.gloss.length > 0 &&
              !isCloseEnclosure(token) &&
              !acc.enclosureOpened
            ) {
              acc.gloss.push(
                <WordSeparator
                  key={`${index}-separator`}
                  modifiers={[acc.language]}
                />
              )
            }
            acc.gloss.push(
              <DisplayToken
                key={index}
                token={token}
                modifiers={[acc.language]}
              />
            )
            acc.enclosureOpened = isOpenEnclosure(token)
          } else {
            if (
              index === 0 ||
              (!isCloseEnclosure(token) && !acc.enclosureOpened)
            ) {
              acc.result.push(
                <WordSeparator
                  key={`${index}-separator`}
                  modifiers={[acc.language]}
                />
              )
            }
            acc.result.push(
              <DisplayToken
                key={index}
                token={token}
                modifiers={[acc.language]}
              />
            )
            acc.enclosureOpened = isOpenEnclosure(token)
          }
          return acc
        },
        {
          result: [],
          gloss: null,
          language: 'AKKADIAN',
          enclosureOpened: false
        }
      ).result
    ]
  )
}

export function Transliteration({
  text: { lines }
}: {
  text: Text
}): JSX.Element {
  return (
    <ol className="Transliteration">
      {lines.map((line: Line, index: number) => (
        <DisplayLine key={index} container="li" line={line} />
      ))}
    </ol>
  )
}
