import React from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import BibliographySelect from '../../../bibliography/ui/BibliographySelect'

type Props = {
  fragmentService
  onChangePages(value: string): void
  onChangeBibliographyReference(value: any): void
  valueBibReference: any
  valuePages: string | null | undefined
}

function ReferenceSearchForm(props: Props): JSX.Element {
  return (
    <Form>
      <Form.Group as={Row} controlId="reference">
        <Col sm={{ span: 5, offset: 2 }}>
          <BibliographySelect
            aria-labelledby={'BibliographyTitle'}
            value={props.valueBibReference}
            onChange={props.onChangeBibliographyReference}
            searchBibliography={(query) =>
              props.fragmentService.searchBibliography(query)
            }
          />
        </Col>
        <Col sm={5}>
          <Form.Control
            type="text"
            name="pages"
            aria-label="Pages"
            value={props.valuePages || ''}
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
              props.onChangePages(event.target.value)
            }
          />
        </Col>
      </Form.Group>
    </Form>
  )
}

export default ReferenceSearchForm
