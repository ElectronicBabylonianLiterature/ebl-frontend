import React from 'react'
import _ from 'lodash'
import classnames from 'classnames'
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
      <dd className="references-help__type">{definition}</dd>
      <dt className="references-help__abbreviation">
        <code>{abbreviation}</code>
      </dt>
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
          <HelpEntry abbreviation="A" definition="Archaeology" />
          <HelpEntry abbreviation="Ac" definition="Acquisition" />
          <HelpEntry abbreviation="S" definition="Seal" />
        </dl>
      </Popover.Content>
    </Popover>
  )
}

export function ReferencesHelp({
  className,
}: {
  className?: string
}): JSX.Element {
  return (
    <span className={classnames('references-help', className)}>
      <HelpTrigger overlay={HelpOverlay()} />
    </span>
  )
}
