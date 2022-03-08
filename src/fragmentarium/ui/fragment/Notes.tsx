import React from 'react'

import './Notes.css'
import { Fragment } from 'fragmentarium/domain/fragment'

export default function Notes({
  fragment,
}: {
  fragment: Fragment
}): JSX.Element {
  return (
    <div className="notes__notes">
      <p className="notes__header">eBL Notes</p>
      {fragment.notes.split('\n').map((paragraph, index) => (
        <span key={index} className="notes__note">
          {paragraph}
        </span>
      ))}
    </div>
  )
}
