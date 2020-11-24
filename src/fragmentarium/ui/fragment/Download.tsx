import React, { useEffect, useState } from 'react'
import { DropdownButton, ButtonGroup, Dropdown } from 'react-bootstrap'
import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import * as TeiExport from './TeiExport'
import { wordExport } from './WordExport'
import WordService from 'dictionary/application/WordService'

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
  const [docx, setWord] = useState<string>()
  useEffect(() => {
    async function wordBlobToUrl() {
      const wordBlob = await wordExport(fragment, wordService)
      const wordUrl = URL.createObjectURL(wordBlob)
      setWord(wordUrl)
    }
    wordBlobToUrl()

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
      // URL.revokeObjectURL(wordUrl)
    }
  }, [fragment, wordService])
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
      <Dropdown.Item
        eventKey="2"
        href={docx}
        download={`${fragment.number}.docx`}
      >
        Download as Word Document
      </Dropdown.Item>
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
