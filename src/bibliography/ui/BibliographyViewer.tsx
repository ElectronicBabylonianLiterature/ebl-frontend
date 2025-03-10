import React, { useContext } from 'react'
import { Cite } from '@citation-js/core'
import withData from 'http/withData'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Bluebird from 'bluebird'
import { History } from 'history'
import { match } from 'react-router'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Button } from 'react-bootstrap'
import { Parser } from 'html-to-react'
import Citation from 'bibliography/domain/Citation'
import Reference from 'bibliography/domain/Reference'
import InlineMarkdown from 'common/InlineMarkdown'
import SessionContext from 'auth/SessionContext'

type Props = {
  data: BibliographyEntry
  bibliographyService: {
    find(id: string): Promise<BibliographyEntry>
  }
  match: match<{ id: string }>
  history: History
}

function BibliographyViewer({ data, match, history }: Props): JSX.Element {
  const session = useContext(SessionContext)
  const reference = new Reference('DISCUSSION', '', '', [], data)
  const citation = Citation.for(reference)

  const citationTitle = citation.getMarkdown()
  const formattedCitationTitle = <InlineMarkdown source={citationTitle} />

  const parser = new Parser()

  const downloadFile = (format: string, filename: string) => {
    const cite = new Cite(data.toCslData())
    const output = cite.format(format, { format: 'text' })
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Bibliography'),
        new SectionCrumb('References'),
        new TextCrumb(formattedCitationTitle),
      ]}
      title={
        <>
          {`Reference: `}
          {formattedCitationTitle}
        </>
      }
      actions={
        <Button
          variant="outline-primary"
          onClick={() =>
            history.push(`/bibliography/references/${match.params.id}/edit`)
          }
          disabled={!session.isAllowedToWriteBibliography()}
        >
          <i className="fas fa-edit"></i> Edit
        </Button>
      }
    >
      {parser.parse(data.toHtml())}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '1em',
          gap: '0.5em',
        }}
      >
        <Button
          variant="outline-secondary"
          onClick={() => downloadFile('bibtex', `${data.id}.bib`)}
        >
          BibTeX
        </Button>
        <Button
          variant="outline-secondary"
          onClick={() => downloadFile('data', `${data.id}.json`)}
        >
          CSL-JSON
        </Button>
        <Button
          variant="outline-secondary"
          onClick={() => downloadFile('ris', `${data.id}.ris`)}
        >
          RIS
        </Button>
      </div>
    </AppContent>
  )
}

export default withData<
  Omit<Props, 'data'>,
  { match: match<{ id: string }> },
  BibliographyEntry
>(BibliographyViewer, (props) => {
  const decodedId = decodeURIComponent(props.match.params.id)
  return Bluebird.resolve(props.bibliographyService.find(decodedId))
})
