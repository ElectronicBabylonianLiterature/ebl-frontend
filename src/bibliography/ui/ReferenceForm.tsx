import React from 'react'
import { Form, Col } from 'react-bootstrap'
import _ from 'lodash'

import ArrayInput from 'common/ArrayInput'
import HelpTrigger from 'common/HelpTrigger'
import BibliographySelect from 'bibliography/ui/BibliographySelect'
import NotesHelp from './NotesHelp'
import Promise from 'bluebird'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
interface Props {
  value
  searchBibliography: (query: string) => Promise<readonly BibliographyEntry[]>
  onChange: (event: BibliographyEntry) => void
}
export default function ReferenceForm({
  value,
  onChange,
  searchBibliography,
}: Props): JSX.Element {
  const id = _.uniqueId('ReferenceForm-')
  const documentLabelId = _.uniqueId('ReferenceForm-Document-')

  const handleChange = (setter) => (newValue) =>
    onChange(value[setter](newValue))

  const handleEvent = (setter) => ({ target }) =>
    handleChange(setter)(target.value)

  return (
    <>
      <Form.Group controlId={`${id}-Entry`}>
        <label>Document</label>
        <BibliographySelect
          isClearable={false}
          ariaLabel={documentLabelId}
          value={value.document}
          searchBibliography={searchBibliography}
          onChange={handleChange('setDocument')}
        />
      </Form.Group>
      <Form.Row>
        <Col>
          <Form.Group controlId={`${id}-Pages`}>
            <Form.Label>Pages</Form.Label>
            <Form.Control
              type="text"
              value={value.pages}
              onChange={handleEvent('setPages')}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={`${id}-Type`}>
            <Form.Label>Type</Form.Label>
            <Form.Control
              as="select"
              value={value.type}
              onChange={handleEvent('setType')}
              required
            >
              <option value="EDITION">Edition</option>
              <option value="DISCUSSION">Discussion</option>
              <option value="COPY">Copy</option>
              <option value="PHOTO">Photo</option>
              <option value="TRANSLATION">Translation</option>
              <option value="ARCHAEOLOGY">Archaeology</option>
              <option value="ACQUISITION">Acquisition</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <ArrayInput
            separator=","
            value={value.linesCited}
            onChange={handleChange('setLinesCited')}
          >
            Lines Cited
          </ArrayInput>
        </Col>
      </Form.Row>
      <Form.Group controlId={`${id}-Notes`}>
        <Form.Label>Notes</Form.Label> <HelpTrigger overlay={NotesHelp()} />
        <Form.Control
          type="text"
          value={value.notes}
          onChange={handleEvent('setNotes')}
        />
      </Form.Group>
    </>
  )
}
