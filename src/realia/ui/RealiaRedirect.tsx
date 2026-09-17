import React from 'react'
import { RealiaCrossReference, RealiaEntry } from 'realia/domain/RealiaEntry'
import RealiaDevelopmentNotice from 'realia/ui/RealiaDevelopmentNotice'
import { RealiaCrossReferenceLink } from 'realia/ui/RealiaCrossReferenceLink'

export function RealiaRedirect({
  entry,
  target,
}: {
  entry: RealiaEntry
  target: RealiaCrossReference
}): JSX.Element {
  return (
    <div className="Realia__redirect">
      <RealiaDevelopmentNotice />
      <h1>{entry.id}</h1>
      <p className="Realia__redirect-pointer">
        <i className="fas fa-arrow-right" aria-hidden="true" />
        {' see '}
        <RealiaCrossReferenceLink crossReference={target} />
      </p>
    </div>
  )
}
