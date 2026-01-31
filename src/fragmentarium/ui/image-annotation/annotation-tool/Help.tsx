import { Popover } from 'react-bootstrap'
import _ from 'lodash'
import React from 'react'

export default function Help(): JSX.Element {
  return (
    <Popover
      id={_.uniqueId('Help-')}
      title="Annotation Help"
      style={{ maxWidth: '30%' }}
    >
      <Popover.Body>
        <ul>
          <li>
            <b>
              <code>Esc</code>
            </b>{' '}
            &quot;Esc&quot; will reset selection mode
          </li>
          <li>
            <b>
              <code>y + Select Annotation</code>
            </b>
            : Change Reading/Sign on existing Annotation
          </li>
          <li>
            <b>
              <code>Shift + Panning</code>
            </b>
            : Disable Selection and perform Panning
          </li>
          <li>
            <b>
              <code>Show </code>
            </b>
            : <br />
            If this key is toggled, outdated annotations and the
            &quot;content&quot; box will be shown when hovering over an
            annotation. If this key is not toggled, the &quot;content&quot; box
            will not be shown and you can delete an annotation by pressing the
            &quot;Delete&quot; key while hovering over an annotation.
            <br /> Every annotation is considered outdated if the
            transliteration has changed after somebody has annotated the
            fragment. Outdated annotation will be shown in yellow. Sometimes if
            a join has been found, every annotation will be outdated because the
            existing transliteration will be deleted due to the join.
          </li>
          <li>
            <b>
              <code>Automatic Selection</code>
            </b>
            : <br /> If Automatic Selection is active, annotations will
            automatically become blank one selection. Once multiple annotations
            one a horizontal line have been created one can select the first
            annotation while clicking the <code>y</code> key. All Annotations to
            the right of this selection will have a reading assigned
            automatically. This way one can quickly create annotations for a
            whole line.
          </li>
        </ul>
      </Popover.Body>
    </Popover>
  )
}
