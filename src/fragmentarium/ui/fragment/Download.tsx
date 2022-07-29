import React, { useEffect, useState } from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import * as TeiExport from 'fragmentarium/ui/fragment/TeiExport'
import WordService from 'dictionary/application/WordService'
import WordDownloadButton from 'fragmentarium/ui/fragment/WordDownloadButton'
import PdfDownloadButton from 'fragmentarium/ui/fragment/PdfDownloadButton'
import Download from 'common/Download'

type DowndloadFragmentProps = {
  fragment: Fragment
  wordService: WordService
}

export default function DownloadFragment({
  fragment,
  wordService,
}: DowndloadFragmentProps): JSX.Element {
  const baseFileName = fragment.number
  const [json, setJson] = useState<string>()
  const [atf, setAtf] = useState<string>()
  const [xml, setTei] = useState<string>()
  const pdfDownloadButton = (
    <PdfDownloadButton
      fragment={fragment}
      wordService={wordService}
      key="pdfDownload"
    >
      Download as PDF
    </PdfDownloadButton>
  )
  const wordDownloadButton = (
    <WordDownloadButton
      fragment={fragment}
      wordService={wordService}
      key="wordDownload"
    >
      Download as Word
    </WordDownloadButton>
  )
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
    <Download
      baseFileName={baseFileName}
      pdfDownloadButton={pdfDownloadButton}
      wordDownloadButton={wordDownloadButton}
      atfUrl={atf}
      jsonUrl={json}
      teiUrl={xml}
    />
  )
}
