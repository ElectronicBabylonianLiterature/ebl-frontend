import Sign, { SignQuery } from 'signs/domain/Sign'
import SignService from 'signs/application/SignService'
import withData, { WithoutData } from 'http/withData'
import React from 'react'
import './compositeSigns.css'

import { Link } from 'react-router-dom'
import HelpTrigger from 'common/HelpTrigger'
import { Popover } from 'react-bootstrap'
import _ from 'lodash'
import ExternalLink from 'common/ExternalLink'

function CompositeSign({
  signComposites,
}: {
  signComposites: readonly Sign[]
}): JSX.Element {
  return (
    <div className={'compositeSigns__compositeSigns'}>
      Composites:{' '}
      {signComposites.map((sign, index) => (
        <Link key={index} to={`/signs/${encodeURIComponent(sign.name)}`}>
          {sign.displaySignName}
          {index < signComposites.length - 1 ? ', ' : ''}
        </Link>
      ))}
      <HelpTrigger
        delay={{ show: 0, hide: 1200 }}
        className={'compositeSigns__help'}
        overlay={CompositeSignsInfo()}
      />
    </div>
  )
}
function CompositeSignsInfo(): JSX.Element {
  return (
    <Popover
      id={_.uniqueId('CompositeSignsInfo-')}
      title="Composite Signs Info"
    >
      <Popover.Content>
        From Oracc Global Sign List &nbsp;&nbsp;
        <ExternalLink href={''} className={'text-dark'}>
          {' '}
          <i className="fas fa-external-link-square-alt" />
        </ExternalLink>
      </Popover.Content>
    </Popover>
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
