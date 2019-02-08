import React from 'react'
import { Parser } from 'html-to-react'
import ReactMarkdown from 'react-markdown'
import ExternalLink from 'common/ExternalLink'

import './FullCitation.css'

export default function FullCitation ({ reference }) {
  const parser = new Parser()
  const citation = reference.document.citation.format('bibliography', {
    format: 'html',
    template: 'citation-apa',
    lang: 'de-DE'
  })
  const parsed = parser.parse(citation)
  return <div>
    {reference.document.link &&
      <ExternalLink className='FullCitation__link' href={reference.document.link} title='Open in a new window.'>
        <i className='fas fa-external-link-alt' />
      </ExternalLink>}
    {parsed}
    {reference.notes && <ReactMarkdown className='FullCitation__notes' source={`\\[${reference.notes}\\]`} />}
  </div>
}
