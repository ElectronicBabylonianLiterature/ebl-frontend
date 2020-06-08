import React, { useEffect, useState } from 'react'
import { DropdownButton, ButtonGroup, Dropdown } from 'react-bootstrap'
import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'

export default function Download({
  fragment,
}: {
  fragment: Fragment
}): JSX.Element {
  const [json, setJson] = useState<string>()
  const [atf, setAtf] = useState<string>()
  useEffect(() => {
    const jsonUrl = URL.createObjectURL(
      new Blob([JSON.stringify(fragment, null, 2)], {
        type: 'application/json',
      })
    )
    setJson(jsonUrl)
    const atfUrl = URL.createObjectURL(
      new Blob([fragment.atf], {
        type: 'text/plain',
      })
    )
    setAtf(atfUrl)
    return (): void => {
      URL.revokeObjectURL(jsonUrl)
      URL.revokeObjectURL(atfUrl)
    }
  }, [fragment])
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
      <Dropdown.Item
        eventKey="3"
        href={atf}
        download={`${fragment.number}.atf`}
      >
        Downlad as ATF
      </Dropdown.Item>
      <Dropdown.Item
        eventKey="4"
        href={json}
        download={`${fragment.number}.json`}
      >
        Downlad as JSON File
      </Dropdown.Item>
      <Dropdown.Item eventKey="5" disabled>
        Downlad as TEI XML File
      </Dropdown.Item>
    </DropdownButton>
  )
}
