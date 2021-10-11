import { Popover } from 'react-bootstrap'
import _ from 'lodash'
import React from 'react'

export default function Help(): JSX.Element {
  return (
    <Popover id={_.uniqueId('Help-')} title="Annotation Help">
      <Popover.Content>
        <ul>
          <li>
            <b>Esc</b> Reset
          </li>
          <li>
            <b>Ctrl + Selecting Annotation:</b> Change Reading on existing
            Annotation
          </li>
          <li>
            <b>Shift + Panning:</b> Disable Selection and perform Panning
          </li>
        </ul>
      </Popover.Content>
    </Popover>
  )
}
