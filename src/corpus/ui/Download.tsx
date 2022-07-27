import React, { useEffect, useState } from 'react'
import { ChapterDisplay } from 'corpus/domain/chapter'
import WordService from 'dictionary/application/WordService'
import WordDownloadButton from 'common/WordDownloadButton'
import Download from 'common/Download'
import { wordExport } from 'corpus/ui/WordExport'
import Promise from 'bluebird'
import { Document } from 'docx'

type DowndloadChapterProps = {
  chapter: ChapterDisplay
  wordService: WordService
}

export default function DownloadChapter({
  chapter,
  wordService,
}: DowndloadChapterProps): JSX.Element {
  const baseFileName = chapter.uniqueIdentifier
  const [json, setJson] = useState<string>()
  const [atf, setAtf] = useState<string>()
  const pdfDownloadButton = <span key="pdfDownloadButton"></span>
  const wordDownloadButton = (
    <WordDownloadButton
      data={chapter}
      baseFileName={baseFileName}
      getWordDoc={getWordDoc}
      wordService={wordService}
      key="wordDownload"
    >
      Download as Word
    </WordDownloadButton>
  )
  useEffect(() => {
    const jsonUrl = URL.createObjectURL(
      new Blob([JSON.stringify(chapter, null, 2)], {
        type: 'application/json',
      })
    )
    setJson(jsonUrl)

    const atfUrl = URL.createObjectURL(
      new Blob([chapter.atf], {
        type: 'text/plain',
      })
    )
    setAtf(atfUrl)

    return (): void => {
      URL.revokeObjectURL(atfUrl)
      URL.revokeObjectURL(jsonUrl)
    }
  }, [chapter])
  return (
    <Download
      baseFileName={baseFileName}
      pdfDownloadButton={pdfDownloadButton}
      wordDownloadButton={wordDownloadButton}
      atfUrl={atf}
      jsonUrl={json}
    />
  )
}

function getWordDoc(
  chapter: ChapterDisplay,
  wordService: WordService,
  jQueryRef: JQuery
): Promise<Document> {
  return new Promise(function (resolve) {
    resolve(wordExport(chapter, wordService, jQueryRef))
  })
}
