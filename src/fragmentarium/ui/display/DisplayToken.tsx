import React, { FunctionComponent, PropsWithChildren } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import {
  Token,
  Variant,
  NamedSign,
  UnknownSign,
  Gloss,
  Sign
} from 'fragmentarium/domain/text'

function Modifiers({
  modifiers
}: {
  modifiers: readonly string[]
}): JSX.Element {
  return <span className="Transliteration__modifier">{modifiers.join('')}</span>
}

function DamagedFlag({
  sign: { type, flags },
  children
}: PropsWithChildren<{
  sign: { type: string; flags: readonly string[] }
}>): JSX.Element {
  return (
    <span
      className={classNames({
        [`Transliteration__${type}--damaged`]: flags.includes('#')
      })}
    >
      {children}
    </span>
  )
}

function Flags({ flags }: { flags: readonly string[] }): JSX.Element {
  return (
    <sup className="Transliteration__flag">
      {flags.filter(flag => flag !== '#').join('')}
    </sup>
  )
}

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

function VariantComponent({ token }: { token: Token }): JSX.Element {
  return (
    <>
      {(token as Variant).tokens.map((token, index) => (
        <React.Fragment key={index}>
          {index > 0 ? '/' : null}
          <DisplayToken token={token} />
        </React.Fragment>
      ))}
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
    <DamagedFlag sign={sign}>
      {signs[sign.type]}
      <Flags flags={sign.flags} />
    </DamagedFlag>
  )
}

function signComponent(nameProperty: string) {
  return function SignComponent({ token }: { token: Token }): JSX.Element {
    const sign = token as Sign
    return (
      <DamagedFlag sign={sign}>
        {sign[nameProperty]}
        <Modifiers modifiers={sign.modifiers} />
        <Flags flags={sign.flags} />
      </DamagedFlag>
    )
  }
}

function NamedSignComponent({ token }: { token: Token }): JSX.Element {
  const namedSign = token as NamedSign
  return (
    <DamagedFlag sign={namedSign}>
      {namedSign.name}
      {namedSign.subIndex !== 1 && (
        <sub className="Transliteration__subIndex">
          {namedSign.subIndex || 'x'}
        </sub>
      )}
      <Modifiers modifiers={namedSign.modifiers} />
      <Flags flags={namedSign.flags} />
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
    </DamagedFlag>
  )
}

const tokens: ReadonlyMap<
  string,
  FunctionComponent<{
    token: Token
  }>
> = new Map([
  ['UnknownNumberOfSigns', (): JSX.Element => <>…</>],
  ['Variant', VariantComponent],
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

export function DisplayToken({
  token,
  container = 'span',
  modifiers = []
}: {
  token: Token
  container?: string
  modifiers?: readonly string[]
}): JSX.Element {
  const TokenComponent = tokens.get(token.type) || DefaultToken
  const element = `Transliteration__${token.type}`
  return React.createElement(
    container,
    {
      className: classNames([
        element,
        ...modifiers.map(modifier => `${element}--${modifier}`)
      ])
    },
    <TokenComponent token={token} />
  )
}
