import React, { useEffect, useState } from 'react'
import { ChapterDisplay } from 'corpus/domain/chapter'
import Download from 'common/Download'

type DowndloadChapterProps = {
  chapter: ChapterDisplay
}

export default function DownloadChapter({
  chapter,
}: DowndloadChapterProps): JSX.Element {
  const baseFileName = chapter.uniqueIdentifier
  const [json, setJson] = useState<string>()
  const pdfDownloadButton = <div></div>
  const wordDownloadButton = <div></div>
  useEffect(() => {
    const jsonUrl = URL.createObjectURL(
      new Blob([JSON.stringify(chapter, null, 2)], {
        type: 'application/json',
      })
    )
    setJson(jsonUrl)
    return (): void => {
      URL.revokeObjectURL(jsonUrl)
    }
  }, [chapter])
  return (
    <Download
      baseFileName={baseFileName}
      pdfDownloadButton={pdfDownloadButton}
      wordDownloadButton={wordDownloadButton}
      jsonUrl={json}
    />
  )
}
