import React, { useEffect, useState } from 'react'
import { immerable } from 'immer'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { Text } from 'corpus/domain/text'
import TextService from 'corpus/application/TextService'
import WordService from 'dictionary/application/WordService'
import WordDownloadButton from 'common/WordDownloadButton'
import Download from 'common/Download'
import { wordExport } from 'corpus/ui/WordExport'
import Promise from 'bluebird'
import { Document } from 'docx'

type DowndloadChapterProps = {
  chapter: ChapterDisplay
  text: Text
  textService: TextService
  wordService: WordService
}

export default function DownloadChapter({
  chapter,
  text,
  textService,
  wordService,
}: DowndloadChapterProps): JSX.Element {
  const baseFileName = chapter.uniqueIdentifier
  const [json, setJson] = useState<string>()
  const [atf, setAtf] = useState<string>()
  const pdfDownloadButton = <span key="pdfDownloadButton"></span>
  const wordDownloadButton = (
    <WordDownloadButton
      context={
        new CorpusWordExportContext(chapter, text, textService, wordService)
      }
      baseFileName={baseFileName}
      getWordDoc={getWordDoc}
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

export class CorpusWordExportContext {
  readonly [immerable] = true

  constructor(
    readonly chapter: ChapterDisplay,
    readonly text: Text,
    readonly textService: TextService,
    readonly wordService: WordService
  ) {}
}

function getWordDoc(
  this: CorpusWordExportContext,
  jQueryRef: JQuery
): Promise<Document> {
  return new Promise((resolve) => {
    resolve(
      wordExport(
        this.chapter,
        this.text,
        this.textService,
        this.wordService,
        jQueryRef
      )
    )
  })
}
