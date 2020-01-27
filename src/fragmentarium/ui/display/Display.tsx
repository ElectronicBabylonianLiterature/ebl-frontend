import React, { FunctionComponent } from 'react'
import TransliterationHeader from 'fragmentarium/ui/view/TransliterationHeader'
import SessionContext from 'auth/SessionContext'
import Session from 'auth/Session'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Glossary } from './Glossary'

import './Display.css'
import { Line, Token } from 'fragmentarium/domain/text'
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

const tokens: ReadonlyMap<
  string,
  FunctionComponent<{ token: Token }>
> = new Map([['UnknownNumberOfSigns', (): JSX.Element => <>…</>]])

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
