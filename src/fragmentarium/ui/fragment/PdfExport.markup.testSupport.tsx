import React from 'react'

export const pdfMarkup = { lines: '', notes: '', glossary: '' }

function Markup({ html }: { html: string }): JSX.Element {
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

function MarkupLines(): JSX.Element {
  return <Markup html={pdfMarkup.lines} />
}

function MarkupNotes(): JSX.Element {
  return <Markup html={pdfMarkup.notes} />
}

function MarkupGlossary(): JSX.Element {
  return pdfMarkup.glossary ? <Markup html={pdfMarkup.glossary} /> : <></>
}

export const linesModule = { __esModule: true, default: MarkupLines }
export const notesModule = { __esModule: true, default: MarkupNotes }
export const glossaryModule = { __esModule: true, Glossary: MarkupGlossary }
