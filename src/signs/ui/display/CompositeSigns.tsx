import Sign from 'signs/domain/Sign'
import SignService from 'signs/application/SignService'
import withData, { WithoutData } from 'http/withData'
import React from 'react'

import { Link } from 'react-router-dom'
import ExternalLink from 'common/ui/ExternalLink'

function CompositeSign({
  signComposites,
  mainSign,
}: {
  signComposites: readonly Sign[]
  mainSign: string
}): JSX.Element {
  const signCompositesWithoutMainSign = [...signComposites].filter(
    (sign) => sign.displaySignName !== mainSign?.toUpperCase(),
  )
  return signCompositesWithoutMainSign.length > 0 ? (
    <>
      <ul className="SignPage__composites" aria-label="Composite signs">
        {signCompositesWithoutMainSign.map((sign) => (
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
  ) : (
    <p className="SignPage__note">No composite signs.</p>
  )
}

type Props = {
  data: readonly Sign[]
  query: SignQuery
  signService: SignService
}
interface SignQuery {
  isComposite: boolean
  value: string
  subIndex: number
}

export default withData<
  WithoutData<Props>,
  { query: SignQuery },
  readonly Sign[]
>(
  ({ data, query }) => (
    <CompositeSign signComposites={data} mainSign={query.value} />
  ),
  (props, signal) => props.signService.search(props.query, signal),
)
