import React, { useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { saveAs } from 'file-saver'
import Spinner from 'common/ui/Spinner'
import { Document, Packer } from 'docx'
import $ from 'jquery'
import usePromiseEffect from 'common/hooks/usePromiseEffect'
import { FragmentWordExportContext } from 'fragmentarium/ui/fragment/Download'
import { CorpusWordExportContext } from 'corpus/ui/Download'

type Props = {
  context: CorpusWordExportContext | FragmentWordExportContext
  baseFileName: string
  children: JSX.Element | string
  getWordDoc: (jQueryRef: JQuery) => Promise<Document>
}

export default function WordDownloadButton({
  context,
  baseFileName,
  children,
  getWordDoc,
}: Props): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [runDownload] = usePromiseEffect()

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()

    const jQueryRef = $('#jQueryContainer')
    setIsLoading(true)

    runDownload((signal) =>
      getWordDoc
        .call(context, jQueryRef)
        .then(packWordDoc)
        .then((blob) => {
          if (!signal.aborted) {
            saveAs(blob, `${baseFileName}.docx`)
            setIsLoading(false)
          }
        }),
    )
  }

  return (
    <>
      <Dropdown.Item as="button" onClick={handleClick}>
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
