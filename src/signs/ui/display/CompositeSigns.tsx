import React from 'react'
import { Link } from 'react-router-dom'
import { Alert } from 'react-bootstrap'
import ExternalLink from 'common/ui/ExternalLink'
import Spinner from 'common/ui/Spinner'
import { CompositeSignsState } from 'signs/ui/display/useCompositeSigns'

export default function CompositeSigns({
  state,
}: {
  state: CompositeSignsState
}): JSX.Element | null {
  switch (state.status) {
    case 'loading':
      return <Spinner>Loading composite signs…</Spinner>
    case 'error':
      return (
        <Alert variant="danger">Composite signs could not be loaded.</Alert>
      )
    case 'unavailable':
      return null
    case 'loaded':
      return (
        <>
          <ul className="SignPage__composites" aria-label="Composite signs">
            {state.data.map((sign) => (
              <li key={sign.name}>
                <Link to={`/signs/${encodeURIComponent(sign.name)}`}>
                  {sign.displaySignName}
                </Link>
              </li>
            ))}
          </ul>
          <p className="SignPage__note">
            From the{' '}
            <ExternalLink href="http://oracc.org/ogsl/">
              Oracc Global Sign List
            </ExternalLink>
            .
          </p>
        </>
      )
  }
}
