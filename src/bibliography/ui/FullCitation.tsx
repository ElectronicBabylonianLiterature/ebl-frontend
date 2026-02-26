import React from 'react'
import { Parser } from 'html-to-react'
import MarkdownAndHtmlToHtml from 'common/MarkdownAndHtmlToHtml'
import ExternalLink from 'common/ExternalLink'
import Reference from 'bibliography/domain/Reference'

import './FullCitation.css'

export default function FullCitation({
  reference,
}: {
  reference: Reference
}): JSX.Element {
  const parser = Parser()
  const citation = reference.toHtml()
  const parsed = parser.parse(citation)
  return (
    <div>
      {reference.link && (
        <ExternalLink
          className="FullCitation__link"
          href={reference.link}
          title="Open in a new window."
        >
          <i className="fas fa-external-link-alt" />
        </ExternalLink>
      )}
      {parsed}
      {reference.notes && (
        <MarkdownAndHtmlToHtml
          markdownAndHtml={`[${reference.notes}]`}
          className="FullCitation__notes"
          container="span"
        />
      )}
    </div>
  )
}
