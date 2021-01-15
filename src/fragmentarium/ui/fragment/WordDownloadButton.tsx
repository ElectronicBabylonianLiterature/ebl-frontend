import React, { useState } from 'react'
import { wordExport } from './WordExport'
import { Fragment } from 'fragmentarium/domain/fragment'
import WordService from 'dictionary/application/WordService'
import { Dropdown } from 'react-bootstrap'
import { saveAs } from 'file-saver'
import Spinner from 'common/Spinner'
import { Packer } from 'docx'

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

  const handleClick = (event) => {
    setIsLoading(true)
    getWordBlob(fragment, wordService).then((blob) => {
      saveAs(blob, `${fragment.number}.docx`)
      setIsLoading(false)
    })
  }

  return (
    <>
      <Dropdown.Item onClick={handleClick}>
        {isLoading ? <Spinner /> : children}
      </Dropdown.Item>
    </>
  )
}

async function getWordBlob(
  fragment: Fragment,
  wordService: WordService
): Promise<Blob> {
  const wordDoc = await wordExport(fragment, wordService).then((doc) => {
    return doc
  })
  const wordBlob: Blob = await Packer.toBlob(wordDoc).then((blob) => {
    return blob
  })
  return wordBlob
}
