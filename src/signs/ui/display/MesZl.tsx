import { Col, Row } from 'react-bootstrap'
import MesZlContent from 'signs/ui/search/MesZLContent'
import React from 'react'

export default function MesZl({
  signName,
  mesZl,
}: {
  signName: string
  mesZl: string
}): JSX.Element | null {
  return (
    <div className={'my-5'}>
      <Row>
        <Col>
          <h3>&#8545;. MesZL</h3>
        </Col>
      </Row>
      <Row>
        <Col className={'ml-4 mt-3'}>
          <MesZlContent signName={signName} mesZl={mesZl} />
        </Col>
      </Row>
    </div>
  )
}
