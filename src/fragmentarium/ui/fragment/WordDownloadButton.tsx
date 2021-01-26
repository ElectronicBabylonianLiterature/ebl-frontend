import React, { useState, useEffect } from 'react'
import { wordExport } from './WordExport'
import { Fragment } from 'fragmentarium/domain/fragment'
import WordService from 'dictionary/application/WordService'
import { Dropdown } from 'react-bootstrap'
import { saveAs } from 'file-saver'
import Spinner from 'common/Spinner'
import { Packer } from 'docx'
import $ from 'jquery'
import Promise from 'bluebird'
import { Document } from 'docx'
import usePromiseEffect from 'common/usePromiseEffect'

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
  const [setPromise, cancelPromise] = usePromiseEffect()

  const handleClick = (event) => {
    const jQueryRef = $('#jQueryContainer')
    setIsLoading(true)
    cancelPromise()

    setPromise(
      getWordDoc(fragment, wordService, jQueryRef)
        .then((doc) => {
          setPromise(
            packWordDoc(doc)
              .then((blob) => {
                saveAs(blob, `${fragment.number}.docx`)
                setIsLoading(false)
              })
              .catch((reason) => cancelPromise())
          )
        })
        .catch((reason) => cancelPromise())
    )
  }

  // useEffect( () => () => console.log("unmount"), [] );

  return (
    <>
      <Dropdown.Item onClick={handleClick}>
        {isLoading ? <Spinner /> : children}
      </Dropdown.Item>
      <div id="jQueryContainer" style={{ display: 'none' }}></div>
    </>
  )
}

function getWordDoc(
  fragment: Fragment,
  wordService: WordService,
  jQueryRef: JQuery
): Promise<Document> {
  return new Promise(function (resolve) {
    resolve(wordExport(fragment, wordService, jQueryRef))
  })
}

function packWordDoc(doc: Document): Promise<Blob> {
  return new Promise(function (resolve) {
    resolve(Packer.toBlob(doc))
  })
}
