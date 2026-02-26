import React, { useState } from 'react'
import { pdfExport } from './PdfExport'
import { Fragment } from 'fragmentarium/domain/fragment'
import WordService from 'dictionary/application/WordService'
import { Dropdown } from 'react-bootstrap'
import Spinner from 'common/Spinner'
import $ from 'jquery'
import Promise from 'bluebird'
import usePromiseEffect from 'common/usePromiseEffect'
import { jsPDF } from 'jspdf'

type Props = {
  children: React.ReactNode
  fragment: Fragment
  wordService: WordService
}

export default function PdfDownloadButton({
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
      getPdfDoc(fragment, wordService, jQueryRef).then((doc) => {
        doc.save(fragment.number + '.pdf')
        setIsLoading(false)
      }),
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

function getPdfDoc(
  fragment: Fragment,
  wordService: WordService,
  jQueryRef: JQuery,
): Promise<jsPDF> {
  return new Promise(function (resolve) {
    resolve(pdfExport(fragment, wordService, jQueryRef))
  })
}
