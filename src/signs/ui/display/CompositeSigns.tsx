import Sign, { SignQuery } from 'signs/domain/Sign'
import SignService from 'signs/application/SignService'
import withData, { WithoutData } from 'http/withData'
import React from 'react'

import { Link } from 'react-router-dom'

function CompositeSign({
  signComposites,
}: {
  signComposites: readonly Sign[]
}): JSX.Element {
  return (
    <>
      Composites:{' '}
      {signComposites.map((sign, index) => (
        <Link key={index} to={`/signs/${encodeURIComponent(sign.name)}`}>
          {sign.displaySignName}
          {index < signComposites.length - 1 ? ', ' : ''}
        </Link>
      ))}
    </>
  )
}

type Props = {
  data: readonly Sign[]
  signService: SignService
}

export default withData<
  WithoutData<Props>,
  { query: SignQuery },
  readonly Sign[]
>(
  ({ data }) => <CompositeSign signComposites={data} />,
  (props) => props.signService.search(props.query)
)
