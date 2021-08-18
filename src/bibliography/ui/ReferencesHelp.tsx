import React from 'react'
import _ from 'lodash'
import { Popover } from 'react-bootstrap'
import HelpTrigger from 'common/HelpTrigger'

import './ReferencesHelp.sass'

function HelpEntry({
  abbreviation,
  definition,
}: {
  abbreviation: string
  definition: string
}): JSX.Element {
  return (
    <>
      <dt className="references-help__abbreviation">
        <code>{abbreviation}</code>
      </dt>
      <dd className="references-help__type">{definition}</dd>)
    </>
  )
}

function HelpOverlay(): JSX.Element {
  return (
    <Popover id={_.uniqueId('ReferencesHelp-')} title="References">
      <Popover.Content>
        <dl className="references-help__definitions">
          <HelpEntry abbreviation="C" definition="Copy" />
          <HelpEntry abbreviation="P" definition="Photograph" />
          <HelpEntry abbreviation="E" definition="Edition" />
          <HelpEntry abbreviation="D" definition="Discussion" />
          <HelpEntry abbreviation="T" definition="Translation" />
        </dl>
      </Popover.Content>
    </Popover>
  )
}
export function ReferencesHelp(): JSX.Element {
  return (
    <span className="references-help">
      <HelpTrigger overlay={<HelpOverlay />} />
    </span>
  )
}
