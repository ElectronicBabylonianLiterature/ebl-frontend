import React, { useState } from 'react'
import { wordExport } from './WordExport'
import { Fragment } from 'fragmentarium/domain/fragment'
import WordService from 'dictionary/application/WordService'
import { Dropdown } from 'react-bootstrap'
import { saveAs } from 'file-saver'
import Spinner from 'common/Spinner'
import { Packer } from 'docx'
import $ from 'jquery'
type Props = {
  children: React.ReactNode
  fragment: Fragment
  wordService: WordService
}

export default function WordDownloadButton({
  fragment,
  wordService,
  children,
}: Props): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  // const jQueryRef = useRef(null)
  const jQueryRef = $('#jQueryContainer')
  const handleClick = (event) => {
    setIsLoading(true)
    getWordBlob(fragment, wordService, jQueryRef).then((blob) => {
      saveAs(blob, `${fragment.number}.docx`)
      setIsLoading(false)
    })
  }

  return (
    <>
      <Dropdown.Item onClick={handleClick}>
        {isLoading ? <Spinner /> : children}
      </Dropdown.Item>
      <div id="jQueryContainer" style={{ display: 'none' }}></div>
    </>
  )
}

async function getWordBlob(
  fragment: Fragment,
  wordService: WordService,
  jQueryRef: JQuery
): Promise<Blob> {
  const wordDoc = await wordExport(fragment, wordService, jQueryRef)
  const wordBlob: Blob = await Packer.toBlob(wordDoc)

  return wordBlob
}
