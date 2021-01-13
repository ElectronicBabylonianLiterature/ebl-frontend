import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { LineVariant } from 'corpus/domain/text'

export default function Reconstruction(props: {
  line: LineVariant
}): JSX.Element {
  return (
    <Row>
      <Col md={3}></Col>
      <Col md={9}>{props.line.reconstruction}</Col>
    </Row>
  )
}
