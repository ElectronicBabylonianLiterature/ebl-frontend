import React, { useEffect, useState } from 'react'
import { DropdownButton, ButtonGroup, Dropdown } from 'react-bootstrap'
import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import * as TeiExport from './TeiExport.js'

export default function Download({
  fragment,
}: {
  fragment: Fragment
}): JSX.Element {
  const [json, setJson] = useState<string>()
  const [atf, setAtf] = useState<string>()
  const [txml, setTei] = useState<string>()
  useEffect(() => {
    const teiUrl = URL.createObjectURL(
      new Blob([TeiExport.teiExport(fragment)], {
        type: 'text/plain;charset=UTF-8',
      })
    )
    setTei(teiUrl)

    const jsonUrl = URL.createObjectURL(
      new Blob([JSON.stringify(fragment, null, 2)], {
        type: 'application/json',
      })
    )
    setJson(jsonUrl)

    const atfUrl = URL.createObjectURL(
      new Blob([fragment.atfHeading, '\n', fragment.atf], {
        type: 'text/plain',
      })
    )
    setAtf(atfUrl)

    return (): void => {
      URL.revokeObjectURL(jsonUrl)
      URL.revokeObjectURL(atfUrl)
      URL.revokeObjectURL(teiUrl)
    }
  }, [fragment])
  return (
    <DropdownButton
      as={ButtonGroup}
      aria-label="Download"
      title={<i className="fas fa-file-download"></i>}
      id={_.uniqueId('fragment-download-')}
      variant="outline-primary"
    >
      <Dropdown.Item eventKey="1" disabled>
        Download as PDF
      </Dropdown.Item>
      <Dropdown.Item eventKey="2" disabled>
        Download as Word Document
      </Dropdown.Item>
      <Dropdown.Item
        data-testid="download-atf"
        eventKey="3"
        href={atf}
        download={`${fragment.number}.atf`}
      >
        Download as ATF
      </Dropdown.Item>
      <Dropdown.Item
        data-testid="download-json"
        eventKey="4"
        href={json}
        download={`${fragment.number}.json`}
      >
        Download as JSON File
      </Dropdown.Item>
      <Dropdown.Item
        eventKey="5"
        href={txml}
        download={`${fragment.number}.xml`}
      >
        Download as TEI XML File
      </Dropdown.Item>
    </DropdownButton>
  )
}
