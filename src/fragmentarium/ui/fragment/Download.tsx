import React from 'react'
import { DropdownButton, ButtonGroup, Dropdown } from 'react-bootstrap'
import _ from 'lodash'

export default function Download(): JSX.Element {
  return (
    <DropdownButton
      as={ButtonGroup}
      title={<i className="fas fa-file-download"></i>}
      id={_.uniqueId('fragment-download-')}
      variant="outline-primary"
    >
      <Dropdown.Item eventKey="1" disabled>
        Downlad as PDF
      </Dropdown.Item>
      <Dropdown.Item eventKey="2" disabled>
        Downlad as Word Document
      </Dropdown.Item>
      <Dropdown.Item eventKey="3" disabled>
        Downlad as ATF
      </Dropdown.Item>
      <Dropdown.Item eventKey="4" disabled>
        Downlad as JSON File
      </Dropdown.Item>
      <Dropdown.Item eventKey="5" disabled>
        Downlad as TEI XML File
      </Dropdown.Item>
    </DropdownButton>
  )
}
