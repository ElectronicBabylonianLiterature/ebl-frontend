import React, { FunctionComponent } from 'react'
import _ from 'lodash'
import TransliterationHeader from 'fragmentarium/ui/view/TransliterationHeader'
import SessionContext from 'auth/SessionContext'
import Session from 'auth/Session'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Glossary } from './Glossary'

import './Display.css'
import {
  Line,
  Token,
  Variant,
  NamedSign,
  Grapheme,
  Divider,
  UnknownSign
} from 'fragmentarium/domain/text'
import classNames from 'classnames'

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

function UnknownSignComponent({ token }: { token: Token }): JSX.Element {
  const sign = token as UnknownSign
  const signs = {
    UnclearSign: 'x',
    UnidentifiedSign: 'X'
  }
  return (
    <>
      {signs[sign.type]}
      <sup className="Display__flag">{sign.flags.join('')}</sup>
    </>
  )
}

function NamedSignComponent({ token }: { token: Token }): JSX.Element {
  const namedSign = token as NamedSign
  return (
    <>
      {namedSign.name}
      {namedSign.subIndex !== 1 && (
        <sub className="Display__subIndex">{namedSign.subIndex || 'x'}</sub>
      )}
      <span className="Display__modifier">{namedSign.modifiers.join('')}</span>
      <sup className="Display__flag">{namedSign.flags.join('')}</sup>
      {namedSign.sign && (
        <>
          <span className="Display__bracket">(</span>
          <DisplayToken token={namedSign.sign} />
          <span className="Display__bracket">)</span>
        </>
      )}
      {namedSign.surrogate && !_.isEmpty(namedSign.surrogate) && (
        <>
          <span className="Display__bracket">&lt;(</span>
          {namedSign.surrogate.map((token, index) => (
            <DisplayToken key={index} token={token} />
          ))}
          <span className="Display__bracket">)&gt;</span>
        </>
      )}
    </>
  )
}

const tokens: ReadonlyMap<
  string,
  FunctionComponent<{ token: Token }>
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
  [
    'Divider',
    ({ token }: { token: Token }): JSX.Element => {
      const divider = token as Divider
      return (
        <>
          {divider.divider}
          <span className="Display__modifier">
            {divider.modifiers.join('')}
          </span>
          <sup className="Display__flag">{divider.flags.join('')}</sup>
        </>
      )
    }
  ],
  [
    'Grapheme',
    ({ token }: { token: Token }): JSX.Element => {
      const grapheme = token as Grapheme
      return (
        <>
          {grapheme.name}
          <span className="Display__modifier">
            {grapheme.modifiers.join('')}
          </span>
          <sup className="Display__flag">{grapheme.flags.join('')}</sup>
        </>
      )
    }
  ],
  ['UnclearSign', UnknownSignComponent],
  ['UnidentifiedSign', UnknownSignComponent]
])

function DisplayToken({ token }: { token: Token }): JSX.Element {
  const TokenComponent = tokens.get(token.type) || DefaultToken
  return (
    <span
      className={classNames([
        'Display__token',
        `Display__token--${token.type}`
      ])}
    >
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
    { className: classNames(['Display__line', `Display__line--${type}`]) },
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

interface Props {
  fragment: Fragment
}

function Display({ fragment }: Props): JSX.Element {
  return (
    <>
      <TransliterationHeader fragment={fragment} />
      <ol className="Display__lines">
        {fragment.text.lines.map((line: Line, index: number) => (
          <li key={index}>
            <DisplayLine line={line} />
          </li>
        ))}
      </ol>
      <SessionContext.Consumer>
        {(session: Session): React.ReactNode =>
          session.hasBetaAccess() && <Glossary fragment={fragment} />
        }
      </SessionContext.Consumer>
    </>
  )
}

export default Display
