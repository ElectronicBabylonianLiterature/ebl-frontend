import React, { useContext } from 'react'
import { Button } from 'react-bootstrap'
import { Cite } from '@citation-js/core'
import { History } from 'history'
import { match } from 'react-router'
import { Parser } from 'html-to-react'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import AppContent from 'common/AppContent'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Bluebird from 'bluebird'
import Citation from 'bibliography/domain/Citation'
import DownloadButton from './BibliographyDownloadButton'
import ExternalLink from 'common/ExternalLink'
import InlineMarkdown from 'common/InlineMarkdown'
import Reference from 'bibliography/domain/Reference'
import SessionContext from 'auth/SessionContext'
import withData from 'http/withData'

type Props = {
  data: BibliographyEntry
  bibliographyService: {
    find(id: string): Promise<BibliographyEntry>
  }
  match: match<{ id: string }>
  history: History
}

function replaceRisDateWithPublicationYear(risData: string): string {
  return risData.replace(/DA\s*-\s*(\d{4})\/\/\//g, 'PY  - $1')
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
    let output = cite.format(format, { format: 'text' })

    if (format === 'ris') {
      output = replaceRisDateWithPublicationYear(output)
    }

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
      <div style={{ display: 'flex' }}>
        <div>{parser.parse(data.toHtml())}</div>
        <div>
          {reference.link && (
            <ExternalLink
              className="FullCitation__link"
              href={reference.link}
              title="Open in a new window."
              style={{ marginLeft: '1em' }}
            >
              <i className="fas fa-external-link-alt" />
            </ExternalLink>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '1em',
          gap: '0.5em',
        }}
      >
        <DownloadButton
          format="bibtex"
          filename={`${data.id}.bib`}
          label="BibTeX"
          onClick={downloadFile}
        />
        <DownloadButton
          format="data"
          filename={`${data.id}.json`}
          label="CSL-JSON"
          onClick={downloadFile}
        />
        <DownloadButton
          format="ris"
          filename={`${data.id}.ris`}
          label="RIS"
          onClick={downloadFile}
        />
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
