import React, { useState } from 'react'
import WordService from 'dictionary/application/WordService'
import { Dropdown } from 'react-bootstrap'
import { saveAs } from 'file-saver'
import Spinner from 'common/Spinner'
import { Document, Packer } from 'docx'
import $ from 'jquery'
import Promise from 'bluebird'
import usePromiseEffect from 'common/usePromiseEffect'
import { Fragment } from 'fragmentarium/domain/fragment'
import { ChapterDisplay } from 'corpus/domain/chapter'

type Props = {
  data: Fragment | ChapterDisplay
  baseFileName: string
  children: React.ReactNode
  wordService: WordService
  getWordDoc: (
    any,
    wordService: WordService,
    jQueryRef: JQuery
  ) => Promise<Document>
}

export default function WordDownloadButton({
  data,
  baseFileName,
  children,
  wordService,
  getWordDoc,
}: Props): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [setPromise, cancelPromise] = usePromiseEffect()

  const handleClick = (event) => {
    const jQueryRef = $('#jQueryContainer')
    setIsLoading(true)
    cancelPromise()

    setPromise(
      getWordDoc(data, wordService, jQueryRef)
        .then(packWordDoc)
        .then((blob) => {
          saveAs(blob, `${baseFileName}.docx`)
          setIsLoading(false)
        })
    )
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

function packWordDoc(doc: Document): Promise<Blob> {
  return new Promise(function (resolve) {
    resolve(Packer.toBlob(doc))
  })
}
