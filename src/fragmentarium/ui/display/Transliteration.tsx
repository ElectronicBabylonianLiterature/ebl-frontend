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
          <>
            {index > 0 ? '/' : null}
            <DisplayToken key={index} token={token} />
          </>
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
function DisplayToken({ token }: { token: Token }): JSX.Element {
  const TokenComponent = tokens.get(token.type) || DefaultToken
  return (
    <span className={classNames([`Transliteration__${token.type}`])}>
      <TokenComponent token={token} />
    </span>
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
    <>
      <span>{prefix}</span>
      {content.map((token, index) => (
        <>
          {' '}
          <DisplayToken key={index} token={token} />
        </>
      ))}
    </>
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
