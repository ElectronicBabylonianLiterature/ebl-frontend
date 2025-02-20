import React from 'react'
import { Col, Form } from 'react-bootstrap'
import HelpTrigger from 'common/HelpTrigger'
import { helpColSize } from './SearchForm'

interface HelpColProps {
  overlay: JSX.Element
}

export default function HelpCol({ overlay }: HelpColProps): JSX.Element {
  return (
    <Col
      sm={helpColSize}
      as={Form.Label}
      className="TransliterationSearchForm__label"
    >
      <HelpTrigger overlay={overlay} />
    </Col>
  )
}
