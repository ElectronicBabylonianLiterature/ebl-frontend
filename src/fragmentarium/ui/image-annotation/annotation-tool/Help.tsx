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
            <b>
              <code>y</code> + Select Annotation
            </b>
            : Change Reading on existing Annotation
          </li>
          <li>
            <b>
              <code>Shift</code> + Panning
            </b>
            : Disable Selection and perform Panning
          </li>
          <li>
            <b>
              <code>y</code>
            </b>
            : Disable/Enable content which is needed if you want to delete an
            annotation
          </li>
          <li>
            <b>Automatic Selection</b>: If Automatic Selection is active,
            annotations will automatically become blank. Once multiple readings
            are annotated with blank one can select an Annotation while
            clickling <code>y</code>. Now in <b>change existing mode</b> one can
            select a reading. All Annotations to the right of this selection
            will have a reading assigned automatically.
          </li>
        </ul>
      </Popover.Content>
    </Popover>
  )
}
