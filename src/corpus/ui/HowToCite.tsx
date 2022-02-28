import React, { PropsWithChildren, useEffect, useState } from 'react'
import _ from 'lodash'
import { Parser } from 'html-to-react'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { Button, ButtonToolbar, ButtonGroup } from 'react-bootstrap'

function ExportButton({
  data,
  children,
  fileName,
  fileExtension = 'txt',
  contentType = 'text/plain',
}: PropsWithChildren<{
  data: string
  fileName: string
  fileExtension?: string
  contentType?: string
}>): JSX.Element {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    const url = URL.createObjectURL(
      new Blob([data], {
        type: `${contentType};charset=UTF-8`,
      })
    )
    setUrl(url)

    return (): void => {
      URL.revokeObjectURL(url)
    }
  }, [data, contentType])

  return (
    <>
      {url && (
        <a href={url} download={`${fileName}.${fileExtension}`}>
          <Button variant="outline-secondary" size="sm">
            {children}
          </Button>
        </a>
      )}
    </>
  )
}

export function HowToCite({
  chapter,
}: {
  chapter: ChapterDisplay
}): JSX.Element {
  const citation = chapter.citation
  const parsed = new Parser().parse(
    citation.format('bibliography', {
      format: 'html',
      template: 'citation-apa',
    })
  )
  const bibtex = citation.format('bibtex')
  const ris = citation.format('ris')
  const csl = JSON.stringify(
    _.omitBy(
      citation.get({
        format: 'real',
        type: 'json',
        style: 'csl',
      })[0],
      (value, key) => key.startsWith('_')
    ),
    null,
    2
  )
  return (
    <section>
      <h3>How to cite</h3>
      <p>{parsed}</p>
      <ButtonToolbar className="justify-content-center">
        <ButtonGroup className="mr-2">
          <ExportButton
            data={bibtex}
            fileName={chapter.uniqueIdentifier}
            fileExtension="bibtex"
          >
            Bibtex
          </ExportButton>
        </ButtonGroup>
        <ButtonGroup className="mr-2">
          <ExportButton
            data={ris}
            fileName={chapter.uniqueIdentifier}
            fileExtension="ris"
          >
            RIS
          </ExportButton>
        </ButtonGroup>
        <ButtonGroup className="mr-2">
          <ExportButton
            data={csl}
            fileName={chapter.uniqueIdentifier}
            fileExtension="json"
            contentType="application/json"
          >
            CSL-JSON
          </ExportButton>
        </ButtonGroup>
      </ButtonToolbar>
    </section>
  )
}
