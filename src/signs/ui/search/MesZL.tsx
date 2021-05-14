import { OverlayTrigger, Popover } from 'react-bootstrap'
import _ from 'lodash'
import React from 'react'
import './Signs.css'
import { Markdown } from 'dictionary/ui/display/WordDisplayParts'

export default function MesZL({ mesZl }: { mesZl: string }): JSX.Element {
  const mesZlFormatted = mesZl
    .replace(/\n/g, '  \n')
    .replace(/\[/g, '\\[')
    .replace(/]/g, '\\]')
  const popover = (
    <Popover
      id={_.uniqueId('Citation-')}
      className="ReferenceList__popover MesZL--popover"
    >
      <Popover.Content>
        <Markdown
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
        <span className="ReferenceList__citation">MesZL</span>
      </OverlayTrigger>
    </>
  )
}
