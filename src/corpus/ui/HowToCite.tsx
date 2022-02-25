import React, { PropsWithChildren, useRef, useState } from 'react'
import _ from 'lodash'
import { Parser } from 'html-to-react'
import { ChapterDisplay } from 'corpus/domain/chapter'
import {
  Button,
  ButtonToolbar,
  ButtonGroup,
  Overlay,
  Popover,
} from 'react-bootstrap'

function ExportButton({
  data,
  children,
}: PropsWithChildren<{ data: string }>): JSX.Element {
  const [show, setShow] = useState(false)
  const target = useRef(null)

  return (
    <>
      <Button
        variant="outline-secondary"
        size="sm"
        ref={target}
        onClick={() => setShow(!show)}
      >
        {children}
      </Button>
      <Overlay
        target={target.current}
        show={show}
        placement="bottom"
        onHide={() => setShow(false)}
        rootClose
      >
        <Popover
          id={_.uniqueId('how-to-cite-export-')}
          className={'mw-100'}
          content
        >
          <pre>{data}</pre>
        </Popover>
      </Overlay>
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
          <ExportButton data={bibtex}>Bibtex</ExportButton>
        </ButtonGroup>
        <ButtonGroup className="mr-2">
          <ExportButton data={ris}>RIS</ExportButton>
        </ButtonGroup>
        <ButtonGroup className="mr-2">
          <ExportButton data={csl}>CSL-JSON</ExportButton>
        </ButtonGroup>
      </ButtonToolbar>
    </section>
  )
}
