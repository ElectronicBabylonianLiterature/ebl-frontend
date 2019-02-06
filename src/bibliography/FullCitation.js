import React from 'react'
import { Parser } from 'html-to-react'
import ReactMarkdown from 'react-markdown'
import ExternalLink from 'common/ExternalLink'

export default function FullCitation ({ reference }) {
  const parser = new Parser()
  const citation = reference.citation.format('bibliography', {
    format: 'html',
    template: 'deutsches-archaologisches-institut',
    lang: 'en-US'
  })
  const parsed = parser.parse(citation)
  return <div>
    {reference.link
      ? <ExternalLink href={reference.link}>{parsed}</ExternalLink>
      : parsed
    }
    {reference.notes && <ReactMarkdown className='FullCitation__notes' source={`\\[${reference.notes}\\]`} />}
  </div>
}
