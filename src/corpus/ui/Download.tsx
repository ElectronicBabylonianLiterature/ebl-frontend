import React from 'react'

import Download from 'common/Download'

//type CorpusDownloadProps = {}

export default function DownloadFragment(): JSX.Element {
  const baseFileName = 'chapter'
  const pdfDownloadButton = <div></div>
  const wordDownloadButton = <div></div>
  return (
    <Download
      baseFileName={baseFileName}
      pdfDownloadButton={pdfDownloadButton}
      wordDownloadButton={wordDownloadButton}
      atfUrl={'#'}
      jsonUrl={'#'}
      teiUrl={'#'}
    />
  )
}
