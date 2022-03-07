import React from 'react'

import './Notes.css'
import { Fragment } from 'fragmentarium/domain/fragment'

export default function Notes({
  fragment,
}: {
  fragment: Fragment
}): JSX.Element {
  return (
    <div className="Notes__notes">
      <p className="Notes__header">eBL Notes</p>
      {fragment.notes.split('\n').map((paragraph, index) => (
        <span key={index} className="Notes__note">
          {paragraph}
        </span>
      ))}
    </div>
  )
}
