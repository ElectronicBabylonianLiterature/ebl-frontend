import React from 'react'
import { Popover } from 'react-bootstrap'
import _ from 'lodash'

export default function NotesHelp() {
  return (
    <Popover id={_.uniqueId('NotesHelp-')} title="Notes Help">
      <p>
        For <em>Italics</em>, use <code>*Text*</code>; for <strong>Bold</strong>
        , use <code>**Text**</code>.
      </p>
    </Popover>
  )
}
