import React, { useState } from 'react'
import { pdfExport } from './PdfExport'
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

    // setPromise(
    //   getWordDoc(fragment, wordService, jQueryRef)
    //     .then(packWordDoc)
    //     .then((blob) => {
    //       saveAs(blob, `${fragment.number}.docx`)
    //       setIsLoading(false)
    //     })
    // )

    pdfExport(fragment, wordService, jQueryRef)

    // setPromise(

    // .then((doc) => {

    // var options = {
    // styleMap: [
    // "comment-reference => sup"
    // ]
    // };

    // var xy = convertToHtml({arrayBuffer: buffer}, options);
    // xy.then((html) =>{

    // const pdfdoc = new jsPDF();

    // pdfdoc.html(html.value, {
    // callback: function (doc) {
    // doc.save();
    // },
    // x: 10,
    // y: 10
    // });

    //   // var element = document.getElementById('root');
    //   //  html2pdf(element)

    // })

    // setIsLoading(false)

    // })

    // )
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

// function getPdfDoc(
//   fragment: Fragment,
//   wordService: WordService,
//   jQueryRef: JQuery
// ): Promise<Document> {
//   return new Promise(function (resolve) {
//     resolve(pdfExport(fragment, wordService, jQueryRef))
//   })
// }

function packWordDoc(doc: Document): Promise<Blob> {
  return new Promise(function (resolve) {
    resolve(Packer.toBlob(doc))
  })
}

function packWordDocToBuffer(doc: Document): Promise<Buffer> {
  return new Promise(function (resolve) {
    resolve(Packer.toBuffer(doc))
  })
}
