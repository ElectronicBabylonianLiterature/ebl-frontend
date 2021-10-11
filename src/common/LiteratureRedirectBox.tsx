import React from 'react'
import ExternalLink from 'common/ExternalLink'

export const LiteratureRedirectBox = ({
  authors,
  book,
  subtitle,
  note,
  link,
  icon,
}: {
  authors: string
  book: string
  subtitle: string
  note: any
  link: any
  icon: any
}): JSX.Element => (
  <div className="text-center border border-dark m-3 p-3">
    <strong>From</strong>
    <br />
    {authors}, <em>{book}</em>. {subtitle}
    <br />
    <strong>{note}</strong>
    <br />
    <ExternalLink className="text-dark " href={link}>
      <i className={icon} />`
    </ExternalLink>
  </div>
)
