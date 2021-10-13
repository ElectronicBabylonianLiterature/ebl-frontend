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
            <b>Ctrl + Select Annotation:</b> Change Reading on existing
            Annotation
          </li>
          <li>
            <b>Shift + Panning:</b> Disable Selection and perform Panning
          </li>
          <li>
            <b>Shift + Panning:</b> Disable Selection and perform Panning
          </li>
          <li>
            <b>Automatic Selection</b> To perform Automatic Selection annotate
            one Sign with it&apos;s corresponding reading from the left and then
            annotate right neighbouring signs with <b>blank</b>. Then click on
            Automatic Selection and select the first annotated Sign (the one
            which has a proper reading not blank) neighbouring annotations with
            blank will be automatically linked to their corresponding readings
            on the left.
          </li>
        </ul>
      </Popover.Content>
    </Popover>
  )
}
