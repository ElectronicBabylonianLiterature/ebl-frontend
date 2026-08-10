import React, { memo } from 'react'
import { Overlay, Popover } from 'react-bootstrap'

const InlineEditor = memo(function InlineEditor({
  target,
  show,
  onHide,
  onEntered,
  id,
  title,
  children,
}: {
  target: HTMLElement | null
  show: boolean
  onHide: () => void
  onEntered: () => void
  id: string
  title: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <Overlay
      target={target}
      show={show && !!target}
      placement={'top'}
      rootClose
      onHide={onHide}
      onEntered={onEntered}
    >
      <Popover id={id} className={'text-annotation__editor-popover'}>
        <Popover.Header>{title}</Popover.Header>
        <Popover.Body>{children}</Popover.Body>
      </Popover>
    </Overlay>
  )
})

export default InlineEditor
