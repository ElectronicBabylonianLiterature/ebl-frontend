import React, { PropsWithChildren } from 'react'
import classNames from 'classnames'
import { Line, Token, Text } from 'fragmentarium/domain/text'
import { DisplayToken } from './DisplayToken'

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
            acc.result.push(
              <WordSeparator
                key={`${index}-separator`}
                modifiers={[acc.language]}
              />
            )
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
          } else if (acc.gloss !== null) {
            if (acc.gloss.length > 0) {
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
          } else {
            acc.result.push(
              <WordSeparator
                key={`${index}-separator`}
                modifiers={[acc.language]}
              />
            )
            acc.result.push(
              <DisplayToken
                key={index}
                token={token}
                modifiers={[acc.language]}
              />
            )
          }
          return acc
        },
        { result: [], gloss: null, language: 'AKKADIAN' }
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
