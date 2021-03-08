import React, { useEffect, useState } from 'react'
import { DropdownButton, ButtonGroup, Dropdown } from 'react-bootstrap'
import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import * as TeiExport from './TeiExport'
import WordService from 'dictionary/application/WordService'
import WordDownloadButton from './WordDownloadButton'
import PdfDownloadButton from './PdfDownloadButton'

type Props = {
  fragment: Fragment
  wordService: WordService
}

export default function Download({
  fragment,
  wordService,
}: Props): JSX.Element {
  const [json, setJson] = useState<string>()
  const [atf, setAtf] = useState<string>()
  const [xml, setTei] = useState<string>()

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
      URL.revokeObjectURL(atfUrl)
      URL.revokeObjectURL(jsonUrl)
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
      <PdfDownloadButton fragment={fragment} wordService={wordService}>
        Download as PDF
      </PdfDownloadButton>
      <WordDownloadButton fragment={fragment} wordService={wordService}>
        Download as Word
      </WordDownloadButton>
      <Dropdown.Item
        eventKey="3"
        href={atf}
        download={`${fragment.number}.atf`}
      >
        Download as ATF
      </Dropdown.Item>
      <Dropdown.Item
        eventKey="4"
        href={json}
        download={`${fragment.number}.json`}
      >
        Download as JSON File
      </Dropdown.Item>
      <Dropdown.Item
        eventKey="5"
        href={xml}
        download={`${fragment.number}.xml`}
      >
        Download as TEI XML File
      </Dropdown.Item>
    </DropdownButton>
  )
}
