import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import HelpCol from './HelpCol'
import { MuseumSearchHelp } from './SearchHelp'
import { helpColSize } from './SearchForm'

interface NumberSearchFormProps {
  value: string | null
  isValid: boolean
  onChangeNumber: (value: string) => void
}

export default function NumberSearchForm({
  value,
  isValid,
  onChangeNumber,
}: NumberSearchFormProps): JSX.Element {
  return (
    <Form.Group as={Row} controlId="number">
      <HelpCol overlay={MuseumSearchHelp()} />
      <Col sm={12 - helpColSize}>
        <Form.Control
          type="text"
          name="number"
          value={value || ''}
          placeholder="Museum, accession, CDLI, or excavation number"
          aria-label="Number"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onChangeNumber(event.target.value)
          }
          isInvalid={!isValid}
        />
        <Form.Control.Feedback type="invalid">
          At least one of prefix, number or suffix must be specified.
        </Form.Control.Feedback>
      </Col>
    </Form.Group>
  )
}
