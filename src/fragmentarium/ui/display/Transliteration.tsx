import React, { FunctionComponent } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import {
  Line,
  Token,
  Variant,
  NamedSign,
  UnknownSign,
  Gloss,
  Sign,
  Text
} from 'fragmentarium/domain/text'

function DefaultToken({
  token: { parts, value }
}: {
  token: Token
}): JSX.Element {
  return (
    <>
      {parts
        ? parts.map((token, index) => (
            <DisplayToken key={index} token={token} />
          ))
        : value}
    </>
  )
}

function GlossComponent({ token }: { token: Token }): JSX.Element {
  const gloss = token as Gloss
  return (
    <sup>
      {gloss.parts.map((token, index) => (
        <DisplayToken key={index} token={token} />
      ))}
    </sup>
  )
}

function UnknownSignComponent({ token }: { token: Token }): JSX.Element {
  const sign = token as UnknownSign
  const signs = {
    UnclearSign: 'x',
    UnidentifiedSign: 'X'
  }
  return (
    <>
      {signs[sign.type]}
      <sup className="Transliteration__flag">{sign.flags.join('')}</sup>
    </>
  )
}

function signComponent(nameProperty: string) {
  return function SignComponent({ token }: { token: Token }): JSX.Element {
    const sign = token as Sign
    return (
      <>
        {sign[nameProperty]}
        <span className="Transliteration__modifier">
          {sign.modifiers.join('')}
        </span>
        <sup className="Transliteration__flag">{sign.flags.join('')}</sup>
      </>
    )
  }
}

function NamedSignComponent({ token }: { token: Token }): JSX.Element {
  const namedSign = token as NamedSign
  return (
    <>
      {namedSign.name}
      {namedSign.subIndex !== 1 && (
        <sub className="Transliteration__subIndex">
          {namedSign.subIndex || 'x'}
        </sub>
      )}
      <span className="Transliteration__modifier">
        {namedSign.modifiers.join('')}
      </span>
      <sup className="Transliteration__flag">{namedSign.flags.join('')}</sup>
      {namedSign.sign && (
        <>
          <span className="Transliteration__bracket">(</span>
          <DisplayToken token={namedSign.sign} />
          <span className="Transliteration__bracket">)</span>
        </>
      )}
      {namedSign.surrogate && !_.isEmpty(namedSign.surrogate) && (
        <>
          <span className="Transliteration__bracket">&lt;(</span>
          {namedSign.surrogate.map((token, index) => (
            <DisplayToken key={index} token={token} />
          ))}
          <span className="Transliteration__bracket">)&gt;</span>
        </>
      )}
    </>
  )
}

const tokens: ReadonlyMap<
  string,
  FunctionComponent<{
    token: Token
  }>
> = new Map([
  ['UnknownNumberOfSigns', (): JSX.Element => <>…</>],
  [
    'Variant',
    ({ token }: { token: Token }): JSX.Element => (
      <>
        {(token as Variant).tokens.map((token, index) => (
          <React.Fragment key={index}>
            {index > 0 ? '/' : null}
            <DisplayToken token={token} />
          </React.Fragment>
        ))}
      </>
    )
  ],
  ['Reading', NamedSignComponent],
  ['Logogram', NamedSignComponent],
  ['Number', NamedSignComponent],
  ['Divider', signComponent('divider')],
  ['Grapheme', signComponent('name')],
  ['UnclearSign', UnknownSignComponent],
  ['UnidentifiedSign', UnknownSignComponent],
  ['Determinative', GlossComponent],
  ['PhoneticGloss', GlossComponent],
  ['LinguisticGloss', GlossComponent]
])
function DisplayToken({
  token,
  container = 'span'
}: {
  token: Token
  container?: string
}): JSX.Element {
  const TokenComponent = tokens.get(token.type) || DefaultToken
  return React.createElement(
    container,
    { className: classNames([`Transliteration__${token.type}`]) },
    <TokenComponent token={token} />
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
            acc.result.push(
              <React.Fragment key={`${index}-separator`}> </React.Fragment>
            )
            acc.gloss = []
          } else if (
            token.type === 'DocumentOrientedGloss' &&
            token.value === ')}'
          ) {
            acc.result.push(
              <sup
                key={index}
                className="Transliteration__DocumentOrientedGloss"
              >
                {acc.gloss}
              </sup>
            )
            acc.gloss = null
          } else if (acc.gloss !== null) {
            if (acc.gloss.length > 0) {
              acc.gloss.push(
                <React.Fragment key={`${index}-separator`}> </React.Fragment>
              )
            }
            acc.gloss.push(<DisplayToken key={index} token={token} />)
          } else {
            acc.result.push(
              <React.Fragment key={`${index}-separator`}> </React.Fragment>
            )
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
