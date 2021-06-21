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
    <>
      <Row>
        <Col>
          <h3>&#8545;. MesZL</h3>
        </Col>
      </Row>
      <Row>
        <Col className={'p-5'}>
          <MesZlContent signName={signName} mesZl={mesZl} />
        </Col>
      </Row>
    </>
  )
}
