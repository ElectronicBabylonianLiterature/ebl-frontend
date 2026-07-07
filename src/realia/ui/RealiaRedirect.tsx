import React from 'react'
import { Link } from 'react-router-dom'
import {
  RealiaCrossReference,
  RealiaEntry,
  realiaCrossReferenceTarget,
} from 'realia/domain/RealiaEntry'
import RealiaDevelopmentNotice from 'realia/ui/RealiaDevelopmentNotice'

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
        <Link
          to={`/tools/realia/${encodeURIComponent(
            realiaCrossReferenceTarget(target),
          )}`}
        >
          {target.lemma}
        </Link>
      </p>
    </div>
  )
}
