import React from 'react'
import _ from 'lodash'
import { Popover } from 'react-bootstrap'
import HelpTrigger from 'common/HelpTrigger'

import './ReferencesHelp.sass'

export function ReferencesHelp(): JSX.Element {
  const helpOverlay = (
    <Popover id={_.uniqueId('ReferencesHelp-')} title="References">
      <Popover.Content>
        <dl className="references-help__definitions">
          <dt className="references-help__abbreviation">
            <code>C</code>
          </dt>
          <dd className="references-help__type">Copy</dd>

          <dt className="references-help__abbreviation">
            <code>P</code>
          </dt>
          <dd className="references-help__type">Photograph</dd>

          <dt className="references-help__abbreviation">
            <code>E</code>
          </dt>
          <dd className="references-help__type">Edition</dd>

          <dt className="references-help__abbreviation">
            <code>D</code>
          </dt>
          <dd className="references-help__type">Discussion</dd>

          <dt className="references-help__abbreviation">
            <code>T</code>
          </dt>
          <dd className="references-help__type">Translation</dd>
        </dl>
      </Popover.Content>
    </Popover>
  )

  return (
    <span className="references-help">
      <HelpTrigger overlay={helpOverlay} />
    </span>
  )
}
