import React from 'react'
import { Col, Form } from 'react-bootstrap'
import { Line } from 'corpus/domain/text'

export default function Reconstruction(props: { line: Line }): JSX.Element {
  return (
    <Form.Row>
      <Col md={3}>{props.line.number}</Col>
      <Col md={9}>{props.line.reconstruction}</Col>
    </Form.Row>
  )
}
