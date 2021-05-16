import { OverlayTrigger, Popover } from 'react-bootstrap'
import _ from 'lodash'
import React from 'react'
import './Signs.css'
import { Markdown } from 'dictionary/ui/display/WordDisplayParts'

export default function MesZL({
  mesZl,
  mesZlNumber,
}: {
  mesZl: string
  mesZlNumber: string | undefined
}): JSX.Element {
  const mesZlLines = mesZl.split('\n')
  const mesZlRest = mesZlLines.slice()
  mesZlRest.shift()
  const mesZlFormatted = mesZlRest
    .join('  \n')
    .replace(/\[/g, '\\[')
    .replace(/]/g, '\\]')
  console.log(mesZlNumber)
  const formattedNumber = mesZlNumber ? ` ${mesZlNumber}` : ''
  const popover = (
    <Popover
      id={_.uniqueId('Citation-')}
      className="ReferenceList__popover MesZL--popover"
    >
      <Popover.Content>
        <Markdown className="text-center" text={mesZlLines[0]} />
        <Markdown
          isReplaceCurlyQuotes={false}
          className={'text-justify MesZL'}
          paragraph={'p'}
          text={mesZlFormatted}
          skipHtml={true}
        />
      </Popover.Content>
    </Popover>
  )
  return (
    <>
      &nbsp;&mdash;&nbsp;
      <OverlayTrigger
        rootClose
        overlay={popover}
        trigger={['hover', 'focus']}
        placement="right"
      >
        <span className="ReferenceList__citation border border-dark p-1">
          MesZL{formattedNumber}
        </span>
      </OverlayTrigger>
    </>
  )
}
