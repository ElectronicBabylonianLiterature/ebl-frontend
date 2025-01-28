import React from 'react'
import { DropdownButton, ButtonGroup, Dropdown } from 'react-bootstrap'
import _ from 'lodash'

type Props = {
  pdfDownloadButton: JSX.Element
  wordDownloadButton: JSX.Element
  baseFileName: string
  atfUrl?: string
  jsonUrl?: string
  teiUrl?: string
}

export default function Download({
  pdfDownloadButton,
  wordDownloadButton,
  baseFileName,
  atfUrl,
  jsonUrl,
  teiUrl,
}: Props): JSX.Element {
  return (
    <DropdownButton
      key="downloadDropdown"
      as={ButtonGroup}
      aria-label="Download"
      title={<i className="fas fa-file-download"></i>}
      id={_.uniqueId('file-download-')}
      variant="outline-primary"
    >
      {[wordDownloadButton, pdfDownloadButton]}
      {atfUrl ? (
        <Dropdown.Item
          eventKey="3"
          href={atfUrl}
          download={`${baseFileName}.atf`}
        >
          Download as ATF
        </Dropdown.Item>
      ) : (
        ''
      )}
      {jsonUrl ? (
        <Dropdown.Item
          eventKey="4"
          href={jsonUrl}
          download={`${baseFileName}.json`}
        >
          Download as JSON File
        </Dropdown.Item>
      ) : (
        ''
      )}
      {teiUrl ? (
        <Dropdown.Item
          eventKey="5"
          href={teiUrl}
          download={`${baseFileName}.xml`}
        >
          Download as TEI XML File
        </Dropdown.Item>
      ) : (
        ''
      )}
    </DropdownButton>
  )
}
