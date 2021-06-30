import Sign, { SignQuery } from 'signs/domain/Sign'
import SignService from 'signs/application/SignService'
import withData, { WithoutData } from 'http/withData'
import React from 'react'
import './compositeSigns.css'

import { Link } from 'react-router-dom'
import HelpTrigger from 'common/HelpTrigger'
import { Col, Popover, Row } from 'react-bootstrap'
import _ from 'lodash'
import ExternalLink from 'common/ExternalLink'

function CompositeSign({
  signComposites,
}: {
  signComposites: readonly Sign[]
}): JSX.Element | null {
  return signComposites.length > 0 ? (
    <Row>
      <Col xs={'auto'}>Composites: </Col>
      <Col>
        {signComposites.map((sign, index) => (
          <Link key={index} to={`/signs/${encodeURIComponent(sign.name)}`}>
            {sign.displaySignName}
            {index < signComposites.length - 1 ? ', ' : ''}
          </Link>
        ))}
      </Col>
      <Col xs={1} className={'mt-auto'}>
        <HelpTrigger
          placement={'auto'}
          delay={{ show: 0, hide: 1200 }}
          overlay={CompositeSignsInfo()}
        />
      </Col>
    </Row>
  ) : null
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
