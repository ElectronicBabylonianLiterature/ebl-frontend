import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'

export default function Notes({
  fragment,
}: {
  fragment: Fragment
}): JSX.Element {
  return (
    <section>
      <h4>eBL Notes</h4>
      {fragment.notes.split('\n').map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </section>
  )
}
