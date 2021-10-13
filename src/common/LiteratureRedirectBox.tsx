import React from 'react'
import ExternalLink from 'common/ExternalLink'

export const LiteratureRedirectBox = ({
  authors,
  book,
  subtitle,
  notelink,
  note,
  link,
  icon,
}: {
  authors: string
  book: string
  subtitle: string
  notelink: string | null
  note: string
  link: string
  icon: string
}): JSX.Element => (
  <div className="text-center border border-dark mx-5 m-3 p-2">
    <strong>From</strong>
    <br />
    {authors}, <em>{book}</em>. {subtitle}.
    <br />
    {(notelink && (
      <>
        <ExternalLink className="text-dark " href={notelink}>
          <strong>{note}</strong>
        </ExternalLink>
      </>
    )) || <strong>{note}</strong>}
    <br />
    <ExternalLink className="text-dark " href={link}>
      <i className={icon} />`
    </ExternalLink>
  </div>
)
