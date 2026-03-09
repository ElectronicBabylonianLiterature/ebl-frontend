import React, { PropsWithChildren, useEffect, useState } from 'react'
import _ from 'lodash'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { Button, ButtonToolbar, ButtonGroup } from 'react-bootstrap'
import CollapsibleSection from './CollapsibleSection'

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
      }),
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

function nameToString(
  name: { family: string; given: string },
  format = 'Name, GivenName',
  initials = false,
) {
  const givenName =
    initials === true
      ? name.given
          .split(/[\s,-]+/)
          .map((n) => `${n[0]}.`)
          .join(' ')
      : name.given
  return format === 'Name, GivenName'
    ? `${name.family}, ${givenName}`
    : format === 'GivenName Name'
      ? `${givenName} ${name.family}`
      : `${givenName}, ${name.family}`
}

function namesToString(
  names: Array<{ family: string; given: string }>,
  prefix = '',
  format = 'Name, GivenName',
  initials = false,
) {
  prefix = prefix ? `${prefix} ` : prefix
  return !names.length
    ? ''
    : names.length > 1
      ? `${prefix}${names
          .sort((a, b) =>
            a.family > b.family ? 1 : b.family > a.family ? -1 : 0,
          )
          .slice(0, -1)
          .map((name) => nameToString(name, format, initials))
          .join(
            ', ',
          )} and ${nameToString(names.slice(-1)[0], format, initials)}`
      : `${prefix}${nameToString(names[0], format, initials)}`
}

function CitationText({ chapter }: { chapter: ChapterDisplay }): JSX.Element {
  const citationData = chapter.citation.data[0]
  const authorYear = `${namesToString(
    citationData.authorPrimary,
    '',
    'Name, GivenName',
    true,
  )} (${citationData.issued['date-parts'][0][0]})`
  const title = citationData.title.replace(' Chapter -', '')
  const contributors = namesToString(
    citationData.authorRevision,
    'With contributions by',
    'GivenName Name',
    true,
  )
  const translators = namesToString(
    citationData.translator,
    'Translated by',
    'GivenName Name',
  )
  const url = citationData.DOI
    ? `https://doi.org/${citationData.DOI}`
    : citationData.URL
  const citation = `${[authorYear, title, contributors, translators]
    .filter((element) => element)
    .join('. ')}.`.replace(/\.+/g, '.')
  return (
    <span>
      {citation}
      <i> electronic Babylonian Library</i>.<br />
      <a href={url}>{url}</a>
    </span>
  )
}

export function HowToCite({
  chapter,
}: {
  chapter: ChapterDisplay
}): JSX.Element {
  const citation = chapter.citation
  const bibtex = citation.format('bibtex')
  const ris = citation.format('ris')
  const csl = JSON.stringify(
    _.omitBy(
      citation.get({
        format: 'real',
        type: 'json',
        style: 'csl',
      })[0],
      (value, key) => key.startsWith('_'),
    ),
    null,
    2,
  )
  return (
    <CollapsibleSection
      classNameBlock="chapter-view"
      heading="How to cite"
      open
    >
      <CitationText chapter={chapter} />
      <ButtonToolbar className="justify-content-center mt-3">
        <ButtonGroup className="mr-2">
          <ExportButton
            data={bibtex}
            fileName={chapter.uniqueIdentifier}
            fileExtension="bibtex"
          >
            BibTeX
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
    </CollapsibleSection>
  )
}
