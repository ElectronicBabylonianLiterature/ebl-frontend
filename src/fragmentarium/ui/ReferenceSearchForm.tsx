import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import BibliographySelect from 'bibliography/ui/BibliographySelect'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import FragmentService from 'fragmentarium/application/FragmentService'
import HelpCol from './HelpCol'
import { ReferenceSearchHelp } from './SearchHelp'
import { helpColSize } from './SearchForm'

interface ReferenceSearchFormProps {
  referenceEntry: { id: string; label: string }
  pages: string | null
  onChangePages: (value: string) => void
  onChangeBibliographyReference: (event: BibliographyEntry) => void
  fragmentService: FragmentService
}

export default function ReferenceSearchForm({
  referenceEntry,
  pages,
  onChangePages,
  onChangeBibliographyReference,
  fragmentService,
}: ReferenceSearchFormProps): JSX.Element {
  return (
    <Form.Group as={Row} controlId="reference">
      <HelpCol overlay={ReferenceSearchHelp()} />
      <Col sm={12 - helpColSize}>
        <Row>
          <Col>
            <BibliographySelect
              isClearable={true}
              ariaLabel="Select bibliography reference"
              value={referenceEntry}
              onChange={onChangeBibliographyReference}
              searchBibliography={(query) =>
                fragmentService.searchBibliography(query)
              }
            />
          </Col>
          <Col>
            <Form.Control
              type="text"
              name="pages"
              placeholder="Page"
              aria-label="Pages"
              value={pages || ''}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onChangePages(event.target.value)
              }
            />
          </Col>
        </Row>
      </Col>
    </Form.Group>
  )
}
