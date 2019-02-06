import React from 'react'
import { Parser } from 'html-to-react'
import ReactMarkdown from 'react-markdown'

export default function FullCitation ({ reference }) {
  const parser = new Parser()
  const formatteCitation = reference.citation.format('bibliography', {
    format: 'html',
    template: 'deutsches-archaologisches-institut',
    lang: 'en-US'
  })
  return <div>
    {parser.parse(formatteCitation)}
    {reference.notes && <ReactMarkdown className='FullCitation__notes' source={`\\[${reference.notes}\\]`} />}
  </div>
}
