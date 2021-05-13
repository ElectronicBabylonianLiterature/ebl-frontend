import { OverlayTrigger, Popover } from 'react-bootstrap'
import _ from 'lodash'
import React from 'react'
import './Signs.css'
import ReactMarkdown from 'react-markdown'

export default function MesZL({ mesZl }: { mesZl: string }): JSX.Element {
  const popover = (
    <Popover id={_.uniqueId('Citation-')} className="ReferenceList__popover">
      <Popover.Content>
        <ReactMarkdown
          className="CuneiformFont"
          source={mesZl.replaceAll('\n', '  \n')}
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
