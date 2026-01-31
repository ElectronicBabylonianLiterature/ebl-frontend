import Sign from 'signs/domain/Sign'
import SignService from 'signs/application/SignService'
import withData, { WithoutData } from 'http/withData'
import React from 'react'
import 'signs/ui/display/CompositeSigns.css'

import HelpTrigger from 'common/HelpTrigger'
import { Col, Popover, Row } from 'react-bootstrap'
import _ from 'lodash'
import ExternalLink from 'common/ExternalLink'

function CompositeSign({
  signComposites,
  mainSign,
}: {
  signComposites: readonly Sign[]
  mainSign: string
}): JSX.Element | null {
  const signCompositesWithoutMainSign = [...signComposites].filter(
    (sign) => sign.displaySignName !== mainSign?.toUpperCase(),
  )
  return signCompositesWithoutMainSign.length > 0 ? (
    <Row>
      <Col xs={'auto'}>Composites: </Col>
      <Col
        xs={'auto'}
        className={'compositeSigns__compositeSigns__compositeSigns'}
      >
        {signCompositesWithoutMainSign.map((sign, index) => (
          <span key={index}>
            <a href={`/signs/${encodeURIComponent(sign.name)}`}>
              {sign.displaySignName}
            </a>
            {index < signCompositesWithoutMainSign.length - 1 ? ', ' : ''}
          </span>
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
      <Popover.Body>
        From Oracc Global Sign List &nbsp;&nbsp;
        <ExternalLink href={'http://oracc.org/ogsl/'} className={'text-dark'}>
          {' '}
          <i className="fas fa-external-link-square-alt" />
        </ExternalLink>
      </Popover.Body>
    </Popover>
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
  (props) => props.signService.search(props.query),
)
