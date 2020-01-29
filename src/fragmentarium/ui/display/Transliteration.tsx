import React, { PropsWithChildren } from 'react'
import classNames from 'classnames'
import { Line, Token, Text } from 'fragmentarium/domain/text'
import { DisplayToken } from './DisplayToken'

function WordSeparator(): JSX.Element {
  return <span className="Transliteration__wordSeparator"> </span>
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
          acc: { result: React.ReactNode[]; gloss: React.ReactNode[] | null },
          token: Token,
          index: number
        ) => {
          if (token.type === 'DocumentOrientedGloss' && token.value === '{(') {
            acc.result.push(<WordSeparator key={`${index}-separator`} />)
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
              acc.gloss.push(<WordSeparator key={`${index}-separator`} />)
            }
            acc.gloss.push(<DisplayToken key={index} token={token} />)
          } else {
            acc.result.push(<WordSeparator key={`${index}-separator`} />)
            acc.result.push(<DisplayToken key={index} token={token} />)
          }
          return acc
        },
        { result: [], gloss: null }
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
